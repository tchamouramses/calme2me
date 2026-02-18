import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../api';
import ConfirmModal from './ConfirmModal';
import { formatDate } from '../utils/dateFormatter';

export default function AdminDashboard() {
  const { t, i18n } = useTranslation();
  const [problems, setProblems] = useState([]);
  const [rejections, setRejections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingRejections, setLoadingRejections] = useState(true);
  const [error, setError] = useState('');
  const [rejectionsError, setRejectionsError] = useState('');
  const [toast, setToast] = useState('');
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, problemId: null });
  const [activeTab, setActiveTab] = useState('problems');

  const statuses = useMemo(() => [
    { label: t('admin.statuses.waiting'), value: 'waiting' },
    { label: t('admin.statuses.published'), value: 'published' },
    { label: t('admin.statuses.archived'), value: 'archived' },
  ], [t]);

  const tabs = useMemo(() => [
    { key: 'problems', label: t('admin.tabs.problems') },
    { key: 'rejections', label: t('admin.tabs.rejections') },
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

  useEffect(() => {
    let active = true;

    const loadRejections = async () => {
      setLoadingRejections(true);
      setRejectionsError('');

      try {
        const response = await api.get('/api/admin/rejections', {
          params: { per_page: 50 },
        });
        if (active) {
          setRejections(response.data.data || []);
        }
      } catch (err) {
        if (active) {
          setRejectionsError(err.response?.data?.message || t('errors.network'));
        }
      } finally {
        if (active) {
          setLoadingRejections(false);
        }
      }
    };

    loadRejections();

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

  const deleteProblem = async (problemId) => {
    try {
      await api.delete(`/api/problems/${problemId}`);
      setProblems((current) => current.filter((problem) => problem.id !== problemId));
      setToast(t('admin.deleted'));
    } catch (err) {
      setToast(err.response?.data?.message || t('admin.deleteFailed'));
    }
  };

  const openDeleteModal = (problemId) => {
    setDeleteModal({ isOpen: true, problemId });
  };

  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, problemId: null });
  };

  const handleDelete = () => {
    if (deleteModal.problemId) {
      deleteProblem(deleteModal.problemId);
    }
  };

  return (
    <section className="mx-auto w-full max-w-6xl space-y-6 px-4 sm:px-6">
      <header className="rounded-[32px] border border-white/40 bg-white/60 p-6 shadow-xl shadow-indigo-200/30 backdrop-blur-lg">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">{t('admin.title')}</h2>
            <p className="mt-2 text-sm text-slate-600">
              {t('admin.description')}
            </p>
          </div>
          <div className="flex flex-wrap gap-2 rounded-full border border-white/60 bg-white/70 p-1 shadow-inner">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                  activeTab === tab.key
                    ? 'bg-indigo-500 text-white shadow-md shadow-indigo-200/60'
                    : 'text-slate-600 hover:bg-indigo-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {toast && (
        <div className="rounded-[24px] border border-emerald-200 bg-emerald-50/80 px-4 py-3 text-sm text-emerald-700">
          {toast}
        </div>
      )}

      {activeTab === 'problems' && error && (
        <div className="rounded-[24px] border border-rose-200 bg-rose-50/80 px-4 py-3 text-sm text-rose-600">
          {error}
        </div>
      )}

      {activeTab === 'rejections' && rejectionsError && (
        <div className="rounded-[24px] border border-rose-200 bg-rose-50/80 px-4 py-3 text-sm text-rose-600">
          {rejectionsError}
        </div>
      )}

      {activeTab === 'problems' && loading && (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
        </div>
      )}

      {activeTab === 'rejections' && loadingRejections && (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
        </div>
      )}

      {activeTab === 'problems' && !loading && problems.length === 0 && (
        <div className="rounded-[28px] border border-white/40 bg-white/60 p-8 text-center shadow-xl shadow-indigo-200/30 backdrop-blur-lg">
          <p className="text-slate-600">{t('admin.noProblems')}</p>
        </div>
      )}

      {activeTab === 'rejections' && !loadingRejections && rejections.length === 0 && (
        <div className="rounded-[28px] border border-white/40 bg-white/60 p-8 text-center shadow-xl shadow-indigo-200/30 backdrop-blur-lg">
          <p className="text-slate-600">{t('admin.noRejections')}</p>
        </div>
      )}

      {activeTab === 'problems' && (
        <>
          {/* Mobile cards view */}
          <div className="block space-y-4 lg:hidden">
            {problems.map((problem) => (
              <div
                key={problem.id}
                className="rounded-[24px] border border-white/40 bg-white/60 p-5 shadow-lg shadow-indigo-200/20 backdrop-blur-lg"
              >
                <div className="mb-3 flex items-start justify-between">
                  <h3 className="font-semibold text-slate-900">{problem.pseudo}</h3>
                </div>

                <p className="mb-4 text-sm text-slate-700 line-clamp-3">{problem.body}</p>

                <div className="mb-4">
                  <p className="mb-2 text-xs font-medium uppercase tracking-wider text-slate-500">
                    {t('admin.status')}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {statuses.map((status) => (
                      <button
                        key={status.value}
                        type="button"
                        onClick={() => updateStatus(problem.id, status.value)}
                        className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                          problem.status === status.value
                            ? 'bg-indigo-500 text-white'
                            : 'bg-white/70 text-slate-600 hover:bg-indigo-50'
                        }`}
                      >
                        {status.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => copyToWhatsApp(problem)}
                    className="w-full rounded-full bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-emerald-200/40 transition hover:bg-emerald-600"
                  >
                    {t('admin.copyWhatsApp')}
                  </button>
                  <button
                    type="button"
                    onClick={() => copyDirectLink(problem)}
                    className="w-full rounded-full bg-indigo-500 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-200/40 transition hover:bg-indigo-600"
                  >
                    {t('admin.copyLink')}
                  </button>
                  <button
                    type="button"
                    onClick={() => openDeleteModal(problem.id)}
                    className="w-full rounded-full bg-rose-500 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-rose-200/40 transition hover:bg-rose-600"
                  >
                    {t('admin.delete')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {activeTab === 'problems' && (
        <>
          {/* Desktop table view */}
          <div className="hidden overflow-hidden rounded-[28px] border border-white/40 bg-white/60 shadow-xl shadow-indigo-200/30 backdrop-blur-lg lg:block">
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
                        <button
                          type="button"
                          onClick={() => openDeleteModal(problem.id)}
                          className="rounded-full bg-rose-500 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-rose-200/40 transition hover:bg-rose-600"
                        >
                          {t('admin.delete')}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {activeTab === 'rejections' && (
        <>
          <div className="block space-y-4 lg:hidden">
            {rejections.map((rejection) => (
              <div
                key={rejection.id}
                className="rounded-[24px] border border-white/40 bg-white/60 p-5 shadow-lg shadow-indigo-200/20 backdrop-blur-lg"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-indigo-500">
                      {t(`admin.rejectionTypes.${rejection.type?.toLowerCase?.() || 'unknown'}`)}
                    </p>
                    <h3 className="text-sm font-semibold text-slate-900">
                      {rejection.pseudo || t('admin.unknownPseudo')}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500">
                    {formatDate(rejection.created_at, i18n.language)}
                  </p>
                </div>

                <p className="mt-3 text-sm text-slate-700 line-clamp-4">{rejection.body}</p>

                <div className="mt-4 rounded-2xl border border-rose-100 bg-rose-50/60 px-3 py-2">
                  <p className="text-xs font-semibold text-rose-600">{t('admin.rejectionReason')}</p>
                  <p className="mt-1 text-xs text-slate-700">{rejection.reason || '-'}</p>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                  <span>{t('admin.rejectionIp')}: {rejection.ip_address || '-'}</span>
                  {rejection.problem_uuid && (
                    <a
                      href={`/problems/${rejection.problem_uuid}`}
                      className="text-indigo-600 hover:text-indigo-700"
                    >
                      {t('admin.rejectionLink')}
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="hidden overflow-hidden rounded-[28px] border border-white/40 bg-white/60 shadow-xl shadow-indigo-200/30 backdrop-blur-lg lg:block">
            <table className="w-full text-left text-sm">
              <thead className="bg-indigo-50/80 text-xs uppercase tracking-[0.2em] text-indigo-600">
                <tr>
                  <th className="px-5 py-4">{t('admin.rejectionType')}</th>
                  <th className="px-5 py-4">{t('admin.pseudo')}</th>
                  <th className="px-5 py-4">{t('admin.rejectionBody')}</th>
                  <th className="px-5 py-4">{t('admin.rejectionReason')}</th>
                  <th className="px-5 py-4">{t('admin.rejectionIp')}</th>
                  <th className="px-5 py-4">{t('admin.rejectionDate')}</th>
                  <th className="px-5 py-4">{t('admin.rejectionLink')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/40">
                {rejections.map((rejection) => (
                  <tr key={rejection.id}>
                    <td className="px-5 py-5 text-xs font-semibold text-indigo-600">
                      {t(`admin.rejectionTypes.${rejection.type?.toLowerCase?.() || 'unknown'}`)}
                    </td>
                    <td className="px-5 py-5 text-sm font-semibold text-slate-700">
                      {rejection.pseudo || t('admin.unknownPseudo')}
                    </td>
                    <td className="px-5 py-5">
                      <p className="text-sm text-slate-700 line-clamp-3">{rejection.body}</p>
                    </td>
                    <td className="px-5 py-5">
                      <p className="text-xs text-slate-600 line-clamp-3">{rejection.reason || '-'}</p>
                    </td>
                    <td className="px-5 py-5 text-xs text-slate-500">
                      {rejection.ip_address || '-'}
                    </td>
                    <td className="px-5 py-5 text-xs text-slate-500">
                      {formatDate(rejection.created_at, i18n.language)}
                    </td>
                    <td className="px-5 py-5 text-xs">
                      {rejection.problem_uuid ? (
                        <a
                          href={`/problems/${rejection.problem_uuid}`}
                          className="text-indigo-600 hover:text-indigo-700"
                        >
                          {t('admin.rejectionLink')}
                        </a>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDelete}
        title={t('admin.deleteTitle')}
        message={t('admin.confirmDelete')}
        confirmText={t('admin.confirmDeleteButton')}
        cancelText={t('admin.cancel')}
      />
    </section>
  );
}
