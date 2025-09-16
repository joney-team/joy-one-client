import {
  CSSProperties,
  ReactNode,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";

import styles from "./flex-container.module.css";

type OverflowState = {
  vertical: boolean;
  horizontal: boolean;
  any: boolean;
  maxChildWidth: number;
  maxChildHeight: number;
  parentWidth: number;
  parentHeight: number;
};

type ChildrenRender = (overflow: OverflowState) => ReactNode;

export interface FlexContainerProps {
  children?: ReactNode | ChildrenRender;
  className?: string;
  style?: CSSProperties;
  // callback when overflow state changes
  onOverflowChange?: (overflow: OverflowState) => void;
  // optionally disable auto-scrollbars (defaults to true -> overflow: auto)
  enableAutoScroll?: boolean;
  hideScrollbars?: boolean;
}

/**
 * FlexContainer
 * - flex: 1 so it takes remaining space of a flex parent
 * - minHeight: 0 (important so it can shrink inside column flex containers)
 * - monitors content + container size and exposes overflow state
 * - sets `overflow: auto` by default so internal scroll appears when needed
 * - children can be a render function that receives the overflow state
 */
export const FlexContainer = forwardRef<HTMLDivElement, FlexContainerProps>(
  (
    {
      children,
      className = "",
      style = {},
      onOverflowChange,
      enableAutoScroll = true,
      hideScrollbars = false,
      ...rest
    },
    ref
  ) => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    useImperativeHandle(ref, () => containerRef.current as HTMLDivElement);

    const [overflow, setOverflow] = useState<OverflowState>({
      vertical: false,
      horizontal: false,
      any: false,
      maxChildWidth: 0,
      maxChildHeight: 0,
      parentWidth: 0,
      parentHeight: 0,
    });

    // compute overflow by comparing scroll sizes with client sizes
    const computeOverflow = () => {
      const el = containerRef.current;
      if (!el) return;

      const vertical = el.scrollHeight > el.clientHeight + 1;
      const horizontal = el.scrollWidth > el.clientWidth + 1;
      const any = vertical || horizontal;

      // get max child dimensions
      let maxChildWidth = 0;
      let maxChildHeight = 0;
      Array.from(el.children).forEach((child) => {
        const rect = (child as HTMLElement).getBoundingClientRect();
        if (rect.width > maxChildWidth) maxChildWidth = rect.width;
        if (rect.height > maxChildHeight) maxChildHeight = rect.height;
      });

      // parent (container) size
      const parentWidth = el.clientWidth;
      const parentHeight = el.clientHeight;

      const next: OverflowState = {
        vertical,
        horizontal,
        any,
        maxChildWidth,
        maxChildHeight,
        parentWidth,
        parentHeight,
      };
      setOverflow((prev) => {
        if (
          prev.vertical === next.vertical &&
          prev.horizontal === next.horizontal &&
          prev.maxChildWidth === next.maxChildWidth &&
          prev.maxChildHeight === next.maxChildHeight &&
          prev.parentWidth === next.parentWidth &&
          prev.parentHeight === next.parentHeight
        )
          return prev;
        return next;
      });
      if (onOverflowChange) onOverflowChange(next);
    };

    useEffect(() => {
      const el = containerRef.current;
      if (!el) return;

      computeOverflow();

      const ro = new ResizeObserver(() => computeOverflow());
      ro.observe(el);

      const mo = new MutationObserver(() => computeOverflow());
      mo.observe(el, { childList: true, subtree: true, characterData: true });

      const onWindowResize = () => computeOverflow();
      window.addEventListener("resize", onWindowResize);

      const onScroll = () => computeOverflow();
      el.addEventListener("scroll", onScroll, { passive: true });

      return () => {
        ro.disconnect();
        mo.disconnect();
        window.removeEventListener("resize", onWindowResize);
        el.removeEventListener("scroll", onScroll);
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [containerRef.current]);

    const baseStyle: CSSProperties = {
      flex: 1,
      minHeight: 0,
      minWidth: 0,
      overflow: enableAutoScroll ? "auto" : undefined,
      ...style,
    };

    const content =
      typeof children === "function" ? (children as ChildrenRender)(overflow) : children;

    return (
      <div
        ref={containerRef}
        className={`${className} ${styles.FlexContainer}`}
        style={baseStyle}
        data-hide-scrollbars={hideScrollbars}
        {...rest}
      >
        {content}
      </div>
    );
  }
);

export default FlexContainer;
