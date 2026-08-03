import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { FiArrowLeft, FiRefreshCw } from 'react-icons/fi';
import type { Theme } from '../types';

const CATEGORY_STYLE: Record<string, { emoji: string; bg: string; border: string }> = {
  'Géographie': { emoji: '🌍', bg: 'bg-sky-500/15', border: 'border-sky-400/40' },
  'Sport': { emoji: '⚽', bg: 'bg-lime/15', border: 'border-lime/40' },
  'Cinéma & Séries': { emoji: '🎬', bg: 'bg-pinkish/15', border: 'border-pinkish/40' },
  'Musique': { emoji: '🎵', bg: 'bg-violet-500/15', border: 'border-violet-400/40' },
  'Histoire & Politique': { emoji: '🏛️', bg: 'bg-amber-500/15', border: 'border-amber-400/40' },
  'Sciences & Nature': { emoji: '🔬', bg: 'bg-teal-500/15', border: 'border-teal-400/40' },
  'Littérature & BD': { emoji: '📚', bg: 'bg-orange-500/15', border: 'border-orange-400/40' },
  'Jeux & Jeux vidéo': { emoji: '🎮', bg: 'bg-indigo-500/15', border: 'border-indigo-400/40' },
  'Mythologie & Religion': { emoji: '⚡', bg: 'bg-yellow-500/15', border: 'border-yellow-400/40' },
  'Langue & Alphabets': { emoji: '🔤', bg: 'bg-cyan-500/15', border: 'border-cyan-400/40' },
  'Culture générale & Vie quotidienne': { emoji: '💡', bg: 'bg-rose-500/15', border: 'border-rose-400/40' },
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

export default function ThemeSelectionScreen() {
  const { themes, settings, startGame, resetGame, playedThemeIds, currentRound, players } = useGameStore();

  /** Themes matching filters, unplayed first. */
  const getAvailableThemes = (): Theme[] => {
    const filtered = themes.filter(t => {
      const matchesDifficulty = !settings.difficultyFilter || t.difficulty === settings.difficultyFilter;
      return matchesDifficulty;
    });
    const unplayed = filtered.filter(t => !playedThemeIds.includes(t.id));
    return unplayed.length > 0 ? unplayed : filtered;
  };

  /** Pick 3 random categories that still have available themes. */
  const pickCategories = (): string[] => {
    const available = getAvailableThemes();
    const categories = [...new Set(available.map(t => t.category))];
    return pickRandom(categories, Math.min(3, categories.length));
  };

  const [categoryChoices, setCategoryChoices] = useState<string[]>(pickCategories);

  const reroll = () => setCategoryChoices(pickCategories());

  const handlePickCategory = (category: string) => {
    const pool = getAvailableThemes().filter(t => t.category === category);
    if (pool.length === 0) return;
    const theme = pool[Math.floor(Math.random() * pool.length)]!;
    startGame(theme);
  };

  const isFirstRound = currentRound === 1;
  const lowestScorer = !isFirstRound && players.length > 0
    ? players.reduce((min, p) => (p.correctAnswers < min.correctAnswers ? p : min), players[0]!)
    : null;

  const availableThemes = getAvailableThemes();

  return (
    <div className="h-screen flex flex-col p-4 max-w-md mx-auto pb-safe overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4 flex-shrink-0">
        <button
          onClick={resetGame}
          className="w-10 h-10 rounded-xl bg-panel-light flex items-center justify-center active:scale-90 transition-transform"
        >
          <FiArrowLeft className="text-lg" />
        </button>
        <div className="flex-1">
          <h1 className="font-display text-lg text-gold leading-none">Choix de la catégorie</h1>
          <p className="text-xs font-bold text-slate-500 mt-0.5">Manche {currentRound}/{settings.totalRounds}</p>
        </div>
        <button
          onClick={reroll}
          className="w-10 h-10 rounded-xl bg-panel-light flex items-center justify-center active:scale-90 active:rotate-180 transition-all text-gold"
          title="Proposer 3 autres catégories"
        >
          <FiRefreshCw className="text-lg" />
        </button>
      </div>

      {/* Who chooses */}
      <div className="rounded-xl border-2 border-electric bg-electric/10 py-3 px-4 text-center mb-4 flex-shrink-0 animate-pop-in">
        {isFirstRound ? (
          <p className="font-extrabold text-electric">🎲 L'arbitre choisit la catégorie</p>
        ) : (
          <p className="font-extrabold text-electric">
            🎯 {lowestScorer?.name} choisit <span className="text-slate-400 font-bold text-sm">(score le plus bas)</span>
          </p>
        )}
        <p className="text-xs font-bold text-slate-400 mt-1">
          Une question surprise sera tirée au hasard dans la catégorie !
        </p>
      </div>

      {/* 3 category cards — stretch to fill the screen */}
      <div className="flex-1 flex flex-col gap-3 min-h-0">
        {categoryChoices.map((category, i) => {
          const style = CATEGORY_STYLE[category] ?? { emoji: '🎯', bg: 'bg-slate-500/15', border: 'border-slate-400/40' };
          const count = availableThemes.filter(t => t.category === category).length;
          return (
            <button
              key={category}
              onClick={() => handlePickCategory(category)}
              className={`flex-1 w-full rounded-3xl ${style.bg} border-2 ${style.border} active:scale-[0.97] transition-all animate-fade-in flex flex-col items-center justify-center gap-2 min-h-0 px-4`}
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <span className="text-5xl">{style.emoji}</span>
              <span className="font-display text-xl text-center leading-tight">
                {category}
              </span>
              <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-night-deep/60 text-slate-300">
                {count} question{count > 1 ? 's' : ''} possible{count > 1 ? 's' : ''}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
