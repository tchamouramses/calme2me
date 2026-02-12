import { useEffect, useRef, useState } from 'react';

export function useInfiniteScroll(callback, hasMore) {
  const observerRef = useRef(null);
  const [triggerElement, setTriggerElement] = useState(null);

  useEffect(() => {
    if (!triggerElement || !hasMore) return;

    const options = {
      root: null,
      rootMargin: '100px',
      threshold: 0.1,
    };

    observerRef.current = new IntersectionObserver((entries) => {
      const target = entries[0];
      if (target.isIntersecting) {
        callback();
      }
    }, options);

    observerRef.current.observe(triggerElement);

    return () => {
      if (observerRef.current && triggerElement) {
        observerRef.current.unobserve(triggerElement);
      }
    };
  }, [triggerElement, callback, hasMore]);

  return setTriggerElement;
}
