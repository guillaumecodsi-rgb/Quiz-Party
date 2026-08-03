export interface Theme {
  id: string;
  title: string;
  category: string;
  difficulty: 'facile' | 'moyen' | 'difficile';
  answers: string[];
}

export interface Player {
  id: string;
  name: string;
  lives: number;
  isEliminated: boolean;
  correctAnswers: number;
}

export interface GameSettings {
  maxMistakes: number;
  showValidatedAnswers: boolean;
  reshuffleEveryRound: boolean;
  themeSelection: 'random' | 'manual';
  difficultyFilter: string | null;
  categoryFilter: string | null;
  totalRounds: number;
}

export interface GameStats {
  gamesPlayed: number;
  wins: number;
  survivalPercentage: number;
  longestWinStreak: number;
  currentWinStreak: number;
  totalCorrectAnswers: number;
}

export type GamePhase =
  | 'home'
  | 'theme-selection'
  | 'playing'
  | 'game-over'
  | 'settings'
  | 'theme-manager'
  | 'stats';
