import { create } from 'zustand';
import type { Theme, Player, GameSettings, GameStats, GamePhase } from '../types';
import { defaultThemes } from '../data/themes';

interface GameState {
  phase: GamePhase;
  players: Player[];
  currentPlayerIndex: number;
  currentTheme: Theme | null;
  validatedAnswers: string[];
  lastAction: { type: 'correct' | 'wrong' | 'eliminated'; playerName: string; answer?: string } | null;
  actionHistory: { type: 'validate'; answer: string; playerIndex: number }[];
  settings: GameSettings;
  themes: Theme[];
  stats: GameStats;
  currentRound: number;
  playedThemeIds: string[];

  setPhase: (phase: GamePhase) => void;
  setPlayers: (players: Player[]) => void;
  startGame: (theme: Theme) => void;
  validateAnswer: (answer: string) => void;
  markWrong: () => void;
  undoLastValidation: () => void;
  nextRound: () => void;
  resetGame: () => void;
  updateSettings: (settings: Partial<GameSettings>) => void;
  addTheme: (theme: Theme) => void;
  updateTheme: (id: string, theme: Partial<Theme>) => void;
  deleteTheme: (id: string) => void;
  duplicateTheme: (id: string) => void;
  importThemes: (themes: Theme[]) => void;
  resetThemes: () => void;
}

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  } catch {
    return fallback;
  }
}

function saveToStorage(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch { /* ignore */ }
}

const defaultSettings: GameSettings = {
  maxMistakes: 2,
  showValidatedAnswers: true,
  reshuffleEveryRound: true,
  themeSelection: 'random',
  difficultyFilter: null,
  categoryFilter: null,
  totalRounds: 3,
};

const defaultStats: GameStats = {
  gamesPlayed: 0,
  wins: 0,
  survivalPercentage: 0,
  longestWinStreak: 0,
  currentWinStreak: 0,
  totalCorrectAnswers: 0,
};

export const generateId = () => Math.random().toString(36).substring(2, 9);

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = a[i]!;
    a[i] = a[j]!;
    a[j] = temp;
  }
  return a;
}

