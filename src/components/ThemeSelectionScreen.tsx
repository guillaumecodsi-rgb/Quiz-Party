import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { FiArrowLeft, FiRefreshCw } from 'react-icons/fi';
import type { Theme } from '../types';

const CATEGORY_STYLE: Record<string, { emoji: string; bg: string }> = {
  'Géographie': { emoji: '🌍', bg: 'bg-sky-500/20' },
  'Sport': { emoji: '⚽', bg: 'bg-lime/20' },
  'Cinéma & Séries': { emoji: '🎬', bg: 'bg-pinkish/20' },
  'Musique': { emoji: '🎵', bg: 'bg-violet-500/20' },
  'Histoire & Politique': { emoji: '🏛️', bg: 'bg-amber-500/20' },
  'Sciences & Nature': { emoji: '🔬', bg: 'bg-teal-500/20' },
  'Littérature & BD': { emoji: '📚', bg: 'bg-orange-500/20' },
  'Jeux & Jeux vidéo': { emoji: '🎮', bg: 'bg-indigo-500/20' },
  'Mythologie & Religion': { emoji: '⚡', bg: 'bg-yellow-500/20' },
  'Langue & Alphabets': { emoji: '🔤', bg: 'bg-cyan-500/20' },
  'Culture générale & Vie quotidienne': { emoji: '💡', bg: 'bg-rose-500/20' },
};

function pickRandom<T>(pool: T[], n: number): T[] {
  const copy = [...pool];
  const result: T[] = [];
  while (result.length < n && copy.length > 0) {
    const idx = Math.floor(Math.random() * copy.length);
    result.push(copy[idx]!);
    copy.splice(idx, 1);
  }
  return result;
}

/** Pick n themes maximizing category diversity: one theme per category first, then fill randomly. */
function pickDiverse(pool: Theme[], n: number): Theme[] {
  const byCategory = new Map<string, Theme[]>();
  for (const t of pool) {
    const list = byCategory.get(t.category) ?? [];
    list.push(t);
    byCategory.set(t.category, list);
  }
  const categories = pickRandom([...byCategory.keys()], byCategory.size);
  const result: Theme[] = [];
  for (const cat of categories) {
    if (result.length >= n) break;
    const themes = byCategory.get(cat)!;
    const picked = themes[Math.floor(Math.random() * themes.length)]!;
    result.push(picked);
  }
  if (result.length < n) {
    const remaining = pool.filter(t => !result.some(r => r.id === t.id));
    result.push(...pickRandom(remaining, n - result.length));
  }
  return result;
}

export default function ThemeSelectionScreen() {
  const { themes, settings, startGame, resetGame, playedThemeIds, currentRound, players } = useGameStore();

  const getPool = () => {
    const filtered = themes.filter(t => {
      const matchesDifficulty = !settings.difficultyFilter || t.difficulty === settings.difficultyFilter;
      const matchesCategory = !settings.categoryFilter || t.category === settings.categoryFilter;
      return matchesDifficulty && matchesCategory;
    });
    const unplayed = filtered.filter(t => !playedThemeIds.includes(t.id));
    return unplayed.length >= 5 ? unplayed : filtered;
  };

  const [choices, setChoices] = useState<Theme[]>(() => pickDiverse(getPool(), 5));

  const reroll = () => setChoices(pickDiverse(getPool(), 5));

  const isFirstRound = currentRound === 1;
  const lowestScorer = !isFirstRound && players.length > 0
    ? players.reduce((min, p) => (p.correctAnswers < min.correctAnswers ? p : min), players[0]!)
    : null;

  const difficultyStyle: Record<string, string> = {
    facile: 'text-lime bg-lime/10 border-lime/40',
    moyen: 'text-gold bg-gold/10 border-gold/40',
    difficile: 'text-pinkish bg-pinkish/10 border-pinkish/40',
  };

  return (
    <div className="h-screen flex flex-col p-4 max-w-md mx-auto pb-safe overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 mb-3 flex-shrink-0">
        <button
          onClick={resetGame}
          className="w-10 h-10 rounded-xl bg-panel-light flex items-center justify-center active:scale-90 transition-transform"
        >
          <FiArrowLeft className="text-lg" />
        </button>
        <div className="flex-1">
          <h1 className="font-display text-lg text-gold leading-none">Choix du thème</h1>
          <p className="text-xs font-bold text-slate-500 mt-0.5">Manche {currentRound}/{settings.totalRounds}</p>
        </div>
        <button
          onClick={reroll}
          className="w-10 h-10 rounded-xl bg-panel-light flex items-center justify-center active:scale-90 active:rotate-180 transition-all text-gold"
          title="Proposer 5 autres thèmes"
        >
          <FiRefreshCw className="text-lg" />
        </button>
      </div>

      {/* Who chooses */}
      <div className="rounded-xl border-2 border-electric bg-electric/10 py-2.5 px-4 text-center mb-3 flex-shrink-0 animate-pop-in">
        {isFirstRound ? (
          <p className="font-extrabold text-electric">🎲 L'arbitre choisit le premier thème</p>
        ) : (
          <p className="font-extrabold text-electric">
            🎯 {lowestScorer?.name} choisit <span className="text-slate-400 font-bold text-sm">(score le plus bas)</span>
          </p>
        )}
      </div>

      {/* 5 theme choices — stretch to fill the screen */}
      <div className="flex-1 flex flex-col gap-2.5 min-h-0">
        {choices.map((theme, i) => {
          const cat = CATEGORY_STYLE[theme.category] ?? { emoji: '🎯', bg: 'bg-slate-500/20' };
          return (
            <button
              key={theme.id}
              onClick={() => startGame(theme)}
              className="flex-1 w-full text-left px-4 rounded-2xl bg-panel border-2 border-white/10 active:scale-[0.98] active:border-gold/60 transition-all animate-fade-in flex items-center gap-4 min-h-0"
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              <span className={`w-14 h-14 rounded-2xl ${cat.bg} flex items-center justify-center text-3xl flex-shrink-0`}>
                {cat.emoji}
              </span>
              <div className="flex-1 min-w-0 py-2">
                <p className="font-extrabold text-[16px] leading-snug mb-1.5">
                  {theme.title}
                </p>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-extrabold px-2.5 py-1 rounded-full bg-night-deep/70 text-slate-300">
                    {theme.answers.length} réponses
                  </span>
                  <span className={`text-xs font-extrabold px-2.5 py-1 rounded-full border capitalize ${difficultyStyle[theme.difficulty]}`}>
                    {theme.difficulty}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
