import { type RefObject, useEffect, useRef } from "react";

type Options = {
  threshold?: number; // px from edge
  maxSpeed?: number; // px per frame
  enabled?: boolean;
  containerRef?: RefObject<HTMLElement | null | undefined>;
};

export function useAutoScrollOnDrag(options?: Options) {
  const threshold = options?.threshold ?? 60;
  const maxSpeed = options?.maxSpeed ?? 5;
  const enabled = options?.enabled ?? true;

  const scrollDirectionRef = useRef<0 | 1 | -1>(0);
  const rafRef = useRef<number | null>(null);

  // RAF scroll loop
  const startScrollLoop = () => {
    if (rafRef.current) return;

    const loop = () => {
      const container = options?.containerRef?.current;
      if (!enabled || scrollDirectionRef.current === 0) {
        rafRef.current = null;
        return;
      }

      // Scroll container or body
      if (container) {
        container.scrollTop += scrollDirectionRef.current * maxSpeed;
      } else {
        window.scrollBy(0, scrollDirectionRef.current * maxSpeed);
      }

      rafRef.current = requestAnimationFrame(loop);
    };

    loop();
  };

  const stopScroll = () => {
    scrollDirectionRef.current = 0;
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  };

  useEffect(() => {
    if (!enabled) return;

    const onMouseMove = (e: MouseEvent) => {
      const container = options?.containerRef?.current;
      const y = e.clientY;
      let dir: 0 | 1 | -1 = 0;

      if (container) {
        // Scroll container
        const rect = container.getBoundingClientRect();
        if (y > rect.bottom - threshold) dir = 1;
        else if (y < rect.top + threshold) dir = -1;
      } else {
        // Scroll body
        const viewportHeight = window.innerHeight;
        if (y > viewportHeight - threshold) dir = 1;
        else if (y < threshold) dir = -1;
      }

      if (dir !== scrollDirectionRef.current) {
        scrollDirectionRef.current = dir;
        if (dir === 0) stopScroll();
        else startScrollLoop();
      }
    };

    const onMouseUp = () => stopScroll();
    const onMouseLeave = () => stopScroll();

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    window.addEventListener("mouseleave", onMouseLeave);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("mouseleave", onMouseLeave);
      stopScroll();
    };
  }, [enabled]);
}
