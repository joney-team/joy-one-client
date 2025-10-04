import { useCallback, useRef, useState, useEffect } from "react";

export interface UseInViewportOptions {
  /** Offset để render trước/sau (px hoặc %) - mặc định là 0 */
  rootMargin?: string;
  /** Ngưỡng để trigger callback - mặc định là 0 */
  threshold?: number | number[];
  /** Element gốc để tính viewport - mặc định là null (viewport) */
  root?: Element | null;
  /** Có enabled hay không - mặc định là true */
  enabled?: boolean;
  /** Callback khi trạng thái thay đổi */
  onChange?: (inViewport: boolean, entry: IntersectionObserverEntry) => void;
}

export interface UseInViewportReturnValue<T extends HTMLElement = any> {
  inViewport: boolean;
  ref: React.RefCallback<T | null>;
  entry: IntersectionObserverEntry | null;
}

export function useInViewport<T extends HTMLElement = any>(
  options: UseInViewportOptions = {}
): UseInViewportReturnValue<T> {
  const {
    rootMargin = "500px 0px 500px 0px", // Render trước 200px
    threshold = 0,
    root = null,
    enabled = true,
    onChange,
  } = options;

  const observer = useRef<IntersectionObserver | null>(null);
  const [inViewport, setInViewport] = useState(false);
  const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null);
  const nodeRef = useRef<T | null>(null);

  // Cleanup observer khi component unmount hoặc options thay đổi
  useEffect(() => {
    return () => {
      if (observer.current) {
        observer.current.disconnect();
        observer.current = null;
      }
    };
  }, [rootMargin, threshold, root]);

  const ref: React.RefCallback<T | null> = useCallback(
    (node) => {
      // Cleanup observer cũ nếu có
      if (observer.current) {
        observer.current.disconnect();
        observer.current = null;
      }

      // Reset state khi không có node
      if (!node) {
        setInViewport(false);
        setEntry(null);
        nodeRef.current = null;
        return;
      }

      nodeRef.current = node;

      // Không tạo observer nếu không support hoặc disabled
      if (!enabled || typeof IntersectionObserver === "undefined") {
        return;
      }

      // Tạo observer mới
      observer.current = new IntersectionObserver(
        (entries) => {
          const currentEntry = entries[0];
          if (currentEntry) {
            const isIntersecting = currentEntry.isIntersecting;

            setInViewport(isIntersecting);
            setEntry(currentEntry);

            // Gọi callback nếu có
            onChange?.(isIntersecting, currentEntry);
          }
        },
        {
          root,
          rootMargin,
          threshold,
        }
      );

      observer.current.observe(node);
    },
    [rootMargin, threshold, root, enabled, onChange]
  );

  return {
    ref,
    inViewport,
    entry,
  };
}

// Hook đơn giản hơn cho các trường hợp cơ bản
export function useInViewportSimple<T extends HTMLElement = any>(
  offsetTop: number = 200,
  offsetBottom: number = 200
): UseInViewportReturnValue<T> {
  return useInViewport<T>({
    rootMargin: `${offsetTop}px 0px ${offsetBottom}px 0px`,
  });
}

// Hook với lazy loading
export function useLazyLoad<T extends HTMLElement = any>(
  options: UseInViewportOptions & {
    /** Chỉ trigger một lần */
    once?: boolean;
  } = {}
) {
  const { once = true, ...restOptions } = options;
  const [hasBeenInView, setHasBeenInView] = useState(false);

  const { inViewport, ref, entry } = useInViewport<T>({
    ...restOptions,
    onChange: (inView, entry) => {
      if (inView && !hasBeenInView) {
        setHasBeenInView(true);
      }
      options.onChange?.(inView, entry);
    },
  });

  return {
    ref,
    inViewport: once ? hasBeenInView : inViewport,
    entry,
    hasBeenInView,
  };
}
