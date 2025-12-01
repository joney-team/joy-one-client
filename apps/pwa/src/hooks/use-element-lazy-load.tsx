"use client";

import { useEffect } from "react";

export const useElementLazyLoad = (args: { isLoaded: boolean; delay?: number; id: string }) => {
  useEffect(() => {
    const element = document.getElementById(args.id);

    if (args.isLoaded && element) {
      setTimeout(() => {
        element.setAttribute("data-element-lazy-load", "loaded");
      }, args.delay ?? 0);
    }
  }, [args.isLoaded, args.id]);

  return args.id;
};

export const useWaitElementLazyLoad = ({
  id,
  onLoaded,
  timeout,
}: {
  id: string | null | undefined;
  onLoaded: () => void;
  timeout?: number;
}) => {
  useEffect(() => {
    if (!id) return;

    // Watch attribute data-element-lazy-load
    const element = document.getElementById(id);
    if (element) {
      if (element.getAttribute("data-element-lazy-load") === "loaded") {
        onLoaded();
        return;
      }

      const observer = new MutationObserver(() => {
        if (element.getAttribute("data-element-lazy-load") === "loaded") {
          onLoaded();
          observer.disconnect();
        }
      });

      observer.observe(element, { attributes: true });

      // Timeout
      if (timeout) {
        setTimeout(() => {
          observer.disconnect();
        }, timeout);
      }

      return () => {
        observer.disconnect();
      };
    }
  }, [id]);
};
