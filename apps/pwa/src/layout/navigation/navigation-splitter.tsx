"use client";

import { useColor } from "@/modules/theme/use-color";
import { Stack } from "@mantine/core";
import { useMouse } from "@mantine/hooks";
import { FC, Fragment, LegacyRef, useEffect, useRef, useState } from "react";
import { useWorkspaceLayout } from "../hooks/use-workspace-layout";
import { useLayout } from "../layout-context";

const config = {
  minNavigationWidth: 60,
  maxNavigationWidth: 400,
};

const SplitPointer: FC<{ ref: LegacyRef<HTMLDivElement> | undefined }> = (props) => {
  const color = useColor();
  const mouse = useMouse({ resetOnExit: false });
  const workspaceLayout = useWorkspaceLayout();

  const width =
    mouse.x <= config.minNavigationWidth
      ? config.minNavigationWidth
      : mouse.x >= config.maxNavigationWidth
      ? config.maxNavigationWidth
      : mouse.x;

  return (
    <Fragment>
      <Stack
        pos="fixed"
        top={0}
        left={0}
        right={0}
        bottom={0}
        bg="transparent"
        style={{ zIndex: 100 }}
      />
      <Stack
        ref={props.ref}
        pos="fixed"
        top={0}
        bottom={0}
        w={2}
        opacity={mouse.x > 0 ? 1 : 0}
        data-position={width}
        bg={color("primary.7")}
        style={{
          left: width,
          zIndex: workspaceLayout.pannelZIndex + 1,
          transform: "translateX(-50%)",
          cursor: "col-resize",
        }}
      />
    </Fragment>
  );
};

export const WorkspaceNavigationSplitter: FC = () => {
  const layout = useLayout();
  const color = useColor();
  const workspaceLayout = useWorkspaceLayout();
  const hoverRef = useRef<NodeJS.Timeout | null>(null);

  const [isHovering, setIsHovering] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const pointerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isResizing && typeof pointerRef.current?.dataset.position === "string") {
      const onMouseUp = () => {
        setIsResizing(false);
        const width = Math.round(+pointerRef.current!.dataset.position!);
        workspaceLayout.setNavigationWidth(width);
      };

      window.addEventListener("mouseup", onMouseUp);

      return () => {
        window.removeEventListener("mouseup", onMouseUp);
      };
    }
  }, [isResizing]);

  if (layout.view !== "desktop") return null;

  return (
    <Fragment>
      {isResizing && <SplitPointer ref={pointerRef} />}

      <Stack
        pos="fixed"
        w={20}
        h="100%"
        opacity={isHovering ? 0.5 : 0}
        style={{
          left: `${(workspaceLayout.navigationWidth / layout.width) * 100}%`,
          zIndex: workspaceLayout.pannelZIndex + 1,
          top: 0,
          transform: "translateX(-50%)",
          cursor: "col-resize",
        }}
        align="center"
        justify="center"
        onMouseDown={() => setIsResizing(true)}
        onMouseEnter={() => {
          hoverRef.current = setTimeout(() => {
            setIsHovering(true);
          }, 500);
        }}
        onMouseLeave={() => {
          if (hoverRef.current) clearTimeout(hoverRef.current);
          setIsHovering(false);
        }}
      >
        <Stack bg={color("primary.2")} pos="relative" h="100%" w={5} />
      </Stack>
    </Fragment>
  );
};
