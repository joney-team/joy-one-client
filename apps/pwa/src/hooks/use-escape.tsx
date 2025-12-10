"use client";

import { FC, useEffect, useRef } from "react";

const escapeQueue = new Map<string, { func: () => void; order: number }>();
let orderCounter = 0;

export const useEscape = (args: { id: string; onEscape: () => void; active?: boolean }) => {
  const { id, onEscape, active = true } = args;
  const onEscapeRef = useRef(onEscape);

  // Keep the ref updated with the latest callback
  useEffect(() => {
    onEscapeRef.current = onEscape;
  }, [onEscape]);

  useEffect(() => {
    if (!active) {
      // Remove from queue if inactive
      escapeQueue.delete(id);
      return;
    }

    const order = orderCounter++;
    escapeQueue.set(id, { func: () => onEscapeRef.current(), order });

    return () => {
      escapeQueue.delete(id);
    };
  }, [id, active]);
};

export const EscapeHandler: FC = () => {
  useEffect(() => {
    const onEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        const sortedQueue = Array.from(escapeQueue.values()).sort((a, b) => b.order - a.order);
        if (!sortedQueue[0]) return;
        e.preventDefault();
        e.stopPropagation();

        // Execute the most recently registered escape handler (LIFO - Last In First Out)
        sortedQueue[0]?.func();
      }
    };

    window.addEventListener("keydown", onEscape);

    return () => {
      window.removeEventListener("keydown", onEscape);
    };
  }, []); // Empty dependency array - only run once on mount

  return null;
};
