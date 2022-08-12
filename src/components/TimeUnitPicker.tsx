import * as React from "react";
import { useEffect, useRef } from "react";


export const TimeUnitPicker: React.FC<{
  unitsCount: number;
  currentUnitRef: React.MutableRefObject<number>;
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
   * Calculates scroll line is going to end up on with provided movement parameters.
   * @param scrollY current line scroll
   * @param speedY current line speed
   * @param deceleration deceleration that is applied to speed
   */
  const getFinalPosition = (
    scrollY: number,
    speedY: number,
    deceleration: number
  ) => {
    const startSpeed = speedY;
    const stepsUntilStop = Math.ceil(startSpeed / deceleration);
    const finalSpeed = startSpeed - deceleration * stepsUntilStop;

    const distanceLeftToTravel = (stepsUntilStop * (startSpeed + finalSpeed)) / 2;
    const finalPosition = scrollY + distanceLeftToTravel;

    return finalPosition;
  };

  const animate = () => {
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
      // Friction handler applies constant deceleration on each step and makes a small correction
      // so that the line comes to the full stop directly at the middle of closest projected cell.
      const friction = 0.1;
      const deceleration = Math.sign(speedY.current) * friction;

      // Highest allowed scroll is when the first element is in the middle
      // To acheive this, scroll has to be at negative-first element
      const outOfBoundsHigh = scrollY.current < -getCellSize();

      // Lowest allowed scroll is when the last element is in the middle
      // To acheive this, scroll has to be at the element before the last one
      const outOfBoundsLow = scrollY.current > getCellSize() * (props.unitsCount - 2);

      if (outOfBoundsHigh || outOfBoundsLow) {
        // Push back handler.
        // Current expected speed is pointed towards inside of boundaries
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
        if (Math.sign(currentSpeed) != Math.sign(vectorToBoundary)) {
          // Slow down
          speedY.current += (expectedSpeed - currentSpeed) * 0.1;
        } else {
          speedY.current = expectedSpeed;
        }
      } else {
        // Friction handler with correction:
        // 1. Apply a constant deceleration at each step.
        // 2. Apply correction so that when the line comes to the full stop some cell is directly in the middle.
        // Stop animation if speed is close enough to zero
        if (Math.abs(speedY.current) < friction) {
          return;
        }

        speedY.current -= deceleration;

        if (Math.abs(speedY.current) > friction) {
          const startSpeed = speedY.current;
          const stepsUntilStop = Math.ceil(startSpeed / deceleration);
          const finalSpeed = startSpeed - deceleration * stepsUntilStop;

          const distanceLeftToTravel = (stepsUntilStop * (startSpeed + finalSpeed)) / 2;
          const finalPosition = scrollY.current + distanceLeftToTravel;

          const finalCell = getClosestCell(
            getFinalPosition(scrollY.current, speedY.current, deceleration)
          );
          const finalCellCenterPosition = getCellPosition(finalCell);

          const difference = finalCellCenterPosition - finalPosition;
          speedY.current += difference / stepsUntilStop;
        }
      }
    }

    if (speedY.current === 0 && !isDragging.current) {
      return;
    }

    scrollY.current += speedY.current;

    props.currentUnitRef.current = Math.min(
      Math.max(getClosestCell(scrollY.current), 0),
      props.unitsCount - 1
    );

    scrollLine.current!.style.transform = `translateY(${-scrollY.current}px)`;

    requestAnimationFrame(animate);
  };

  const startDrag: React.TouchEventHandler = (event) => {
    prevTouchY.current = event.changedTouches[0].clientY;
    touchOriginOffsetY.current = 0;
    isDragging.current = true;
    requestAnimationFrame(animate);
  };

  const stopDrag = () => {
    isDragging.current = false;
  };

  useEffect(() => {
    const handleTouchMove = (event: TouchEvent) => {
      if (!isDragging.current) {
        return;
      }

      touchOriginOffsetY.current +=
        event.changedTouches[0].clientY - prevTouchY.current;
      prevTouchY.current = event.changedTouches[0].clientY;
    };

    window.addEventListener("touchmove", handleTouchMove);
    return () => window.removeEventListener("touchmove", handleTouchMove);
  });

  return (
    <div className="relative w-full h-48 overflow-hidden">
      <div
        className="flex flex-col"
        onTouchStart={startDrag}
        onTouchEnd={stopDrag}
        onTouchCancel={stopDrag}
        ref={scrollLine}
      >
        {new Array(props.unitsCount).fill(null).map((_, index) => {
          return (
            <div
              key={index}
              className="relative w-full h-16 flex justify-center items-center text-5xl select-none"
            >
              {index}
            </div>
          );
        })}
      </div>
    </div>
  );
};
