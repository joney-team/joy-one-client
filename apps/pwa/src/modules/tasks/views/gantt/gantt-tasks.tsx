"use client";

import { Box, Group, Stack } from "@mantine/core";
import { useEffect, useRef, useState, type FC } from "react";

export const GanttTasks: FC = () => {
  const [sized, setSized] = useState({ width: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const pageLayout = document.getElementById("LayoutPage");

    if (container && pageLayout) {
      const calculateSize = () => {
        const rect = container.getBoundingClientRect();
        setSized({
          width: document.documentElement.clientWidth - rect.left,
          height: document.documentElement.clientHeight - rect.top,
        });
      };

      calculateSize();

      window.addEventListener("resize", calculateSize);
      pageLayout.style.height = "100dvh";

      return () => {
        window.removeEventListener("resize", calculateSize);
        pageLayout.style.removeProperty("height");
      };
    }
  }, [containerRef.current]);

  return (
    <Stack
      ref={containerRef}
      style={{ width: sized.width, height: sized.height, position: "relative", overflow: "scroll" }}
      bg="blue"
    >
      <Box
        style={{
          width: 300,
          height: 6000,
          background: "yellow",
          top: 0,
          left: 0,
          position: "absolute",
        }}
      />

      <Box
        style={{
          width: 300,
          height: 6000,
          background: "teal",
          top: 0,
          left: 0,
          position: "absolute",
        }}
      />
    </Stack>
  );
};
