import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../api';
import ModerationModal from './ModerationModal';

export default function SafeInput({ endpoint, pseudo, onSuccess, onRequirePseudo }) {
  const { t } = useTranslation();
  const [body, setBody] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [reason, setReason] = useState('');
  const [isModerationModalOpen, setIsModerationModalOpen] = useState(false);
  const canSubmit = Boolean(pseudo && pseudo.trim());

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!canSubmit) {
      onRequirePseudo?.();
      return;
    }
    setError('');
    setReason('');
    setLoading(true);

    try {
      const response = await api.post(endpoint, {
        pseudo,
        body,
        is_public: isPublic,
      });

      setBody('');
      setIsPublic(true);
      onSuccess?.(response.data);
    } catch (err) {
      setError(err.response?.data?.message || t('errors.network'));
      const reasonText = err.response?.data?.reason || '';
      setReason(reasonText);
      if (reasonText) {
        setIsModerationModalOpen(true);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto w-full max-w-2xl rounded-[32px] border border-white/30 bg-white/50 p-6 shadow-xl shadow-indigo-200/30 backdrop-blur-lg"
    >
      {!canSubmit && (
        <div className="mb-4 rounded-3xl border border-amber-200 bg-amber-50/80 px-4 py-3 text-sm text-amber-700">
          <p className="font-semibold">{t('input.requirePseudo')}</p>
          <button
            type="button"
            onClick={onRequirePseudo}
            className="mt-2 inline-flex items-center rounded-full bg-amber-500 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-amber-600"
          >
            {t('input.setPseudo')}
          </button>
        </div>
      )}
      <div className="flex flex-col gap-4">
        <div>
          <label className="text-sm font-semibold text-indigo-700">{t('input.message')}</label>
          <textarea
            value={body}
            onChange={(event) => setBody(event.target.value)}
            placeholder={t('input.messagePlaceholder')}
            rows={5}
            className="mt-2 w-full rounded-3xl border border-white/40 bg-white/70 px-4 py-3 text-slate-800 shadow-inner shadow-white/40 outline-none ring-2 ring-transparent transition focus:ring-indigo-400 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={!canSubmit}
            required
          />
        </div>

        <div className="flex items-center gap-3">
          <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-white/40 bg-white/70 px-4 py-3 shadow-inner shadow-white/40 transition hover:border-indigo-300">
            <div className="relative">
              <input
                type="checkbox"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                disabled={!canSubmit}
                className="peer sr-only"
              />
              <div className="h-6 w-11 rounded-full bg-slate-300 shadow-inner transition peer-checked:bg-emerald-500 peer-disabled:cursor-not-allowed peer-disabled:opacity-60"></div>
              <div className="absolute left-1 top-1 h-4 w-4 rounded-full bg-white shadow-md transition peer-checked:translate-x-5"></div>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-indigo-700">{t('input.visibility')}</span>
              <span className={`text-xs transition ${isPublic ? 'text-emerald-600 font-medium' : 'text-slate-500'}`}>
                {isPublic ? t('input.public') : t('input.private')}
              </span>
            </div>
          </label>
        </div>
      </div>

      {(error || reason) && (
        <div className="mt-4 rounded-3xl border border-rose-200 bg-rose-50/80 px-4 py-3 text-sm text-rose-600">
          <p className="font-semibold">{error}</p>
          {reason && <p className="mt-1 text-rose-500">{reason}</p>}
        </div>
      )}

      <button
        type="submit"
        disabled={loading || !canSubmit}
        className="mt-6 inline-flex items-center justify-center rounded-full bg-indigo-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-300/40 transition hover:bg-indigo-600 disabled:cursor-not-allowed disabled:bg-indigo-300"
      >
        {loading ? t('input.submitting') : t('input.submit')}
      </button>

      <p className="mt-4 text-xs text-slate-500">
        {t('input.disclaimer')}
      </p>

      <ModerationModal
        isOpen={isModerationModalOpen}
        onClose={() => setIsModerationModalOpen(false)}
        reason={reason}
      />
    </form>
  );
}
