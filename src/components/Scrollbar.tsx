import React from "react";

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
        absolute
        pointer-events-none
        z-50
        transition-opacity
        duration-150
        ease-out
        ${isVisible ? "opacity-100 visible" : "opacity-0"}
        ${
          isVertical ? "top-0 right-0 w-4 h-full" : "bottom-0 left-0 h-4 w-full"
        }
        ${className}
      `}
    >
      <div
        className="relative w-full h-full pointer-events-auto"
        onClick={handleTrackClick}
      >
        <div
          className="
            absolute
            bg-black/20
            dark:bg-white/20
            hover:bg-black/40
            dark:hover:bg-white/40
            active:bg-black/50
            dark:active:bg-white/50
            min-w-4
            min-h-4
            cursor-pointer
            transition-colors
            duration-300
            ease-out
          "
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