export const useGameStore = create<GameState>((set, get) => ({
  phase: 'home',
  players: loadFromStorage<Player[]>('quizparty-players', []),
  currentPlayerIndex: 0,
  currentTheme: null,
  validatedAnswers: [],
  lastAction: null,
  actionHistory: [],
  settings: loadFromStorage('quizparty-settings', defaultSettings),
  themes: loadFromStorage('quizparty-themes-v2', defaultThemes),
  stats: loadFromStorage('quizparty-stats', defaultStats),
  currentRound: 1,
  playedThemeIds: [],

  setPhase: (phase) => set({ phase }),

  setPlayers: (players) => {
    saveToStorage('quizparty-players', players);
    set({ players });
  },

  startGame: (theme) => {
    const { settings, players } = get();
    let resetPlayers = players.map(p => ({
      ...p,
      lives: settings.maxMistakes,
      isEliminated: false,
      correctAnswers: 0,
    }));
    if (settings.reshuffleEveryRound) {
      resetPlayers = shuffleArray(resetPlayers);
    }
    set({
      phase: 'playing',
      currentTheme: theme,
      players: resetPlayers,
      currentPlayerIndex: 0,
      validatedAnswers: [],
      lastAction: null,
      actionHistory: [],
    });
  },

  validateAnswer: (answer) => {
    const { validatedAnswers, currentPlayerIndex, players, currentTheme, actionHistory } = get();
    if (validatedAnswers.includes(answer)) return;

    const newValidated = [...validatedAnswers, answer];
    const newPlayers = players.map((p, i) =>
      i === currentPlayerIndex ? { ...p, correctAnswers: p.correctAnswers + 1 } : p
    );
    const currentName = players[currentPlayerIndex]?.name ?? '';
    const newHistory = [...actionHistory, { type: 'validate' as const, answer, playerIndex: currentPlayerIndex }];

    if (currentTheme && newValidated.length === currentTheme.answers.length) {
      const stats = get().stats;
      const newStats = { ...stats, gamesPlayed: stats.gamesPlayed + 1, totalCorrectAnswers: stats.totalCorrectAnswers + 1 };
      saveToStorage('quizparty-stats', newStats);
      set({
        validatedAnswers: newValidated, players: newPlayers,
        lastAction: { type: 'correct', playerName: currentName, answer },
        actionHistory: newHistory, phase: 'game-over', stats: newStats,
      });
      return;
    }

    let nextIndex = currentPlayerIndex;
    do {
      nextIndex = (nextIndex + 1) % newPlayers.length;
    } while (newPlayers[nextIndex]?.isEliminated && nextIndex !== currentPlayerIndex);

    set({
      validatedAnswers: newValidated, players: newPlayers, currentPlayerIndex: nextIndex,
      lastAction: { type: 'correct', playerName: currentName, answer }, actionHistory: newHistory,
    });
  },

  markWrong: () => {
    const { currentPlayerIndex, players } = get();
    const current = players[currentPlayerIndex];
    if (!current) return;

    const newLives = current.lives - 1;
    const isEliminated = newLives <= 0;
    const actionType: 'wrong' | 'eliminated' = isEliminated ? 'eliminated' : 'wrong';

    const newPlayers = players.map((p, i) =>
      i === currentPlayerIndex ? { ...p, lives: newLives, isEliminated } : p
    );

    const activePlayers = newPlayers.filter(p => !p.isEliminated);
    if (activePlayers.length <= 1) {
      const stats = get().stats;
      const newStats = { ...stats, gamesPlayed: stats.gamesPlayed + 1 };
      saveToStorage('quizparty-stats', newStats);
      set({ players: newPlayers, lastAction: { type: actionType, playerName: current.name }, phase: 'game-over', stats: newStats });
      return;
    }

    let nextIndex = currentPlayerIndex;
    do {
      nextIndex = (nextIndex + 1) % newPlayers.length;
    } while (newPlayers[nextIndex]?.isEliminated);

    set({ players: newPlayers, currentPlayerIndex: nextIndex, lastAction: { type: actionType, playerName: current.name } });
  },

  undoLastValidation: () => {
    const { actionHistory, validatedAnswers, players } = get();
    const lastAction = actionHistory[actionHistory.length - 1];
    if (!lastAction) return;

    const newHistory = actionHistory.slice(0, -1);
    const newValidated = validatedAnswers.filter(a => a !== lastAction.answer);
    const newPlayers = players.map((p, i) =>
      i === lastAction.playerIndex ? { ...p, correctAnswers: p.correctAnswers - 1 } : p
    );

    set({ actionHistory: newHistory, validatedAnswers: newValidated, players: newPlayers, currentPlayerIndex: lastAction.playerIndex, lastAction: null });
  },

  nextRound: () => {
    const { currentRound, currentTheme, playedThemeIds } = get();
    const newPlayed = currentTheme ? [...playedThemeIds, currentTheme.id] : playedThemeIds;
    set({ phase: 'theme-selection', validatedAnswers: [], lastAction: null, actionHistory: [], currentRound: currentRound + 1, playedThemeIds: newPlayed });
  },

  resetGame: () => {
    set({ phase: 'home', currentTheme: null, validatedAnswers: [], lastAction: null, actionHistory: [], currentPlayerIndex: 0, currentRound: 1, playedThemeIds: [] });
  },

  updateSettings: (newSettings) => {
    const settings = { ...get().settings, ...newSettings };
    saveToStorage('quizparty-settings', settings);
    set({ settings });
  },

  addTheme: (theme) => {
    const themes = [...get().themes, { ...theme, id: generateId() }];
    saveToStorage('quizparty-themes-v2', themes);
    set({ themes });
  },

  updateTheme: (id, updates) => {
    const themes = get().themes.map(t => t.id === id ? { ...t, ...updates } : t);
    saveToStorage('quizparty-themes-v2', themes);
    set({ themes });
  },

  deleteTheme: (id) => {
    const themes = get().themes.filter(t => t.id !== id);
    saveToStorage('quizparty-themes-v2', themes);
    set({ themes });
  },

  duplicateTheme: (id) => {
    const theme = get().themes.find(t => t.id === id);
    if (theme) {
      const themes = [...get().themes, { ...theme, id: generateId(), title: `${theme.title} (copie)` }];
      saveToStorage('quizparty-themes-v2', themes);
      set({ themes });
    }
  },

  importThemes: (newThemes) => {
    const themes = [...get().themes, ...newThemes.map(t => ({ ...t, id: generateId() }))];
    saveToStorage('quizparty-themes-v2', themes);
    set({ themes });
  },

  resetThemes: () => {
    saveToStorage('quizparty-themes-v2', defaultThemes);
    set({ themes: defaultThemes });
  },
}));
