"use client";

import { classNames } from "@/utils/ui.utils";
import { FC, useEffect, useRef, useState } from "react";
import styles from "./HorizontalLayoutResizing.module.css";

export interface HorizontalLayoutResizingProps {
  value: number;
  onFinished?: (value: number) => void;
  onResizing?: (value: number) => void;
  height?: string | number;
  position?: "fixed" | "absolute";
}

const pointerSize = 12;

export const HorizontalLayoutResizing: FC<HorizontalLayoutResizingProps> = ({
  onResizing,
  value,
  onFinished,
  height = "100%",
  position = "fixed",
}) => {
  const [isResizing, setIsResizing] = useState(false);
  const capturePosition = useRef<number>(0);
  const dividerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isResizing) return;

    const updateValue = (clientX: number) => {
      const nextValue = Math.max(0, Math.round(clientX - capturePosition.current));
      onFinished?.(nextValue);
    };

    const handleMouseMove = (event: MouseEvent) => {
      dividerRef.current?.style.setProperty(
        "transform",
        `translateX(${event.clientX - capturePosition.current - value}px)`,
      );

      onResizing?.(event.clientX - capturePosition.current);
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

  return (
    <div
      className={classNames(styles.SplitPointer, {
        [styles.isResizing]: isResizing,
      })}
      style={{ left: `${value - pointerSize / 2}px`, width: pointerSize, height, position }}
      onMouseDown={(e) => {
        capturePosition.current = e.clientX - value;
        setIsResizing(true);
        e.preventDefault();
      }}
    >
      <div
        style={{ left: `${value - 1}px`, height, position }}
        ref={dividerRef}
        className={styles.Divider}
      />
    </div>
  );
};
