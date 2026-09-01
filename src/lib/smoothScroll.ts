import Lenis from 'lenis';
import 'lenis/dist/lenis.css';

let lenisInstance: Lenis | null = null;
let mutationObserver: MutationObserver | null = null;
let resizeObserver: ResizeObserver | null = null;

export function initSmoothScroll(): () => void {
  // Only init in browser environment
  if (typeof window === 'undefined') return () => {};

  // Destroy previous instance if exists
  if (lenisInstance) {
    lenisInstance.destroy();
    lenisInstance = null;
  }

  // Create robust Lenis instance
  const lenis = new Lenis({
    duration: 1.2,
    easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    orientation: 'vertical',
    gestureOrientation: 'vertical',
    smoothWheel: true,
    wheelMultiplier: 1,
    touchMultiplier: 1.1,
    infinite: false,
    autoRaf: false,
    prevent: (node) => {
      // Allow native scroll inside modals, drawers, select dropdowns, textareas, etc.
      return (
        node.hasAttribute('data-lenis-prevent') ||
        Boolean(node.closest('[data-lenis-prevent]')) ||
        Boolean(node.closest('.overflow-y-auto')) ||
        Boolean(node.closest('.overflow-auto')) ||
        Boolean(node.closest('textarea')) ||
        Boolean(node.closest('select'))
      );
    },
  });

  lenisInstance = lenis;

  let rafId: number;

  function raf(time: number) {
    lenis.raf(time);
    rafId = requestAnimationFrame(raf);
  }

  rafId = requestAnimationFrame(raf);

  // Debounced resize handler
  let resizeTimeout: NodeJS.Timeout | null = null;
  const handleResize = () => {
    if (resizeTimeout) clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      lenis.resize();
    }, 100);
  };

  // Watch window resize
  window.addEventListener('resize', handleResize, { passive: true });

  // Watch DOM mutations (for SPA page/tab/category changes) to recalculate scroll bounds
  try {
    if (typeof MutationObserver !== 'undefined') {
      mutationObserver = new MutationObserver(() => {
        handleResize();
      });
      mutationObserver.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: false,
      });
    }

    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => {
        handleResize();
      });
      resizeObserver.observe(document.body);
    }
  } catch (e) {
    console.warn('Observer registration error:', e);
  }

  // Attach global click handler for smooth scrolling to anchor links
  const handleAnchorClick = (e: MouseEvent) => {
    const target = (e.target as HTMLElement)?.closest('a');
    if (!target) return;

    const href = target.getAttribute('href');
    if (href && href.startsWith('#') && href.length > 1) {
      const element = document.querySelector(href);
      if (element) {
        e.preventDefault();
        lenis.scrollTo(element as HTMLElement, {
          offset: -80,
          duration: 1.3,
          easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        });
      }
    }
  };

  document.addEventListener('click', handleAnchorClick);

  return () => {
    cancelAnimationFrame(rafId);
    if (resizeTimeout) clearTimeout(resizeTimeout);
    window.removeEventListener('resize', handleResize);
    document.removeEventListener('click', handleAnchorClick);
    mutationObserver?.disconnect();
    resizeObserver?.disconnect();
    lenis.destroy();
    lenisInstance = null;
  };
}

export function getLenis(): Lenis | null {
  return lenisInstance;
}

export function resizeScroll() {
  lenisInstance?.resize();
}

export function scrollToTarget(target: string | HTMLElement, offset = -80) {
  if (lenisInstance) {
    lenisInstance.scrollTo(target, {
      offset,
      duration: 1.2,
    });
  } else if (typeof window !== 'undefined') {
    if (typeof target === 'string') {
      if (target === 'body' || target === 'html' || target === 'top') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        const el = document.querySelector(target);
        el?.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  }
}

export function pauseScroll() {
  lenisInstance?.stop();
}

export function resumeScroll() {
  lenisInstance?.start();
}
