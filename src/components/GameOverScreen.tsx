import { useGameStore } from '../store/gameStore';
import { FiHome, FiSkipForward } from 'react-icons/fi';

const CONFETTI_EMOJIS = ['🎉', '🎊', '⭐', '✨', '🏆'];

export default function GameOverScreen() {
  const { players, currentTheme, validatedAnswers, nextRound, resetGame, currentRound, settings } = useGameStore();

  if (!currentTheme) return null;

  const activePlayers = players.filter(p => !p.isEliminated);
  const allFound = validatedAnswers.length === currentTheme.answers.length;
  const winner = activePlayers.length === 1 ? activePlayers[0] : null;
  const isLastRound = currentRound >= settings.totalRounds;
  const sortedPlayers = [...players].sort((a, b) => b.correctAnswers - a.correctAnswers);
  const missedAnswers = currentTheme.answers.filter(a => !validatedAnswers.includes(a));

  return (
    <div className="min-h-screen flex flex-col p-5 max-w-md mx-auto pb-safe relative overflow-hidden">
      {/* Confetti */}
      {(allFound || winner) && CONFETTI_EMOJIS.map((emoji, i) =>
        Array.from({ length: 3 }).map((_, j) => (
          <span
            key={`${i}-${j}`}
            className="confetti"
            style={{
              left: `${(i * 20 + j * 7 + 5) % 95}%`,
              animationDuration: `${2.5 + (i + j) * 0.4}s`,
              animationDelay: `${(i * 0.3 + j * 0.5)}s`,
            }}
          >
            {emoji}
          </span>
        ))
      )}

      {/* Round badge */}
      <div className="text-center mt-6 mb-2">
        <span className="px-4 py-1.5 bg-panel-light rounded-full text-sm font-extrabold text-slate-400">
          Manche {currentRound}/{settings.totalRounds}
        </span>
      </div>

      {/* Result */}
      <div className="text-center mb-6 animate-pop-in">
        <div className="text-7xl mb-3 animate-bounce-subtle">
          {allFound ? '🎉' : winner ? '🏆' : '🏁'}
        </div>
        {allFound ? (
          <>
            <h1 className="font-display text-3xl text-gold mb-1">Incroyable !</h1>
            <p className="text-slate-400 font-bold">Toutes les {validatedAnswers.length} réponses trouvées !</p>
          </>
        ) : winner ? (
          <>
            <h1 className="font-display text-3xl text-gold mb-1">{winner.name} gagne !</h1>
            <p className="text-slate-400 font-bold">
              Dernier debout • {validatedAnswers.length}/{currentTheme.answers.length} réponses trouvées
            </p>
          </>
        ) : (
          <>
            <h1 className="font-display text-3xl text-gold mb-1">Fin de manche</h1>
            <p className="text-slate-400 font-bold">
              {validatedAnswers.length}/{currentTheme.answers.length} réponses trouvées
            </p>
          </>
        )}
      </div>

      {/* Scoreboard */}
      <div className="bg-panel/70 rounded-2xl p-4 mb-4 border border-white/5">
        <div className="space-y-2">
          {sortedPlayers.map((player, idx) => (
            <div
              key={player.id}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl ${
                idx === 0
                  ? 'bg-gold/15 border border-gold/30'
                  : 'bg-night-deep/50'
              }`}
            >
              <span className="text-xl w-8">
                {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `${idx + 1}`}
              </span>
              <span className={`flex-1 font-extrabold ${player.isEliminated ? 'text-slate-500 line-through' : ''}`}>
                {player.name}
              </span>
              <span className="font-extrabold text-gold text-sm">{player.correctAnswers} pts</span>
              <span className="text-sm">{player.isEliminated ? '💀' : '❤️'}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Missed answers */}
      {missedAnswers.length > 0 && (
        <div className="bg-panel/70 rounded-2xl p-4 mb-4 border border-white/5">
          <p className="text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-2">
            Réponses manquées ({missedAnswers.length})
          </p>
          <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto scrollbar-thin">
            {missedAnswers.map(a => (
              <span key={a} className="px-2.5 py-1 rounded-lg bg-danger/15 text-red-300 text-xs font-bold border border-danger/20">
                {a}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="mt-auto space-y-3 pt-2">
        {!isLastRound ? (
          <button
            onClick={nextRound}
            className="w-full py-4 bg-gradient-to-b from-gold-bright to-gold text-night rounded-2xl font-display text-xl shadow-xl shadow-gold/30 active:scale-[0.97] transition-transform flex items-center justify-center gap-2"
          >
            <FiSkipForward /> Manche suivante
          </button>
        ) : (
          <div className="text-center py-4 bg-gold/10 rounded-2xl border border-gold/30">
            <p className="font-display text-xl text-gold">🎊 Partie terminée !</p>
          </div>
        )}
        <button
          onClick={resetGame}
          className="w-full py-3.5 bg-panel-light rounded-2xl font-extrabold text-slate-300 active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
        >
          <FiHome /> Accueil
        </button>
      </div>
    </div>
  );
}
