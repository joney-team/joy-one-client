"use client";

import { classNames } from "@/utils/ui.utils";
import { FC, Fragment, MouseEventHandler, useEffect, useRef, useState } from "react";
import styles from "./horizontal-layout-resizing.module.css";

export interface HorizontalLayoutResizingProps {
  value: number;
  onFinished?: (value: number) => void;
  onResizing?: (value: number) => void;
  height?: string | number;
  position?: "fixed" | "absolute";
  min?: number;
  max?: number;
}

const pointerSize = 12;

export const HorizontalLayoutResizing: FC<HorizontalLayoutResizingProps> = ({
  onResizing,
  value,
  onFinished,
  height = "100%",
  position = "fixed",
  min,
  max,
}) => {
  const [isResizing, setIsResizing] = useState(false);
  const capturePosition = useRef<number>(0);
  const dividerRef = useRef<HTMLDivElement>(null);

  const withLimits = (value: number) => {
    let nextValue = value;
    if (min !== undefined) {
      nextValue = Math.max(min, nextValue);
    }
    if (max !== undefined) {
      nextValue = Math.min(max, nextValue);
    }
    return nextValue;
  };

  useEffect(() => {
    if (!isResizing) return;

    const updateValue = (clientX: number) => {
      const nextValue = withLimits(Math.max(0, Math.round(clientX - capturePosition.current)));
      onFinished?.(nextValue);
    };

    const handleMouseMove = (event: MouseEvent) => {
      const nextValue = withLimits(
        Math.max(0, Math.round(event.clientX - capturePosition.current)),
      );
      dividerRef.current?.style.setProperty("transform", `translateX(${nextValue - value}px)`);
      onResizing?.(nextValue);
    };

    const handleMouseUp = (event: MouseEvent) => {
      updateValue(event.clientX);
      dividerRef.current?.style.removeProperty("transform");
      setIsResizing(false);
    };

    document.body.classList.add(styles.BodyResizing);

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);

      requestAnimationFrame(() => {
        document.body.classList.remove(styles.BodyResizing);
      });
    };
  }, [isResizing, onFinished]);

  const onMouseDown: MouseEventHandler<HTMLDivElement> = (e) => {
    capturePosition.current = e.clientX - value;
    setIsResizing(true);
    e.preventDefault();
  };

  return (
    <Fragment>
      <div
        style={{ left: `${value - 1}px`, height, position }}
        ref={dividerRef}
        className={classNames(styles.Divider, {
          [styles.isResizing]: isResizing,
        })}
        onMouseDown={onMouseDown}
      />

      <div
        className={classNames(styles.SplitPointer, {
          [styles.isResizing]: isResizing,
        })}
        style={{ left: `${value - pointerSize / 2}px`, width: pointerSize, height, position }}
        onMouseDown={onMouseDown}
      />
    </Fragment>
  );
};
