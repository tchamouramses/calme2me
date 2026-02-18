import { useTranslation } from 'react-i18next';

export default function ModerationModal({ isOpen, onClose, reason }) {
  const { t } = useTranslation();

  if (!isOpen || !reason) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4 backdrop-blur">
      <div className="w-full max-w-2xl rounded-[32px] border border-rose-200 bg-white/95 p-8 shadow-2xl shadow-rose-200/40">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-100">
                <svg
                  className="h-6 w-6 text-rose-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.1em] text-rose-600">
                  {t('moderation.rejected')}
                </p>
                <h2 className="text-2xl font-semibold text-slate-900">
                  {t('moderation.title')}
                </h2>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <div>
                <p className="text-sm font-medium text-slate-700">
                  {t('moderation.reason')}
                </p>
                <div className="mt-3 rounded-2xl border border-rose-100 bg-rose-50/50 px-4 py-3">
                  <p className="text-sm leading-relaxed text-slate-700">{reason}</p>
                </div>
              </div>

              <p className="text-xs text-slate-500">
                {t('moderation.disclaimer')}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
          >
            {t('common.close')}
          </button>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-full bg-indigo-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-300/40 transition hover:bg-indigo-600"
          >
            {t('moderation.understand')}
          </button>
        </div>
      </div>
    </div>
  );
}
