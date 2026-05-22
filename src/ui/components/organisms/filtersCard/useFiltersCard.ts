import { useEffect, useRef, useState } from "react";

function getScrollParent(el: HTMLElement): HTMLElement {
  let node = el.parentElement;
  while (node) {
    const { overflow, overflowY } = window.getComputedStyle(node);
    if (/auto|scroll/.test(overflow + overflowY)) return node;
    node = node.parentElement;
  }
  return document.documentElement;
}

export interface UseFiltersCardReturn {
  cardRef: React.RefObject<HTMLElement | null>;
  scrolled: boolean;
}

export const useFiltersCard = (): UseFiltersCardReturn => {
  const cardRef = useRef<HTMLElement>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (!cardRef.current) return;
    const parent = getScrollParent(cardRef.current);
    let raf: number;
    const handleScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setScrolled(parent.scrollTop > 80));
    };
    parent.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      parent.removeEventListener("scroll", handleScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return { cardRef, scrolled };
};
