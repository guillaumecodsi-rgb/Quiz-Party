import { useGameStore } from '../store/gameStore';
import { FiArrowLeft, FiTrash2 } from 'react-icons/fi';

export default function StatsScreen() {
  const { stats, setPhase } = useGameStore();

  const handleReset = () => {
    if (confirm('Réinitialiser toutes les statistiques ?')) {
      localStorage.removeItem('quizparty-stats');
      window.location.reload();
    }
  };

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
        <h1 className="font-display text-xl text-gold">Statistiques</h1>
      </div>

      {/* Hero stat */}
      <div className="bg-gradient-to-b from-gold/20 to-gold/5 rounded-3xl p-6 mb-4 text-center border border-gold/20">
        <p className="font-display text-6xl text-gold">{stats.gamesPlayed}</p>
        <p className="font-extrabold text-slate-400 mt-1 uppercase tracking-wider text-sm">
          Parties jouées
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-panel/70 rounded-2xl p-5 text-center border border-white/5">
          <p className="text-3xl mb-1">🏆</p>
          <p className="font-display text-3xl text-electric">{stats.wins}</p>
          <p className="text-xs font-extrabold text-slate-500 uppercase mt-1">Victoires</p>
        </div>
        <div className="bg-panel/70 rounded-2xl p-5 text-center border border-white/5">
          <p className="text-3xl mb-1">💪</p>
          <p className="font-display text-3xl text-lime">
            {stats.gamesPlayed > 0 ? Math.round((stats.wins / stats.gamesPlayed) * 100) : 0}%
          </p>
          <p className="text-xs font-extrabold text-slate-500 uppercase mt-1">Taux de survie</p>
        </div>
        <div className="bg-panel/70 rounded-2xl p-5 text-center border border-white/5">
          <p className="text-3xl mb-1">🔥</p>
          <p className="font-display text-3xl text-pinkish">{stats.longestWinStreak}</p>
          <p className="text-xs font-extrabold text-slate-500 uppercase mt-1">Meilleure série</p>
        </div>
        <div className="bg-panel/70 rounded-2xl p-5 text-center border border-white/5">
          <p className="text-3xl mb-1">✅</p>
          <p className="font-display text-3xl text-gold">{stats.totalCorrectAnswers}</p>
          <p className="text-xs font-extrabold text-slate-500 uppercase mt-1">Bonnes réponses</p>
        </div>
      </div>

      {/* Reset */}
      <button
        onClick={handleReset}
        className="mt-auto py-3.5 rounded-2xl border border-danger/30 text-red-400 font-extrabold flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
      >
        <FiTrash2 /> Réinitialiser
      </button>
    </div>
  );
}
