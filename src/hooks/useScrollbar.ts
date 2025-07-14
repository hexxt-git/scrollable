import { useState, useEffect, useCallback, useRef } from "react";

interface ScrollbarState {
  isVisible: boolean;
  // Target scroll positions (actual scroll values)
  targetScrollTop: number;
  targetScrollLeft: number;
  // Display scroll positions (smoothed values for UI)
  displayScrollTop: number;
  displayScrollLeft: number;
  scrollHeight: number;
  scrollWidth: number;
  clientHeight: number;
  clientWidth: number;
}

interface UseScrollbarOptions {
  autoHideDelay?: number;
  lerpFactor?: number;
  animationThreshold?: number;
}

export function useScrollbar(options: UseScrollbarOptions = {}) {
  const {
    autoHideDelay = 1000,
    lerpFactor = 0.2,
    animationThreshold = 15, // smoother scrolling
  } = options;

  const [state, setState] = useState<ScrollbarState>({
    isVisible: false,
    targetScrollTop: 0,
    targetScrollLeft: 0,
    displayScrollTop: 0,
    displayScrollLeft: 0,
    scrollHeight: 0,
    scrollWidth: 0,
    clientHeight: 0,
    clientWidth: 0,
  });

  const hideTimeoutRef = useRef<number | undefined>(undefined);
  const elementRef = useRef<HTMLElement>(null);
  const animationRef = useRef<number | undefined>(undefined);
  const isAnimatingRef = useRef(false);

  const lerp = useCallback((a: number, b: number, k: number) => {
    // there is an issue its frame rate dependent
    return a + (b - a) * k;
  }, []);

  // Animation loop using RAF
  const animate = useCallback(() => {
    setState((prevState) => {
      const topDiff = Math.abs(
        prevState.displayScrollTop - prevState.targetScrollTop
      );
      const leftDiff = Math.abs(
        prevState.displayScrollLeft - prevState.targetScrollLeft
      );

      // Stop animating if we're close enough to the target
      if (topDiff < animationThreshold && leftDiff < animationThreshold) {
        isAnimatingRef.current = false;
        return {
          ...prevState,
          displayScrollTop: prevState.targetScrollTop,
          displayScrollLeft: prevState.targetScrollLeft,
        };
      }

      const newDisplayScrollTop = lerp(
        prevState.displayScrollTop,
        prevState.targetScrollTop,
        lerpFactor
      );

      const newDisplayScrollLeft = lerp(
        prevState.displayScrollLeft,
        prevState.targetScrollLeft,
        lerpFactor
      );

      // Continue animating
      animationRef.current = requestAnimationFrame(animate);

      return {
        ...prevState,
        displayScrollTop: newDisplayScrollTop,
        displayScrollLeft: newDisplayScrollLeft,
      };
    });
  }, [lerp, lerpFactor, animationThreshold]);

  // Start animation if not already running
  const startAnimation = useCallback(() => {
    if (!isAnimatingRef.current) {
      isAnimatingRef.current = true;
      animationRef.current = requestAnimationFrame(animate);
    }
  }, [animate]);

  const updateScrollState = useCallback(
    (element: HTMLElement) => {
      const {
        scrollTop,
        scrollLeft,
        scrollHeight,
        scrollWidth,
        clientHeight,
        clientWidth,
      } = element;

      setState((prev) => {
        const newState = {
          ...prev,
          targetScrollTop: scrollTop,
          targetScrollLeft: scrollLeft,
          scrollHeight,
          scrollWidth,
          clientHeight,
          clientWidth,
        };

        // If display values are significantly different, start animation
        const topDiff = Math.abs(prev.displayScrollTop - scrollTop);
        const leftDiff = Math.abs(prev.displayScrollLeft - scrollLeft);

        if (topDiff > animationThreshold || leftDiff > animationThreshold) {
          // Start animation in next frame
          setTimeout(() => startAnimation(), 0);
        } else {
          // Values are close enough, sync immediately
          newState.displayScrollTop = scrollTop;
          newState.displayScrollLeft = scrollLeft;
        }

        return newState;
      });
    },
    [animationThreshold, startAnimation]
  );

  const showScrollbar = useCallback(() => {
    setState((prev) => ({ ...prev, isVisible: true }));

    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }

    hideTimeoutRef.current = setTimeout(() => {
      setState((prev) => ({ ...prev, isVisible: false }));
    }, autoHideDelay);
  }, [autoHideDelay]);

  const handleScroll = useCallback(
    (event: Event) => {
      const element = event.target as HTMLElement;
      updateScrollState(element);
      showScrollbar();
    },
    [updateScrollState, showScrollbar]
  );

  const handleMouseEnter = useCallback(() => {
    showScrollbar();
  }, [showScrollbar]);

  const handleMouseLeave = useCallback(() => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }
    setState((prev) => ({ ...prev, isVisible: false }));
  }, []);

  const scrollTo = useCallback((top: number, left?: number) => {
    if (elementRef.current) {
      elementRef.current.scrollTo({
        top,
        left: left ?? elementRef.current.scrollLeft,
        behavior: "smooth",
      });
    }
  }, []);

  const scrollBy = useCallback((top: number, left?: number) => {
    if (elementRef.current) {
      elementRef.current.scrollBy({
        top,
        left: left ?? 0,
        behavior: "smooth",
      });
    }
  }, []);

  // Cleanup function
  useEffect(() => {
    return () => {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return {
    state,
    elementRef,
    handleScroll,
    handleMouseEnter,
    handleMouseLeave,
    scrollTo,
    scrollBy,
    updateScrollState,
  };
}
