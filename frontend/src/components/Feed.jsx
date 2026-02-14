import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import api from '../api';
import ReactionBar from './ReactionBar';
import { formatDate, formatRelativeTime } from '../utils/dateFormatter';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll';

const loadingCards = Array.from({ length: 3 });

function ProblemCard({ problem, pseudo, onToggleComments, showComments, onRequirePseudo, onRefresh, onLoadComments, commentsLoading }) {
  const { t, i18n } = useTranslation();
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const canComment = Boolean(pseudo && pseudo.trim());

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    if (!canComment) {
      onRequirePseudo?.();
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await api.post(`/api/problems/${problem.id}/comments`, {
        pseudo,
        body: comment.trim(),
      });
      setComment('');
    } catch (err) {
      setError(err.response?.data?.message || t('errors.network'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <article className="rounded-[28px] border border-white/30 bg-white/40 p-5 shadow-lg shadow-indigo-200/30 backdrop-blur-xl">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-500">
          {problem.pseudo}
        </span>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
          {formatDate(problem.created_at, i18n.language)}
        </span>
      </div>
      <p className="mt-3 text-sm text-slate-700 leading-relaxed">{problem.body}</p>

      <div className="mt-4">
        <ReactionBar
          reactions={problem.reactions || []}
          pseudo={pseudo}
          resourceType="problem"
          resourceId={problem.id}
          onUpdate={onRefresh}
        />
      </div>

      <div className="mt-4 flex flex-col sm:flex-row sm:flex-wrap items-center gap-3">
        <Link
          to={`/problems/${problem.uuid}`}
          className="rounded-full border border-indigo-200 bg-white/80 px-3 py-1 text-xs font-semibold text-indigo-600 shadow-sm transition hover:bg-indigo-50 w-full sm:w-auto text-center"
        >
          {t('feed.openDetails')}
        </Link>
      
        <button
          onClick={() => onToggleComments(problem.id)}
          className="flex items-center gap-2 text-xs font-semibold text-indigo-600 transition hover:text-indigo-700"
        >
          <span>{showComments ? t('feed.hideComments') : t('feed.showComments')}</span>
          <span className="rounded-full bg-indigo-100 px-2 py-0.5">
            {problem.comments_count || 0}
          </span>
        </button>
      </div>

      {showComments && (
        <div className="mt-4 space-y-3 border-t border-slate-200 pt-4">
          {commentsLoading && (
            <div className="flex items-center justify-center py-4">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent"></div>
            </div>
          )}
          
          {!commentsLoading && problem.comments?.length === 0 && (
            <p className="text-xs text-slate-500">{t('feed.noComments')}</p>
          )}
          
          {problem.comments?.map((c, index) => (
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
                  onUpdate={onRefresh}
                />
              </div>
            </div>
          ))}

          {problem.hasMoreComments && !commentsLoading && (
            <button
              onClick={() => onLoadComments(problem.id)}
              className="w-full rounded-2xl border border-indigo-200 bg-indigo-50/50 px-4 py-2 text-xs font-semibold text-indigo-600 transition hover:bg-indigo-100"
            >
              {t('feed.loadMoreComments')}
            </button>
          )}

          <form onSubmit={handleCommentSubmit} className="flex flex-col gap-3">
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
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

          {error && (
            <p className="text-xs text-rose-600">{error}</p>
          )}
        </div>
      )}
    </article>
  );
}

export default function Feed({ pseudo, onRequirePseudo }) {
  const { t } = useTranslation();
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const [expandedProblemId, setExpandedProblemId] = useState(null);
  const [commentsLoading, setCommentsLoading] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const loadProblems = useCallback(async (page = 1, append = false) => {
    if (append) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }
    setError('');

    try {
      const response = await api.get('/api/problems', {
        params: { page, per_page: 10 }
      });
      
      const newProblems = response.data.data.map(p => ({
        ...p,
        comments: [],
        commentsLoaded: false,
        commentsPage: 1,
        hasMoreComments: true,
      }));

      if (append) {
        setProblems(prev => [...prev, ...newProblems]);
      } else {
        setProblems(newProblems);
      }
      
      setHasMore(response.data.current_page < response.data.last_page);
      setCurrentPage(response.data.current_page);
    } catch (err) {
      setError(err.response?.data?.message || t('errors.network'));
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [t]);

  const loadMoreProblems = useCallback(() => {
    if (!loadingMore && hasMore) {
      loadProblems(currentPage + 1, true);
    }
  }, [currentPage, hasMore, loadingMore, loadProblems]);

  const loadComments = useCallback(async (problemId) => {
    const problem = problems.find(p => p.id === problemId);
    if (!problem || commentsLoading[problemId]) return;

    setCommentsLoading(prev => ({ ...prev, [problemId]: true }));

    try {
      const response = await api.get(`/api/problems/${problemId}/comments`, {
        params: { page: problem.commentsPage, per_page: 10 }
      });

      setProblems(prev => prev.map(p => {
        if (p.id === problemId) {
          return {
            ...p,
            comments: [...p.comments, ...response.data.data],
            commentsLoaded: true,
            commentsPage: response.data.current_page + 1,
            hasMoreComments: response.data.current_page < response.data.last_page,
          };
        }
        return p;
      }));
    } catch (err) {
      console.error('Failed to load comments', err);
    } finally {
      setCommentsLoading(prev => ({ ...prev, [problemId]: false }));
    }
  }, [problems, commentsLoading]);

  const setTriggerRef = useInfiniteScroll(loadMoreProblems, hasMore);

  useEffect(() => {
    loadProblems(1, false);
  }, [refreshKey]);

  useEffect(() => {
    if (!window.Echo) {
      return undefined;
    }

    const channel = window.Echo.channel('problems');
    channel.listen('.problem.published', (event) => {
      setProblems((current) => [{
        ...event.problem,
        comments: [],
        commentsLoaded: false,
        commentsPage: 1,
        hasMoreComments: true,
      }, ...current]);
    });

    return () => {
      channel.stopListening('.problem.published');
      window.Echo.leave('problems');
    };
  }, []);

  useEffect(() => {
    if (!window.Echo || !expandedProblemId) {
      return undefined;
    }

    const channel = window.Echo.channel(`problems.${expandedProblemId}.comments`);
    channel.listen('.comment.created', (event) => {
      setProblems((current) =>
        current.map((p) =>
          p.id === expandedProblemId
            ? { ...p, comments: [event.comment, ...(p.comments || [])] }
            : p
        )
      );
    });

    return () => {
      channel.stopListening('.comment.created');
      window.Echo.leave(`problems.${expandedProblemId}.comments`);
    };
  }, [expandedProblemId]);

  const toggleComments = (problemId) => {
    const problem = problems.find(p => p.id === problemId);
    
    if (expandedProblemId === problemId) {
      setExpandedProblemId(null);
    } else {
      setExpandedProblemId(problemId);
      if (problem && !problem.commentsLoaded) {
        loadComments(problemId);
      }
    }
  };

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <section className="mx-auto w-full max-w-4xl space-y-5">
      <div className="rounded-[32px] border border-white/40 bg-white/60 p-6 shadow-xl shadow-indigo-200/30 backdrop-blur-lg">
        <h2 className="text-xl font-semibold text-slate-900">{t('feed.title')}</h2>
        <p className="mt-2 text-sm text-slate-600">
          {t('feed.description')}
        </p>
      </div>

      {loading && (
        <div className="grid gap-4">
          {loadingCards.map((_, index) => (
            <div
              key={index}
              className="h-28 rounded-[28px] border border-white/40 bg-white/50 shadow-inner shadow-white/70 animate-pulse"
            />
          ))}
        </div>
      )}

      {!loading && error && (
        <div className="rounded-[24px] border border-rose-200 bg-rose-50/80 px-4 py-3 text-sm text-rose-600">
          {error}
        </div>
      )}

      {!loading && !error && (
        <div className="grid gap-4">
          {problems.length === 0 && (
            <div className="rounded-[24px] border border-white/40 bg-white/60 px-4 py-6 text-sm text-slate-600">
              {t('feed.noPosts')}
            </div>
          )}
          {problems.map((problem) => (
            <ProblemCard
              key={problem.id}
              problem={problem}
              pseudo={pseudo}
              onToggleComments={toggleComments}
              showComments={expandedProblemId === problem.id}
              onRequirePseudo={onRequirePseudo}
              onRefresh={handleRefresh}
              onLoadComments={loadComments}
              commentsLoading={commentsLoading[problem.id]}
            />
          ))}
          
          {hasMore && (
            <div ref={setTriggerRef} className="flex items-center justify-center py-4">
              {loadingMore && (
                <div className="h-8 w-8 animate-spin rounded-full border-3 border-indigo-500 border-t-transparent"></div>
              )}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
