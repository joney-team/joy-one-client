import type { ReactNode, FC } from "react";

import { useRef, useEffect, useState } from "react";

interface FlexSizeProps {
  type: "row" | "column";
  children: (size: number) => ReactNode;
}

export const FlexSize: FC<FlexSizeProps> = ({ type, children }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<number>(0);

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const dimension =
          type === "row" ? containerRef.current.offsetWidth : containerRef.current.offsetHeight;
        setSize(dimension);
      }
    };

    updateSize();

    const resizeObserver = new ResizeObserver(updateSize);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [type]);

  return (
    <div ref={containerRef} style={{ flex: 1, display: "flex" }}>
      {size > 0 && children(size)}
    </div>
  );
};
