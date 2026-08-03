import { useEffect, useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { FiRotateCcw, FiHome, FiSkipForward, FiX } from 'react-icons/fi';

export default function GameMasterView() {
  const {
    currentTheme, players, currentPlayerIndex, validatedAnswers,
    validateAnswer, markWrong, undoLastValidation, nextRound, resetGame,
    actionHistory, lastAction, currentRound, settings
  } = useGameStore();

  const [toast, setToast] = useState<{ text: string; type: 'ok' | 'ko' } | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!lastAction) return;
    if (lastAction.type === 'correct') {
      setToast({ text: `✅ ${lastAction.answer}`, type: 'ok' });
    } else if (lastAction.type === 'wrong') {
      setToast({ text: `❌ ${lastAction.playerName} perd une vie !`, type: 'ko' });
    } else {
      setToast({ text: `💀 ${lastAction.playerName} est éliminé !`, type: 'ko' });
    }
    const t = setTimeout(() => setToast(null), 1800);
    return () => clearTimeout(t);
  }, [lastAction]);

  if (!currentTheme) return null;

  const currentPlayer = players[currentPlayerIndex];
  const progress = (validatedAnswers.length / currentTheme.answers.length) * 100;
  const sortedAnswers = [...currentTheme.answers].sort((a, b) => a.localeCompare(b, 'fr'));

  return (
    <div className="min-h-screen flex flex-col max-w-md mx-auto">
      {/* ===== Header ===== */}
      <div className="px-4 pt-4 pb-3 sticky top-0 z-20 bg-gradient-to-b from-night via-night/95 to-transparent backdrop-blur-sm">
        <div className="flex items-center justify-between text-slate-400 font-bold text-sm mb-1">
          <span>Manche {currentRound}/{settings.totalRounds}</span>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="px-2 py-0.5 rounded-lg bg-panel-light/60 text-xs active:scale-90 transition-transform"
          >
            •••
          </button>
          <span className="text-gold">{validatedAnswers.length}/{currentTheme.answers.length}</span>
        </div>

        <h1 className="font-display text-xl text-gold text-center leading-tight mb-2">
          {currentTheme.title}
        </h1>

        {/* Progress bar */}
        <div className="h-1.5 bg-panel-light rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-gold to-gold-bright rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Menu dropdown */}
        {menuOpen && (
          <div className="absolute left-1/2 -translate-x-1/2 top-14 bg-card border border-white/10 rounded-2xl shadow-2xl p-2 z-30 animate-slide-down w-56">
            <button
              onClick={() => { undoLastValidation(); setMenuOpen(false); }}
              disabled={actionHistory.length === 0}
              className="w-full px-4 py-3 rounded-xl text-left font-bold text-slate-200 flex items-center gap-3 disabled:opacity-30 active:bg-panel-light"
            >
              <FiRotateCcw className="text-electric" /> Annuler la dernière
            </button>
            <button
              onClick={() => { nextRound(); setMenuOpen(false); }}
              className="w-full px-4 py-3 rounded-xl text-left font-bold text-slate-200 flex items-center gap-3 active:bg-panel-light"
            >
              <FiSkipForward className="text-gold" /> Changer de thème
            </button>
            <button
              onClick={() => { resetGame(); setMenuOpen(false); }}
              className="w-full px-4 py-3 rounded-xl text-left font-bold text-slate-200 flex items-center gap-3 active:bg-panel-light"
            >
              <FiHome className="text-pinkish" /> Quitter la partie
            </button>
          </div>
        )}
      </div>

      {/* ===== Turn banner ===== */}
      <div className="px-4 mb-3">
        <div className="rounded-2xl border-2 border-electric bg-electric/10 py-3 text-center animate-pop-in" key={currentPlayerIndex}>
          <span className="font-extrabold text-electric text-lg">
            🎤 Tour de {currentPlayer?.name}
          </span>
          <span className="ml-2">
            {Array.from({ length: settings.maxMistakes }).map((_, i) => (
              <span key={i} className="text-sm">
                {currentPlayer && i < currentPlayer.lives ? '❤️' : '🖤'}
              </span>
            ))}
          </span>
        </div>
      </div>

      {/* ===== Toast ===== */}
      {toast && (
        <div className={`fixed top-16 left-1/2 -translate-x-1/2 z-40 px-5 py-2.5 rounded-full font-extrabold shadow-2xl animate-pop-in ${
          toast.type === 'ok' ? 'bg-lime text-night' : 'bg-danger text-white'
        }`}>
          {toast.text}
        </div>
      )}

      {/* ===== Answer grid ===== */}
      <div className="flex-1 px-4 overflow-y-auto scrollbar-thin pb-40">
        <div className="grid grid-cols-2 gap-2">
          {sortedAnswers.map(answer => {
            const found = validatedAnswers.includes(answer);
            return (
              <button
                key={answer}
                onClick={() => !found && validateAnswer(answer)}
                disabled={found}
                className={`px-3 py-3.5 rounded-xl text-left text-[15px] font-bold leading-tight transition-all active:scale-95 ${
                  found
                    ? 'bg-lime/15 text-lime border border-lime/30'
                    : 'bg-panel text-slate-200 border border-white/5 active:bg-panel-light'
                }`}
              >
                {found && '✓ '}{answer}
              </button>
            );
          })}
        </div>
      </div>

      {/* ===== Bottom bar ===== */}
      <div className="fixed bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-night-deep via-night-deep/98 to-transparent pt-6 pb-safe">
        <div className="max-w-md mx-auto px-4">
          {/* Player pills */}
          <div className="flex gap-1.5 mb-3 overflow-x-auto scrollbar-thin pb-1">
            {players.map((player, idx) => (
              <div
                key={player.id}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-extrabold flex items-center gap-1.5 ${
                  player.isEliminated
                    ? 'bg-panel/50 text-slate-600 line-through'
                    : idx === currentPlayerIndex
                    ? 'bg-electric text-night'
                    : 'bg-panel-light text-slate-300'
                }`}
              >
                {player.name}
                {!player.isEliminated && (
                  <span className="flex gap-0.5">
                    {Array.from({ length: settings.maxMistakes }).map((_, i) => (
                      <span key={i} className={`w-1.5 h-1.5 rounded-full ${i < player.lives ? 'bg-current' : 'bg-current opacity-25'}`} />
                    ))}
                  </span>
                )}
                {player.isEliminated && '💀'}
              </div>
            ))}
          </div>

          {/* Wrong answer button */}
          <button
            onClick={markWrong}
            className="w-full py-4 bg-gradient-to-b from-red-500 to-red-600 text-white rounded-2xl font-display text-lg shadow-xl shadow-red-500/30 active:scale-[0.97] transition-transform flex items-center justify-center gap-2"
          >
            <FiX className="text-2xl" strokeWidth={3} />
            Mauvaise réponse
          </button>
        </div>
      </div>
    </div>
  );
}
