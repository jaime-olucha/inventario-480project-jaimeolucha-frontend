import { useCallback, useRef, useState } from "react";

export function useFab(options?: IntersectionObserverInit) {
  const [showFab, setShowFab] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const btnRef = useCallback((node: HTMLButtonElement | null) => {

    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }

    if (!node) {
      setShowFab(false);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => setShowFab(!entry.isIntersecting),
      { threshold: 0, ...options }
    );
    observer.observe(node);
    observerRef.current = observer;
  }, []);

  return { btnRef, showFab };
}
