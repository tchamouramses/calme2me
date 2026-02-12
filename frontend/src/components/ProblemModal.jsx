import { useTranslation } from 'react-i18next';
import SafeInput from './SafeInput';

export default function ProblemModal({ isOpen, onClose, pseudo, onRequirePseudo }) {
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4 backdrop-blur">
      <div className="w-full max-w-3xl rounded-[32px] border border-white/40 bg-white/90 p-6 shadow-2xl shadow-indigo-200/40">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-500">
              {t('problemModal.kicker')}
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-900">
              {t('problemModal.title')}
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              {t('problemModal.subtitle')}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
          >
            {t('common.close')}
          </button>
        </div>

        <div className="mt-6">
          <SafeInput
            endpoint="/api/problems"
            pseudo={pseudo}
            onRequirePseudo={onRequirePseudo}
            onSuccess={onClose}
          />
        </div>
      </div>
    </div>
  );
}
