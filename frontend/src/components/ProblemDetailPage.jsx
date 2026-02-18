import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';
import api from '../api';
import ReactionBar from './ReactionBar';
import ModerationModal from './ModerationModal';
import { formatDate, formatRelativeTime } from '../utils/dateFormatter';

export default function ProblemDetailPage({ pseudo, onRequirePseudo }) {
  const { t, i18n } = useTranslation();
  const { uuid } = useParams();
  const [problem, setProblem] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentsPage, setCommentsPage] = useState(1);
  const [hasMoreComments, setHasMoreComments] = useState(false);
  const [loading, setLoading] = useState(true);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [error, setError] = useState('');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [commentError, setCommentError] = useState('');
  const [commentReason, setCommentReason] = useState('');
  const [isModerationModalOpen, setIsModerationModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const canComment = Boolean(pseudo && pseudo.trim());

  const loadComments = useCallback(async (page = 1, append = false) => {
    if (!problem?.id) return;
    
    setCommentsLoading(true);

    try {
      const response = await api.get(`/api/problems/${problem.id}/comments`, {
        params: { page, per_page: 10 }
      });

      if (append) {
        setComments(prev => [...prev, ...response.data.data]);
      } else {
        setComments(response.data.data);
      }
      
      setHasMoreComments(response.data.current_page < response.data.last_page);
      setCommentsPage(response.data.current_page);
    } catch (err) {
      console.error('Failed to load comments', err);
    } finally {
      setCommentsLoading(false);
    }
  }, [problem?.id]);

  useEffect(() => {
    let active = true;

    const load = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await api.get(`/api/problems/${uuid}`);
        if (active) {
          setProblem(response.data.problem);
          setComments(response.data.comments.data);
          setHasMoreComments(response.data.comments.current_page < response.data.comments.last_page);
          setCommentsPage(response.data.comments.current_page);
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
  }, [uuid, t, refreshKey]);

  useEffect(() => {
    if (!window.Echo || !problem?.id) {
      return undefined;
    }

    const channel = window.Echo.channel(`problems.${problem.id}.comments`);
    channel.listen('.comment.created', (event) => {
      setComments((current) => [event.comment, ...current]);
    });

    return () => {
      channel.stopListening('.comment.created');
      window.Echo.leave(`problems.${problem.id}.comments`);
    };
  }, [problem?.id]);

  const handleCommentSubmit = async (event) => {
    event.preventDefault();
    if (!comment.trim()) return;
    if (!canComment) {
      onRequirePseudo?.();
      return;
    }

    setSubmitting(true);
    setCommentError('');
    setCommentReason('');

    try {
      await api.post(`/api/problems/${problem.id}/comments`, {
        pseudo,
        body: comment.trim(),
      });
      setComment('');
    } catch (err) {
      const errorMessage = err.response?.data?.message || t('errors.network');
      const reasonText = err.response?.data?.reason || '';
      setCommentError(errorMessage);
      setCommentReason(reasonText);
      if (reasonText) {
        setIsModerationModalOpen(true);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <section className="mx-auto w-full max-w-5xl space-y-6">
      <div className="flex justify-end">
        <Link
          to="/"
          className="rounded-full border border-indigo-200 bg-white/80 px-4 py-2 text-sm font-semibold text-indigo-600 shadow-sm transition hover:bg-indigo-50"
        >
          {t('problemDetail.back')}
        </Link>
      </div>

      {loading && (
        <div className="rounded-[28px] border border-white/40 bg-white/50 p-6 shadow-inner shadow-white/70">
          {t('problemDetail.loading')}
        </div>
      )}

      {!loading && error && (
        <div className="rounded-[24px] border border-rose-200 bg-rose-50/80 px-4 py-3 text-sm text-rose-600">
          {error}
        </div>
      )}

      {!loading && !error && problem && (
        <article className="rounded-[28px] border border-white/40 bg-white/60 p-6 shadow-lg shadow-indigo-200/30 backdrop-blur-lg">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-500">
              {problem.pseudo}
            </span>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
              {formatDate(problem.created_at, i18n.language)}
            </span>
          </div>
          <p className="mt-3 text-[16px] text-slate-700 leading-relaxed">{problem.body}</p>

          <div className="mt-4">
            <ReactionBar
              reactions={problem.reactions || []}
              pseudo={pseudo}
              resourceType="problem"
              resourceId={problem.id}
              onUpdate={handleRefresh}
            />
          </div>

          <div className="mt-6 border-t border-slate-200 pt-4">
            <h3 className="text-sm font-semibold text-slate-800">{t('problemDetail.comments')}</h3>

            {comments.length === 0 && !commentsLoading && (
              <p className="mt-3 text-xs text-slate-500">{t('feed.noComments')}</p>
            )}

            {commentsLoading && comments.length === 0 && (
              <div className="flex items-center justify-center py-4">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent"></div>
              </div>
            )}

            <div className="mt-3 space-y-3">
              {comments.map((c, index) => (
                <div key={c.id} className={`rounded-2xl px-4 py-3 ${
                  index % 2 === 0 ? 'bg-slate-50/80' : 'bg-indigo-50/50'
                }`}>
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-semibold text-blue-600">{c.pseudo}</p>
                    <span className="text-xs text-slate-500">
                      {formatRelativeTime(c.created_at, i18n.language)}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-slate-700">{c.body}</p>
                  <div className="mt-2">
                    <ReactionBar
                      reactions={c.reactions || []}
                      pseudo={pseudo}
                      resourceType="comment"
                      resourceId={c.id}
                      onUpdate={handleRefresh}
                    />
                  </div>
                </div>
              ))}
            </div>

            {hasMoreComments && (
              <button
                onClick={() => loadComments(commentsPage + 1, true)}
                disabled={commentsLoading}
                className="mt-3 w-full rounded-2xl border border-indigo-200 bg-indigo-50/50 px-4 py-2 text-xs font-semibold text-indigo-600 transition hover:bg-indigo-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {commentsLoading ? t('input.submitting') : t('feed.loadMoreComments')}
              </button>
            )}

            <form onSubmit={handleCommentSubmit} className="mt-4 flex flex-col gap-3">
              <textarea
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                placeholder={t('input.commentPlaceholder')}
                rows={2}
                className="w-full resize-y rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm outline-none ring-2 ring-transparent transition focus:ring-indigo-400 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={!canComment}
              />
              <div className="flex items-center gap-2">
                {!canComment && (
                  <button
                    type="button"
                    onClick={onRequirePseudo}
                    className="rounded-full bg-amber-500 px-4 py-2 text-xs font-semibold text-white transition hover:bg-amber-600"
                  >
                    {t('input.setPseudo')}
                  </button>
                )}
                <button
                  type="submit"
                  disabled={submitting || !comment.trim() || !canComment}
                  className="rounded-full bg-indigo-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-600 disabled:cursor-not-allowed disabled:bg-indigo-300"
                >
                  {submitting ? t('input.submitting') : t('input.comment')}
                </button>
              </div>
            </form>

            {commentError && (
              <p className="mt-2 text-xs text-rose-600">{commentError}</p>
            )}
          </div>
        </article>
      )}

      <ModerationModal
        isOpen={isModerationModalOpen}
        onClose={() => setIsModerationModalOpen(false)}
        reason={commentReason}
      />
    </section>
  );
}
