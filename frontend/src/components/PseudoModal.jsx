import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

const LETTERS = 'abcdefghijklmnopqrstuvwxyz';

const buildSuggestion = () => {
  const pickLetters = Array.from({ length: 3 }, () => LETTERS[Math.floor(Math.random() * LETTERS.length)]).join('');
  const pickNumbers = Array.from({ length: 2 }, () => Math.floor(Math.random() * 10)).join('');
  return `s-${pickLetters}_${pickNumbers}`;
};

const buildSuggestions = () => Array.from({ length: 3 }, buildSuggestion);

export default function PseudoModal({ isOpen, onClose, onSave, initialValue, isLocked }) {
  const { t } = useTranslation();
  const [pseudo, setPseudo] = useState(initialValue || '');
  const [error, setError] = useState('');
  const [suggestions, setSuggestions] = useState(() => buildSuggestions());

  const allowClose = useMemo(() => !isLocked, [isLocked]);

  useEffect(() => {
    if (isOpen) {
      setPseudo(initialValue || '');
      setError('');
      setSuggestions(buildSuggestions());
    }
  }, [isOpen, initialValue]);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!pseudo.trim()) {
      setError(t('home.pseudoRequired'));
      return;
    }

    setError('');
    const trimmedPseudo = pseudo.trim();
    onSave?.(trimmedPseudo);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4 backdrop-blur">
      <div className="w-full max-w-md rounded-[32px] border border-white/40 bg-white/90 p-6 shadow-2xl shadow-indigo-200/40">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-500">
              {t('home.pseudo')}
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-900">
              {t('pseudoModal.title')}
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              {t('pseudoModal.subtitle')}
            </p>
          </div>
          {allowClose && (
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              {t('common.close')}
            </button>
          )}
        </div>
        {isLocked && (
          <div className="mt-4 rounded-3xl border border-amber-200 bg-amber-50/80 px-4 py-3 text-sm text-amber-700">
            {t('pseudoModal.lockedNote')}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <div>
            <label className="text-sm font-semibold text-indigo-700">{t('home.pseudo')}</label>
            <input
              value={pseudo}
              onChange={(event) => setPseudo(event.target.value)}
              placeholder={t('home.pseudoPlaceholder')}
              className="mt-2 w-full rounded-full border border-white/50 bg-white/70 px-5 py-3 text-slate-800 shadow-inner shadow-white/40 outline-none ring-2 ring-transparent transition focus:ring-indigo-400"
              required
            />
          </div>

          <div className="rounded-3xl border border-white/60 bg-white/70 px-4 py-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                {t('pseudoModal.suggestions')}
              </p>
              <button
                type="button"
                onClick={() => setSuggestions(buildSuggestions())}
                className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                {t('pseudoModal.refresh')}
              </button>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => setPseudo(suggestion)}
                  className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600 transition hover:bg-indigo-100"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="rounded-3xl border border-rose-200 bg-rose-50/80 px-4 py-3 text-sm text-rose-600">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="rounded-full bg-indigo-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-300/40 transition hover:bg-indigo-600"
          >
            {t('pseudoModal.save')}
          </button>
        </form>
      </div>
    </div>
  );
}
