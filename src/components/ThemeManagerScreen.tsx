import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import type { Theme } from '../types';
import { FiArrowLeft, FiPlus, FiEdit2, FiCopy, FiTrash2, FiDownload, FiUpload, FiRotateCcw } from 'react-icons/fi';

export default function ThemeManagerScreen() {
  const { themes, addTheme, updateTheme, deleteTheme, duplicateTheme, importThemes, resetThemes, setPhase } = useGameStore();
  const [editing, setEditing] = useState<Theme | null>(null);
  const [creating, setCreating] = useState(false);
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [formDifficulty, setFormDifficulty] = useState<'facile' | 'moyen' | 'difficile'>('moyen');
  const [formAnswers, setFormAnswers] = useState('');

  const startCreate = () => {
    setCreating(true);
    setEditing(null);
    setFormTitle('');
    setFormCategory('');
    setFormDifficulty('moyen');
    setFormAnswers('');
  };

  const startEdit = (theme: Theme) => {
    setEditing(theme);
    setCreating(false);
    setFormTitle(theme.title);
    setFormCategory(theme.category);
    setFormDifficulty(theme.difficulty);
    setFormAnswers(theme.answers.join('\n'));
  };

  const handleSave = () => {
    const answers = formAnswers.split('\n').map(a => a.trim()).filter(a => a.length > 0);
    if (!formTitle.trim() || !formCategory.trim() || answers.length < 4) return;

    if (editing) {
      updateTheme(editing.id, {
        title: formTitle.trim(),
        category: formCategory.trim(),
        difficulty: formDifficulty,
        answers,
      });
    } else {
      addTheme({
        id: '',
        title: formTitle.trim(),
        category: formCategory.trim(),
        difficulty: formDifficulty,
        answers,
      });
    }
    setEditing(null);
    setCreating(false);
  };

  const handleExport = () => {
    const data = JSON.stringify(themes, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'quiz-party-themes.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const data = JSON.parse(ev.target?.result as string);
          if (Array.isArray(data)) {
            importThemes(data);
          }
        } catch {
          alert('Fichier JSON invalide');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const isFormOpen = editing || creating;
  const answerCount = formAnswers.split('\n').filter(a => a.trim()).length;

  return (
    <div className="min-h-screen flex flex-col p-5 max-w-md mx-auto pb-safe">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <button
          onClick={() => isFormOpen ? (setEditing(null), setCreating(false)) : setPhase('home')}
          className="w-10 h-10 rounded-xl bg-panel-light flex items-center justify-center active:scale-90 transition-transform"
        >
          <FiArrowLeft className="text-lg" />
        </button>
        <h1 className="font-display text-xl text-gold">
          {isFormOpen ? (editing ? 'Modifier' : 'Nouveau thème') : 'Thèmes'}
        </h1>
        {!isFormOpen && (
          <span className="ml-auto text-sm font-extrabold text-slate-500">{themes.length} thèmes</span>
        )}
      </div>

      {isFormOpen ? (
        /* ===== Editor form ===== */
        <div className="flex-1 flex flex-col space-y-3">
          <input
            type="text"
            value={formTitle}
            onChange={(e) => setFormTitle(e.target.value)}
            placeholder="Titre du thème"
            className="w-full px-4 py-3.5 rounded-xl bg-panel border border-white/5 font-extrabold outline-none focus:border-gold/40 placeholder-slate-500"
          />
          <input
            type="text"
            value={formCategory}
            onChange={(e) => setFormCategory(e.target.value)}
            placeholder="Catégorie (ex: Nature)"
            className="w-full px-4 py-3.5 rounded-xl bg-panel border border-white/5 font-extrabold outline-none focus:border-gold/40 placeholder-slate-500"
          />
          <div className="flex gap-2">
            {(['facile', 'moyen', 'difficile'] as const).map(d => (
              <button
                key={d}
                onClick={() => setFormDifficulty(d)}
                className={`flex-1 py-2.5 rounded-xl font-extrabold text-sm capitalize transition-all active:scale-95 ${
                  formDifficulty === d ? 'bg-gold text-night' : 'bg-panel-light text-slate-400'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
          <div className="flex-1 flex flex-col">
            <p className="text-xs font-extrabold text-slate-500 uppercase mb-1.5">
              Réponses (une par ligne) — {answerCount}
            </p>
            <textarea
              value={formAnswers}
              onChange={(e) => setFormAnswers(e.target.value)}
              placeholder={'Réponse 1\nRéponse 2\nRéponse 3...'}
              className="flex-1 min-h-48 w-full px-4 py-3 rounded-xl bg-panel border border-white/5 font-semibold text-sm outline-none focus:border-gold/40 resize-none placeholder-slate-500 scrollbar-thin"
            />
          </div>
          <button
            onClick={handleSave}
            disabled={!formTitle.trim() || !formCategory.trim() || answerCount < 4}
            className="w-full py-4 bg-gradient-to-b from-gold-bright to-gold text-night rounded-2xl font-display text-lg shadow-xl shadow-gold/20 disabled:opacity-40 active:scale-[0.97] transition-transform"
          >
            {editing ? 'Sauvegarder' : 'Créer'}
          </button>
        </div>
      ) : (
        <>
          {/* ===== Action buttons ===== */}
          <div className="grid grid-cols-4 gap-2 mb-4">
            <button onClick={startCreate} className="py-3 rounded-xl bg-gold text-night flex flex-col items-center gap-1 active:scale-95 transition-transform">
              <FiPlus />
              <span className="text-[10px] font-extrabold">Créer</span>
            </button>
            <button onClick={handleImport} className="py-3 rounded-xl bg-panel-light flex flex-col items-center gap-1 active:scale-95 transition-transform">
              <FiUpload className="text-electric" />
              <span className="text-[10px] font-extrabold text-slate-400">Importer</span>
            </button>
            <button onClick={handleExport} className="py-3 rounded-xl bg-panel-light flex flex-col items-center gap-1 active:scale-95 transition-transform">
              <FiDownload className="text-lime" />
              <span className="text-[10px] font-extrabold text-slate-400">Exporter</span>
            </button>
            <button onClick={resetThemes} className="py-3 rounded-xl bg-panel-light flex flex-col items-center gap-1 active:scale-95 transition-transform">
              <FiRotateCcw className="text-pinkish" />
              <span className="text-[10px] font-extrabold text-slate-400">Réinit.</span>
            </button>
          </div>

          {/* ===== Theme list ===== */}
          <div className="flex-1 space-y-2 overflow-y-auto scrollbar-thin">
            {themes.map(theme => (
              <div
                key={theme.id}
                className="flex items-center gap-2 px-3.5 py-3 rounded-xl bg-panel border border-white/5"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-extrabold text-sm truncate">{theme.title}</p>
                  <p className="text-[11px] font-bold text-slate-500">
                    {theme.category} • {theme.answers.length} rép. • {theme.difficulty}
                  </p>
                </div>
                <button onClick={() => startEdit(theme)} className="p-2 text-electric active:scale-90 transition-transform">
                  <FiEdit2 size={15} />
                </button>
                <button onClick={() => duplicateTheme(theme.id)} className="p-2 text-slate-500 active:scale-90 transition-transform">
                  <FiCopy size={15} />
                </button>
                <button onClick={() => deleteTheme(theme.id)} className="p-2 text-red-400 active:scale-90 transition-transform">
                  <FiTrash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
