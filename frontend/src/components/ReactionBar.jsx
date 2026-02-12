import { useEffect, useRef, useState } from 'react';
import api from '../api';

const REACTIONS = [
  { id: 'like', emoji: '👍', label: 'Like' },
  { id: 'love', emoji: '❤️', label: 'Love' },
  { id: 'support', emoji: '🤗', label: 'Support' },
  { id: 'care', emoji: '💙', label: 'Care' },
  { id: 'celebrate', emoji: '🎉', label: 'Celebrate' },
];

export default function ReactionBar({ reactions = [], pseudo, resourceType, resourceId, onUpdate }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef(null);

  const reactionCounts = REACTIONS.map((r) => ({
    ...r,
    count: reactions.filter((reaction) => reaction.reaction === r.id).length,
    userReacted: reactions.some((reaction) => reaction.pseudo === pseudo && reaction.reaction === r.id),
  }));

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleReaction = async (reactionId) => {
    if (!pseudo || !pseudo.trim()) return;
    setLoading(true);

    try {
      const endpoint = resourceType === 'problem' 
        ? `/api/problems/${resourceId}/reactions`
        : `/api/comments/${resourceId}/reactions`;
      
      await api.post(endpoint, { pseudo, reaction: reactionId });
      onUpdate?.();
    } catch (err) {
      console.error('Reaction toggle failed', err);
    } finally {
      setLoading(false);
      setIsOpen(false);
    }
  };

  return (
    <div ref={containerRef} className="relative flex items-center gap-2">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={loading}
        className="rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-xs font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
      >
        😊 Réagir
      </button>

      {isOpen && (
        <div className="absolute bottom-full left-0 mb-2 rounded-2xl border border-white/60 bg-white/90 p-2 shadow-xl backdrop-blur-sm">
          <div className="flex gap-1">
            {REACTIONS.map((reaction) => (
              <button
                key={reaction.id}
                type="button"
                onClick={() => handleReaction(reaction.id)}
                className="rounded-full p-2 text-2xl transition hover:bg-slate-100"
                title={reaction.label}
              >
                {reaction.emoji}
              </button>
            ))}
          </div>
        </div>
      )}

      {reactionCounts.filter((r) => r.count > 0).length > 0 && (
        <div className="flex flex-wrap gap-1">
          {reactionCounts
            .filter((r) => r.count > 0)
            .map((reaction) => (
              <button
                key={reaction.id}
                type="button"
                onClick={() => handleReaction(reaction.id)}
                className={`rounded-full border px-2 py-1 text-xs font-semibold shadow-sm transition ${
                  reaction.userReacted
                    ? 'border-indigo-300 bg-indigo-50 text-indigo-700'
                    : 'border-slate-200 bg-white/80 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {reaction.emoji} {reaction.count}
              </button>
            ))}
        </div>
      )}
    </div>
  );
}
