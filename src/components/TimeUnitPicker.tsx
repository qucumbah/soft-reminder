import * as React from "react";
import { useEffect, useRef } from "react";

export const TimeUnitPicker: React.FC<{
  unitsCount: number;
  initialUnit: number;
  setCurrentUnit: (newUnit: number) => void;
}> = (props) => {
  const scrollLine = useRef<HTMLDivElement | null>(null);

  const isDragging = useRef(false); // Whether the touch is in contact
  const prevTouchY = useRef(0); // Previous touch position
  const touchOriginOffsetY = useRef(0); // Offset from the initial touch position of the line to the current touch
  const scrollY = useRef(0); // Line's current scroll offset (originating at the start of the line)
  const speedY = useRef(0); // Speed at which the line is moving

  const getCellSize = () => {
    return scrollLine.current!.clientHeight / props.unitsCount;
  };

  /**
   * Calculates the index of the closest cell to provided line offset.
   * Since there are three cells shown, the result is the center cell's index.
   * Return value may be outside of the boundaries of the cell count.
   * @param offset line offset to calculate the cell position from.
   */
  const getClosestCell = (offset: number) => {
    const centerPosition = offset + getCellSize();
    return Math.round(centerPosition / getCellSize());
  };

  /**
   * Calculates the offset at which the provided cell will be directly in the middle.
   * @param cellIndex cell to find the position of.
   */
  const getCellPosition = (cellIndex: number) => {
    // To scroll to the middle cell, current scroll has to be on the left cell.
    return (cellIndex - 1) * getCellSize();
  };

  /**
   * Updates the position of the scroll line and updates current cell value.
   * @param newScrollY new scroll for the line.
   */
  const updateScrollLinePosition = (newScrollY: number) => {
    const oldScrollY = scrollY.current;
    scrollY.current = newScrollY;

    scrollLine.current!.style.transform = `translateY(${-newScrollY}px)`;

    const oldCurrentUnit = Math.min(
      Math.max(getClosestCell(oldScrollY), 0),
      props.unitsCount - 1
    );
    const newCurrentUnit = Math.min(
      Math.max(getClosestCell(newScrollY), 0),
      props.unitsCount - 1
    );

    if (oldCurrentUnit !== newCurrentUnit) {
      props.setCurrentUnit(newCurrentUnit);
    }
  };

  // This effect will only run on initial mount, and shouldn't depend on any further changes to props.currentUnit
  React.useLayoutEffect(
    () => updateScrollLinePosition(getCellPosition(props.initialUnit)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const animate = () => {
    if (!scrollLine.current) {
      // This function may run right after the component is unmounted.
      // We need to stop it in this case.
      return;
    }

    if (isDragging.current) {
      if (Math.abs(touchOriginOffsetY.current) < 0.1) {
        speedY.current = 0;
      } else {
        speedY.current = -touchOriginOffsetY.current * 0.1;
        touchOriginOffsetY.current += speedY.current;
      }
    } else {
      // There are two speed change handlers: friction handler and push back handler.
      // If the line is too high or too low, the push back handler is used to push it back.
      // When the line is sure to reach the first in-bounds cell, pass control to the friction handler.
      // Friction handler applies constant deceleration on each step and makes a correction so that
      // the line comes to the full stop directly at the middle of closest projected cell.

      // Highest allowed scroll is when the first element is in the middle
      // To acheive this, scroll has to be at negative-first element
      const outOfBoundsHigh = scrollY.current < -getCellSize();

      // Lowest allowed scroll is when the last element is in the middle
      // To acheive this, scroll has to be at the element before the last one
      const outOfBoundsLow =
        scrollY.current > getCellSize() * (props.unitsCount - 2);

      if (outOfBoundsHigh || outOfBoundsLow) {
        // Push back handler.
        // Current expected speed is pointed towards inside of boundaries.
        // Calculate expected speed on how far away from boundary the offset is.
        // Accelerate toward the expected speed when slowing down,
        // use the expected speed when speeding back to the first in-bounds cell.
        const firstInBoundsCell = getCellPosition(
          outOfBoundsHigh ? 0 : props.unitsCount - 1
        );
        const vectorToBoundary = firstInBoundsCell - scrollY.current;

        const expectedSpeed = vectorToBoundary * 0.05;
        const currentSpeed = speedY.current;

        // If current speed vector is directed away from boundary
        if (Math.sign(currentSpeed) !== Math.sign(vectorToBoundary)) {
          // Slow down
          speedY.current += (expectedSpeed - currentSpeed) * 0.1;
        } else {
          speedY.current = expectedSpeed;
        }
      } else {
        // Friction handler.
        // Apply friction, calculate the stopping point.
        // If it's not in the middle of the cell, push towards it.
        const friction = 0.1;
        const deceleration = Math.sign(speedY.current) * friction;
        speedY.current -= deceleration;

        const startSpeed = speedY.current;
        const stepsUntilStop = speedY.current === 0 ? 0 : Math.floor(startSpeed / deceleration);
        const finalSpeed = startSpeed - deceleration * stepsUntilStop;

        // Arithmetic progression sum
        const distanceLeftToTravel =
          ((startSpeed + finalSpeed) / 2) * stepsUntilStop;
        const finalPosition = scrollY.current + distanceLeftToTravel;
        const finalCell = getClosestCell(finalPosition);
        const finalCellCenterPosition = getCellPosition(finalCell);

        // If the final position is not close enough to the middle of the cell,
        // push the scrollbar to the right speed so that it makes it there.
        if (Math.abs(finalPosition - finalCellCenterPosition) > friction) {
          // We've got a certain distance to cover.
          const distanceDiff = finalCellCenterPosition - scrollY.current;

          // We need to pick a speed at which, considering constant deceleration
          // due to friction, we'll end up somewhere close to the cell center.
          // Consider that the number of steps is continuos, and that the end speed is 0.
          // Then, using the arithmetic progression sum:
          // startSpeed / 2 * steps = distanceDiff
          // steps = startSpeed / friction
          // startSpeed / 2 * startSpeed / friction = distanceDiff
          // startSpeed = sqrt(2 * distanceDiff * friction)
          // This is an approximation because we assumed that the number of steps
          // is continuous and that the final speed is zero, but this is close
          // enough that after a few iterations we're very close to the middle.
          const newStartSpeed =
            Math.sign(distanceDiff) *
            Math.sqrt(2 * Math.abs(distanceDiff) * friction);

          speedY.current = newStartSpeed;
        }
      }
    }

    updateScrollLinePosition(scrollY.current + speedY.current);

    if (Math.abs(speedY.current) < 0.1 && !isDragging.current) {
      return;
    }

    requestAnimationFrame(animate);
  };

  const startDrag = (clientY: number) => {
    prevTouchY.current = clientY;
    touchOriginOffsetY.current = 0;
    isDragging.current = true;
    requestAnimationFrame(animate);
  };

  const stopDrag = () => {
    isDragging.current = false;
  };

  useEffect(() => {
    const handlePointerMove = (clientY: number) => {
      if (!isDragging.current) {
        return;
      }

      touchOriginOffsetY.current += clientY - prevTouchY.current;
      prevTouchY.current = clientY;
    };

    const handleTouchMove = (event: TouchEvent) =>
      handlePointerMove(event.changedTouches[0].clientY);
    const handleMouseMove = (event: MouseEvent) =>
      handlePointerMove(event.clientY);
    const handleMouseUp = (event: MouseEvent) => {
      if (!isDragging.current) {
        return;
      }

      event.preventDefault();
      event.stopImmediatePropagation();
      stopDrag();
    };

    window.addEventListener("touchmove", handleTouchMove);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("click", handleMouseUp, true);
    return () => {
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("click", handleMouseUp, true);
    };
  });

  return (
    <div className="relative w-full h-48 overflow-hidden">
      <div
        className="flex flex-col"
        onTouchStart={(event) => startDrag(event.changedTouches[0].clientY)}
        onMouseDown={(event) => startDrag(event.clientY)}
        onTouchEnd={stopDrag}
        onTouchCancel={stopDrag}
        ref={scrollLine}
      >
        {new Array(props.unitsCount).fill(null).map((_, index) => {
          return (
            <div
              key={index}
              className="relative w-full h-16 flex justify-center items-center text-5xl select-none cursor-pointer"
            >
              {index}
            </div>
          );
        })}
      </div>
    </div>
  );
};
