"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Performant, zero-dependency scroll-triggered entrance observer.
 * - Triggers once per viewport entry lifecycle.
 * - Respects prefers-reduced-motion automatically.
 * - Applies hardware-accelerated CSS opacity and transform transitions.
 */
export function useScrollReveal(options: { threshold?: number; rootMargin?: string } = {}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    if (typeof window !== "undefined") {
      const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (prefersReducedMotion) {
        setIsVisible(true);
        return;
      }
    }

    // Safety fallback: ensure content is ALWAYS visible even if intersection observer is delayed
    const fallbackTimer = setTimeout(() => {
      setIsVisible(true);
    }, 350);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(element);
          clearTimeout(fallbackTimer);
        }
      },
      {
        threshold: options.threshold ?? 0.05,
        rootMargin: options.rootMargin ?? "80px",
      }
    );

    observer.observe(element);

    return () => {
      clearTimeout(fallbackTimer);
      observer.disconnect();
    };
  }, [options.threshold, options.rootMargin]);

  return { ref, isVisible };
}
