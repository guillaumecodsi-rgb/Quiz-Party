import { useState } from 'react';
import { useGameStore, generateId } from '../store/gameStore';
import { FiPlus, FiMinus, FiSettings, FiList, FiBarChart2 } from 'react-icons/fi';

const BORDER_COLORS = [
  'border-electric focus-within:ring-electric/40',
  'border-pinkish focus-within:ring-pinkish/40',
  'border-lime focus-within:ring-lime/40',
  'border-gold focus-within:ring-gold/40',
  'border-violet-400 focus-within:ring-violet-400/40',
  'border-orange-400 focus-within:ring-orange-400/40',
  'border-teal-400 focus-within:ring-teal-400/40',
  'border-rose-400 focus-within:ring-rose-400/40',
];

const TEXT_COLORS = [
  'text-electric placeholder-electric/40',
  'text-pinkish placeholder-pinkish/40',
  'text-lime placeholder-lime/40',
  'text-gold placeholder-gold/40',
  'text-violet-400 placeholder-violet-400/40',
  'text-orange-400 placeholder-orange-400/40',
  'text-teal-400 placeholder-teal-400/40',
  'text-rose-400 placeholder-rose-400/40',
];

const ROUND_OPTIONS = [1, 3, 5, 7];

export default function HomeScreen() {
  const { players, setPlayers, setPhase, settings, updateSettings } = useGameStore();

  const [names, setNames] = useState<string[]>(() => {
    if (players.length >= 2) return players.map(p => p.name);
    return ['', ''];
  });

  const updateName = (index: number, value: string) => {
    setNames(prev => prev.map((n, i) => (i === index ? value : n)));
  };

  const addSlot = () => {
    if (names.length < 8) setNames(prev => [...prev, '']);
  };

  const removeSlot = () => {
    if (names.length > 2) setNames(prev => prev.slice(0, -1));
  };

  const handlePlay = () => {
    const finalNames = names.map((n, i) => n.trim() || `Joueur ${i + 1}`);
    setPlayers(finalNames.map(name => ({
      id: generateId(),
      name,
      lives: settings.maxMistakes,
      isEliminated: false,
      correctAnswers: 0,
    })));
    setPhase('theme-selection');
  };

  return (
    <div className="min-h-screen flex flex-col p-5 max-w-md mx-auto pb-safe">
      {/* Title */}
      <div className="text-center mt-8 mb-6 animate-fade-in">
        <h1 className="font-display text-5xl text-gold drop-shadow-[0_3px_0_rgba(0,0,0,0.4)]">
          Quiz Party
        </h1>
        <p className="text-violet-400 font-bold tracking-[0.3em] text-sm mt-2 uppercase">
          Mode Arbitre
        </p>
      </div>

      {/* Rules card */}
      <div className="bg-panel/80 backdrop-blur rounded-2xl p-4 mb-6 animate-fade-in border border-white/5">
        <p className="font-extrabold text-gold mb-2 flex items-center gap-2">
          ⚡ Règles rapides :
        </p>
        <ul className="space-y-1.5 text-[15px] text-slate-300 font-semibold">
          <li className="flex gap-2"><span>•</span> Un thème s'affiche avec une liste de réponses</li>
          <li className="flex gap-2"><span>•</span> Les joueurs répondent à voix haute, chacun leur tour</li>
          <li className="flex gap-2"><span>•</span> L'arbitre valide ou signale les erreurs</li>
          <li className="flex gap-2"><span>•</span> {settings.maxMistakes} erreur{settings.maxMistakes > 1 ? 's' : ''} = éliminé !</li>
          <li className="flex gap-2"><span>•</span> Le dernier debout gagne la manche</li>
        </ul>
      </div>

      {/* Players */}
      <div className="mb-6 animate-fade-in">
        <div className="flex items-center justify-between mb-3">
          <p className="text-slate-400 font-extrabold tracking-widest text-sm uppercase">
            Joueurs ({names.length})
          </p>
          <div className="flex gap-2">
            <button
              onClick={removeSlot}
              disabled={names.length <= 2}
              className="w-9 h-9 rounded-xl bg-panel-light text-slate-300 flex items-center justify-center font-bold disabled:opacity-30 active:scale-90 transition-transform"
            >
              <FiMinus />
            </button>
            <button
              onClick={addSlot}
              disabled={names.length >= 8}
              className="w-9 h-9 rounded-xl bg-gold text-night flex items-center justify-center font-bold disabled:opacity-30 active:scale-90 transition-transform shadow-lg shadow-gold/20"
            >
              <FiPlus />
            </button>
          </div>
        </div>

        <div className="space-y-2.5">
          {names.map((name, i) => (
            <div
              key={i}
              className={`rounded-2xl border-2 bg-night-deep/60 focus-within:ring-4 transition-all ${BORDER_COLORS[i % BORDER_COLORS.length]}`}
            >
              <input
                type="text"
                value={name}
                onChange={(e) => updateName(i, e.target.value)}
                placeholder={`Joueur ${i + 1}`}
                maxLength={16}
                className={`w-full bg-transparent px-4 py-3.5 text-center font-extrabold text-lg outline-none ${TEXT_COLORS[i % TEXT_COLORS.length]}`}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Rounds */}
      <div className="mb-6 animate-fade-in">
        <p className="text-center text-slate-400 font-extrabold tracking-widest text-sm uppercase mb-3">
          Nombre de manches
        </p>
        <div className="flex justify-center gap-3">
          {ROUND_OPTIONS.map(n => (
            <button
              key={n}
              onClick={() => updateSettings({ totalRounds: n })}
              className={`w-14 h-12 rounded-xl font-display text-xl transition-all active:scale-90 ${
                settings.totalRounds === n
                  ? 'bg-gold text-night shadow-lg shadow-gold/30 scale-110'
                  : 'bg-panel-light text-slate-400'
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      {/* Lives selector */}
      <div className="bg-panel/60 rounded-2xl px-4 py-3 mb-6 flex items-center justify-between animate-fade-in border border-white/5">
        <span className="font-bold text-slate-300">❤️ Vies par joueur</span>
        <div className="flex gap-1.5">
          {[1, 2, 3].map(n => (
            <button
              key={n}
              onClick={() => updateSettings({ maxMistakes: n })}
              className={`w-9 h-9 rounded-lg font-extrabold transition-all active:scale-90 ${
                settings.maxMistakes === n
                  ? 'bg-gold text-night'
                  : 'bg-panel-light text-slate-400'
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      {/* Play button */}
      <button
        onClick={handlePlay}
        className="w-full py-5 bg-gradient-to-b from-gold-bright to-gold text-night rounded-2xl font-display text-2xl shadow-xl shadow-gold/30 active:scale-[0.97] transition-transform animate-glow-gold mb-6"
      >
        ⚡ Jouer
      </button>

      {/* Secondary nav */}
      <div className="grid grid-cols-3 gap-3 mt-auto">
        <button
          onClick={() => setPhase('settings')}
          className="py-3 rounded-xl bg-panel/60 border border-white/5 flex flex-col items-center gap-1 active:scale-95 transition-transform"
        >
          <FiSettings className="text-gold" />
          <span className="text-xs font-bold text-slate-400">Options</span>
        </button>
        <button
          onClick={() => setPhase('theme-manager')}
          className="py-3 rounded-xl bg-panel/60 border border-white/5 flex flex-col items-center gap-1 active:scale-95 transition-transform"
        >
          <FiList className="text-electric" />
          <span className="text-xs font-bold text-slate-400">Thèmes</span>
        </button>
        <button
          onClick={() => setPhase('stats')}
          className="py-3 rounded-xl bg-panel/60 border border-white/5 flex flex-col items-center gap-1 active:scale-95 transition-transform"
        >
          <FiBarChart2 className="text-pinkish" />
          <span className="text-xs font-bold text-slate-400">Stats</span>
        </button>
      </div>
    </div>
  );
}
