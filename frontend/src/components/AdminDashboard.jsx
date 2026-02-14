import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../api';

export default function AdminDashboard() {
  const { t } = useTranslation();
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');

  const statuses = useMemo(() => [
    { label: t('admin.statuses.waiting'), value: 'waiting' },
    { label: t('admin.statuses.published'), value: 'published' },
    { label: t('admin.statuses.archived'), value: 'archived' },
  ], [t]);

  useEffect(() => {
    let active = true;

    const load = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await api.get('/api/admin/problems');
        if (active) {
          setProblems(response.data);
        }
      } catch (err) {
        if (active) {
          setError(err.response?.data?.message || t('errors.network'));
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      active = false;
    };
  }, [t]);

  const updateStatus = async (problemId, status) => {
    try {
      const response = await api.patch(`/api/problems/${problemId}/status`, { status });
      setProblems((current) =>
        current.map((problem) => (problem.id === response.data.id ? response.data : problem))
      );
    } catch (err) {
      setToast(err.response?.data?.message || t('errors.updateStatus'));
    }
  };

  const copyToWhatsApp = async (problem) => {
    try {
      const url = `${window.location.origin}/problems/${problem.uuid}`;
      const text = `${problem.body}\n\n\n*Répondez via le lien:* ${url}`;
      await navigator.clipboard.writeText(text);
      setToast(t('admin.copied'));
    } catch (err) {
      setToast(t('admin.copyFailed'));
    }
  };

  const copyDirectLink = async (problem) => {
    try {
      const url = `${window.location.origin}/problems/${problem.uuid}`;
      await navigator.clipboard.writeText(url);
      setToast(t('admin.linkCopied'));
    } catch (err) {
      setToast(t('admin.copyFailed'));
    }
  };

  return (
    <section className="mx-auto w-full max-w-5xl space-y-6">
      <header className="rounded-[32px] border border-white/40 bg-white/60 p-6 shadow-xl shadow-indigo-200/30 backdrop-blur-lg">
        <h2 className="text-xl font-semibold text-slate-900">{t('admin.title')}</h2>
        <p className="mt-2 text-sm text-slate-600">
          {t('admin.description')}
        </p>
      </header>

      {toast && (
        <div className="rounded-[24px] border border-emerald-200 bg-emerald-50/80 px-4 py-3 text-sm text-emerald-700">
          {toast}
        </div>
      )}

      {error && (
        <div className="rounded-[24px] border border-rose-200 bg-rose-50/80 px-4 py-3 text-sm text-rose-600">
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-[28px] border border-white/40 bg-white/60 shadow-xl shadow-indigo-200/30 backdrop-blur-lg">
        <table className="w-full text-left text-sm">
          <thead className="bg-indigo-50/80 text-xs uppercase tracking-[0.2em] text-indigo-600">
            <tr>
              <th className="px-5 py-4">{t('admin.pseudo')}</th>
              <th className="px-5 py-4">{t('input.message')}</th>
              <th className="px-5 py-4">{t('admin.status')}</th>
              <th className="px-5 py-4">{t('admin.actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/40">
            {loading && (
              <tr>
                <td className="px-5 py-6" colSpan={4}>
                  {t('admin.loading')}
                </td>
              </tr>
            )}
            {!loading && problems.length === 0 && (
              <tr>
                <td className="px-5 py-6" colSpan={4}>
                  {t('admin.noProblems')}
                </td>
              </tr>
            )}
            {problems.map((problem) => (
              <tr key={problem.id}>
                <td className="px-5 py-5 font-semibold text-slate-700">{problem.pseudo}</td>
                <td className="px-5 py-5">
                  <p className="text-sm text-slate-700 line-clamp-3">{problem.body}</p>
                </td>
                <td className="px-5 py-5">
                  <div className="flex flex-wrap gap-2">
                    {statuses.map((status) => (
                      <button
                        key={status.value}
                        type="button"
                        onClick={() => updateStatus(problem.id, status.value)}
                        className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                          problem.status === status.value
                            ? 'bg-indigo-500 text-white'
                            : 'bg-white/70 text-slate-600 hover:bg-indigo-50'
                        }`}
                      >
                        {status.label}
                      </button>
                    ))}
                  </div>
                </td>
                <td className="px-5 py-5">
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => copyToWhatsApp(problem)}
                      className="rounded-full bg-emerald-500 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-emerald-200/40 transition hover:bg-emerald-600"
                    >
                      {t('admin.copyWhatsApp')}
                    </button>
                    <button
                      type="button"
                      onClick={() => copyDirectLink(problem)}
                      className="rounded-full bg-indigo-500 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-indigo-200/40 transition hover:bg-indigo-600"
                    >
                      {t('admin.copyLink')}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
