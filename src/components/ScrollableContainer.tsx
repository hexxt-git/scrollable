import React, { useEffect, useRef } from "react";
import { useScrollbar } from "../hooks/useScrollbar";
import { Scrollbar } from "./Scrollbar";

interface ScrollableContainerProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  autoHideDelay?: number;
  showVerticalScrollbar?: boolean;
  showHorizontalScrollbar?: boolean;
  lerpFactor?: number;
  animationThreshold?: number;
}

export const ScrollableContainer: React.FC<ScrollableContainerProps> = ({
  children,
  className = "",
  style = {},
  autoHideDelay = 1000,
  showVerticalScrollbar = true,
  showHorizontalScrollbar = true,
  lerpFactor = 0.1,
  animationThreshold = 15,
}) => {
  const {
    state,
    elementRef,
    handleScroll,
    handleMouseEnter,
    handleMouseLeave,
    updateScrollState,
  } = useScrollbar({
    autoHideDelay,
    lerpFactor,
    animationThreshold,
  });

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (element) {
      updateScrollState(element);
    }
  }, [updateScrollState, elementRef]);

  const handleVerticalScroll = (delta: number) => {
    if (elementRef.current) {
      // TODO: i don't know if this makes sense or if it should be incorporated into the hook
      // it does need to go in the hook if we want to animate the content too
      elementRef.current.scrollTop += delta;
    }
  };

  const handleHorizontalScroll = (delta: number) => {
    if (elementRef.current) {
      elementRef.current.scrollLeft += delta;
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden w-full h-full ${className}`}
      style={style}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div
        ref={elementRef as React.RefObject<HTMLDivElement>}
        className="w-full h-full overflow-auto scrollbar-hide"
        onScroll={(e) => handleScroll(e.nativeEvent)}
      >
        {children}
      </div>

      {showVerticalScrollbar && (
        <Scrollbar
          orientation="vertical"
          scrollSize={state.scrollHeight}
          clientSize={state.clientHeight}
          scrollPosition={state.displayScrollTop}
          isVisible={state.isVisible}
          onScroll={handleVerticalScroll}
        />
      )}

      {showHorizontalScrollbar && (
        <Scrollbar
          orientation="horizontal"
          scrollSize={state.scrollWidth}
          clientSize={state.clientWidth}
          scrollPosition={state.displayScrollLeft}
          isVisible={state.isVisible}
          onScroll={handleHorizontalScroll}
        />
      )}
    </div>
  );
};
