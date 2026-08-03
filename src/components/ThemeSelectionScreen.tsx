import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { FiArrowLeft, FiRefreshCw } from 'react-icons/fi';
import type { Theme } from '../types';

const CATEGORY_EMOJIS: Record<string, string> = {
  'Géographie': '🌍',
  'Sport': '⚽',
  'Cinéma & Séries': '🎬',
  'Musique': '🎵',
  'Histoire & Politique': '🏛️',
  'Sciences & Nature': '🔬',
  'Littérature & BD': '📚',
  'Jeux & Jeux vidéo': '🎮',
  'Mythologie & Religion': '⚡',
  'Langue & Alphabets': '🔤',
  'Culture générale & Vie quotidienne': '💡',
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

  const getPool = () => {
    const filtered = themes.filter(t => {
      const matchesDifficulty = !settings.difficultyFilter || t.difficulty === settings.difficultyFilter;
      const matchesCategory = !settings.categoryFilter || t.category === settings.categoryFilter;
      return matchesDifficulty && matchesCategory;
    });
    const unplayed = filtered.filter(t => !playedThemeIds.includes(t.id));
    return unplayed.length >= 3 ? unplayed : filtered;
  };

  const [choices, setChoices] = useState<Theme[]>(() => pickRandom(getPool(), 3));

  const reroll = () => setChoices(pickRandom(getPool(), 3));

  // Who chooses? Round 1: the host. After: the player with the lowest score from last round.
  const isFirstRound = currentRound === 1;
  const lowestScorer = !isFirstRound && players.length > 0
    ? players.reduce((min, p) => (p.correctAnswers < min.correctAnswers ? p : min), players[0]!)
    : null;

  const difficultyStyle: Record<string, string> = {
    facile: 'text-lime bg-lime/10 border-lime/30',
    moyen: 'text-gold bg-gold/10 border-gold/30',
    difficile: 'text-pinkish bg-pinkish/10 border-pinkish/30',
  };

  return (
    <div className="min-h-screen flex flex-col p-5 max-w-md mx-auto pb-safe">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={resetGame}
          className="w-10 h-10 rounded-xl bg-panel-light flex items-center justify-center active:scale-90 transition-transform"
        >
          <FiArrowLeft className="text-lg" />
        </button>
        <div>
          <h1 className="font-display text-xl text-gold">Choix du thème</h1>
          <p className="text-xs font-bold text-slate-500">Manche {currentRound}/{settings.totalRounds}</p>
        </div>
      </div>

      {/* Who chooses */}
      <div className="rounded-2xl border-2 border-electric bg-electric/10 py-4 px-4 text-center mb-6 animate-pop-in">
        {isFirstRound ? (
          <>
            <p className="text-3xl mb-1">🎲</p>
            <p className="font-extrabold text-electric text-lg">L'arbitre choisit le premier thème</p>
          </>
        ) : (
          <>
            <p className="text-3xl mb-1">🎯</p>
            <p className="font-extrabold text-electric text-lg">
              {lowestScorer?.name} choisit le thème
            </p>
            <p className="text-xs font-bold text-slate-400 mt-1">
              Score le plus bas de la manche précédente ({lowestScorer?.correctAnswers} pt{(lowestScorer?.correctAnswers ?? 0) > 1 ? 's' : ''})
            </p>
          </>
        )}
      </div>

      {/* 3 theme choices */}
      <div className="flex-1 space-y-3">
        {choices.map((theme, i) => (
          <button
            key={theme.id}
            onClick={() => startGame(theme)}
            className="w-full text-left p-4 rounded-2xl bg-panel border-2 border-white/10 active:scale-[0.98] active:border-gold/50 transition-all animate-fade-in"
            style={{ animationDelay: `${i * 0.1}s` }}
          >
            <div className="flex items-start gap-3">
              <span className="text-3xl mt-0.5">{CATEGORY_EMOJIS[theme.category] ?? '🎯'}</span>
              <div className="flex-1 min-w-0">
                <p className="font-extrabold text-base leading-snug mb-1.5">
                  {theme.title}
                </p>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-slate-500">{theme.category}</span>
                  <span className="text-xs font-extrabold px-2 py-0.5 rounded-full bg-panel-light text-slate-300">
                    {theme.answers.length} réponses
                  </span>
                  <span className={`text-xs font-extrabold px-2 py-0.5 rounded-full border capitalize ${difficultyStyle[theme.difficulty]}`}>
                    {theme.difficulty}
                  </span>
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Reroll */}
      <button
        onClick={reroll}
        className="mt-4 py-3.5 rounded-2xl bg-panel-light font-extrabold text-slate-300 flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
      >
        <FiRefreshCw /> Proposer 3 autres thèmes
      </button>
    </div>
  );
}
