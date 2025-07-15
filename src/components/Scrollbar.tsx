import React from "react";
import "./Scrollable.css";

interface ScrollbarProps {
  orientation: "vertical" | "horizontal";
  scrollSize: number;
  clientSize: number;
  scrollPosition: number;
  isVisible: boolean;
  onScroll: (delta: number) => void;
  className?: string;
}

export const Scrollbar: React.FC<ScrollbarProps> = ({
  orientation,
  scrollSize,
  clientSize,
  scrollPosition,
  isVisible,
  onScroll,
  className = "",
}) => {
  const isVertical = orientation === "vertical";
  const maxScroll = scrollSize - clientSize;
  const scrollRatio = maxScroll > 0 ? scrollPosition / maxScroll : 0;
  const trackSize = clientSize;
  const thumbSize = Math.max(20, (clientSize / scrollSize) * trackSize);
  const thumbPosition = scrollRatio * (trackSize - thumbSize);

  const handleTrackClick = (event: React.MouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const clickPosition = isVertical
      ? event.clientY - rect.top
      : event.clientX - rect.left;

    const trackClickRatio = clickPosition / trackSize;
    const newScrollPosition = trackClickRatio * maxScroll;

    console.log(newScrollPosition, scrollPosition);
    onScroll(newScrollPosition - scrollPosition);
  };

  const handleThumbMouseDown = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    let startPosition = isVertical ? event.clientY : event.clientX;
    // TODO: a bug still presists where if you scroll using the mouse then release on top of the scrollbar it jumps to where you drop it
    console.log({ startPosition });

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const currentPosition = isVertical
        ? moveEvent.clientY
        : moveEvent.clientX;
      const delta = currentPosition - startPosition;
      const scrollDelta = (delta / (trackSize - thumbSize)) * maxScroll;
      startPosition = currentPosition;

      console.log({ delta });

      onScroll(scrollDelta);
    };

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  if (scrollSize <= clientSize) {
    return null;
  }

  return (
    <div
      className={`
        scrollbar-track
        ${isVisible ? "scrollbar-track-visible" : "scrollbar-track-hidden"}
        ${
          isVertical ? "scrollbar-track-vertical" : "scrollbar-track-horizontal"
        }
        ${className}
      `}
    >
      <div className="scrollbar-track-inner" onClick={handleTrackClick}>
        <div
          className={`scrollbar-thumb ${
            !isVertical ? "scrollbar-thumb-horizontal" : ""
          }`}
          onMouseDown={handleThumbMouseDown}
          style={{
            [isVertical ? "top" : "left"]: `${thumbPosition}px`,
            [isVertical ? "height" : "width"]: `${thumbSize}px`,
            [isVertical ? "width" : "height"]: "8px",
          }}
        />
      </div>
    </div>
  );
};
