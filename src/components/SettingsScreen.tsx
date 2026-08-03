import { useGameStore } from '../store/gameStore';
import { FiArrowLeft } from 'react-icons/fi';

function Toggle({ value, onChange }: { value: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className={`w-14 h-8 rounded-full transition-colors relative flex-shrink-0 ${
        value ? 'bg-gold' : 'bg-panel-light'
      }`}
    >
      <span className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow-md transition-transform ${
        value ? 'translate-x-7' : 'translate-x-1'
      }`} />
    </button>
  );
}

export default function SettingsScreen() {
  const { settings, updateSettings, setPhase, themes } = useGameStore();
  const categories = [...new Set(themes.map(t => t.category))];

  return (
    <div className="min-h-screen flex flex-col p-5 max-w-md mx-auto pb-safe">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => setPhase('home')}
          className="w-10 h-10 rounded-xl bg-panel-light flex items-center justify-center active:scale-90 transition-transform"
        >
          <FiArrowLeft className="text-lg" />
        </button>
        <h1 className="font-display text-xl text-gold">Options</h1>
      </div>

      <div className="space-y-4">
        {/* Show validated */}
        <div className="bg-panel/70 rounded-2xl p-4 border border-white/5 flex items-center justify-between gap-4">
          <div>
            <p className="font-extrabold">👀 Afficher les réponses trouvées</p>
            <p className="text-xs font-bold text-slate-500 mt-0.5">Les réponses validées restent visibles en vert</p>
          </div>
          <Toggle
            value={settings.showValidatedAnswers}
            onChange={() => updateSettings({ showValidatedAnswers: !settings.showValidatedAnswers })}
          />
        </div>

        {/* Reshuffle */}
        <div className="bg-panel/70 rounded-2xl p-4 border border-white/5 flex items-center justify-between gap-4">
          <div>
            <p className="font-extrabold">🔀 Mélanger l'ordre chaque manche</p>
            <p className="text-xs font-bold text-slate-500 mt-0.5">L'ordre des joueurs change à chaque thème</p>
          </div>
          <Toggle
            value={settings.reshuffleEveryRound}
            onChange={() => updateSettings({ reshuffleEveryRound: !settings.reshuffleEveryRound })}
          />
        </div>

        {/* Difficulty filter */}
        <div className="bg-panel/70 rounded-2xl p-4 border border-white/5">
          <p className="font-extrabold mb-3">🎯 Difficulté des thèmes</p>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => updateSettings({ difficultyFilter: null })}
              className={`px-4 py-2 rounded-xl font-extrabold text-sm transition-all active:scale-95 ${
                !settings.difficultyFilter ? 'bg-gold text-night' : 'bg-panel-light text-slate-400'
              }`}
            >
              Toutes
            </button>
            {['facile', 'moyen', 'difficile'].map(d => (
              <button
                key={d}
                onClick={() => updateSettings({ difficultyFilter: d === settings.difficultyFilter ? null : d })}
                className={`px-4 py-2 rounded-xl font-extrabold text-sm capitalize transition-all active:scale-95 ${
                  settings.difficultyFilter === d ? 'bg-gold text-night' : 'bg-panel-light text-slate-400'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* Category filter */}
        <div className="bg-panel/70 rounded-2xl p-4 border border-white/5">
          <p className="font-extrabold mb-3">📂 Catégories</p>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => updateSettings({ categoryFilter: null })}
              className={`px-3.5 py-2 rounded-xl font-extrabold text-sm transition-all active:scale-95 ${
                !settings.categoryFilter ? 'bg-gold text-night' : 'bg-panel-light text-slate-400'
              }`}
            >
              Toutes
            </button>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => updateSettings({ categoryFilter: cat === settings.categoryFilter ? null : cat })}
                className={`px-3.5 py-2 rounded-xl font-extrabold text-sm transition-all active:scale-95 ${
                  settings.categoryFilter === cat ? 'bg-gold text-night' : 'bg-panel-light text-slate-400'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
