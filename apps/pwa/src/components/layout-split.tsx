"use client";

import { useColor } from "@/modules/theme/use-color";
import { Group, GroupProps, Stack } from "@mantine/core";
import { useForceUpdate, useMouse } from "@mantine/hooks";
import { FC, PropsWithChildren, useEffect, useRef, useState } from "react";

interface LayoutSplitProps extends Omit<GroupProps, "value" | "onChange"> {
  value: number;
  onChange: (value: number) => void;
}

export const LayoutSplit: FC<PropsWithChildren<LayoutSplitProps>> = (props) => {
  const { value, onChange, ...rest } = props;
  const [isHovered, setIsHovered] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const color = useColor();
  const mouse = useMouse({ resetOnExit: true });
  const pointerX = useRef(0);
  const forceUpdate = useForceUpdate();

  useEffect(() => {
    if (isResizing) {
      const containerRect = mouse.ref.current?.getBoundingClientRect();
      pointerX.current = mouse.x / containerRect.width;
      forceUpdate();
    }
  }, [mouse.x, mouse.ref.current, isResizing]);

  useEffect(() => {
    if (isResizing) {
      const onMouseUp = () => {
        props.onChange(pointerX.current);
        setIsResizing(false);
      };

      window.addEventListener("mouseup", onMouseUp);

      return () => {
        window.removeEventListener("mouseup", onMouseUp);
      };
    }
  }, [isResizing]);

  return (
    <Group
      className={isResizing ? "unselectable" : undefined}
      gap={0}
      w="100%"
      {...rest}
      wrap="nowrap"
      pos="relative"
      ref={mouse.ref}
      style={{
        cursor: isResizing ? "col-resize" : undefined,
        zIndex: 10,
      }}
    >
      {props.children}

      {isResizing && (
        <Stack
          pos="absolute"
          top={0}
          bottom={0}
          w={2}
          bg={color("primary.7")}
          style={{
            left: `${pointerX.current * 100}%`,
            transform: "translateX(-50%)",
            cursor: "col-resize",
            zIndex: 10,
          }}
        />
      )}

      <Stack
        pos="absolute"
        w={20}
        h="100%"
        opacity={0.5}
        style={{
          left: `${value * 100}%`,
          transform: "translateX(-50%)",
          zIndex: 10,
        }}
        align="center"
        justify="center"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onMouseDown={() => setIsResizing(true)}
      >
        <Stack
          pos="relative"
          h="100%"
          w={5}
          bg={isHovered ? color("primary.3") : "transparent"}
          style={{
            cursor: "col-resize",
          }}
        />
      </Stack>
    </Group>
  );
};
