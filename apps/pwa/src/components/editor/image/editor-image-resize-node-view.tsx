"use client";

import { useLayout } from "@/layout/layout-context";
import { useColor } from "@/modules/theme/use-color";
import { Box, Image as MantineImage } from "@mantine/core";
import { NodeViewWrapper, ReactNodeViewProps } from "@tiptap/react";
import type React from "react";
import { FC, useCallback, useEffect, useRef, useState } from "react";

export const EditorImageResizeNodeView: FC<ReactNodeViewProps> = ({
  node,
  updateAttributes,
  editor,
}) => {
  const color = useColor();
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [isSelected, setIsSelected] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const resizeStartRef = useRef<{ x: number; width: number } | null>(null);
  const resizeIndexRef = useRef<number | null>(null);
  const layout = useLayout();

  const { style, ...attrs } = node.attrs;

  // Parse style string to get current width
  const getCurrentWidth = useCallback(() => {
    if (!containerRef.current) return null;
    return containerRef.current.offsetWidth;
  }, []);

  // Parse style string to extract margin
  const getCurrentMargin = useCallback(() => {
    if (!style) return "";
    const marginMatch = style.match(/margin:\s*([^;]+);?/);
    return marginMatch ? marginMatch[1].trim() : "";
  }, [style]);

  // Update attributes with new style
  const updateStyle = useCallback(
    (newStyle: string) => {
      updateAttributes({ style: newStyle });
    },
    [updateAttributes]
  );

  // Handle resize
  const handleMouseDown = useCallback(
    (e: React.MouseEvent, index: number) => {
      e.preventDefault();
      e.stopPropagation();
      setIsResizing(true);
      resizeStartRef.current = {
        x: e.clientX,
        width: getCurrentWidth() || 0,
      };
      resizeIndexRef.current = index;
    },
    [getCurrentWidth]
  );

  const handleTouchStart = useCallback(
    (e: React.TouchEvent, index: number) => {
      e.preventDefault();
      e.stopPropagation();
      setIsResizing(true);
      resizeStartRef.current = {
        x: e.touches[0].clientX,
        width: getCurrentWidth() || 0,
      };
      resizeIndexRef.current = index;
    },
    [getCurrentWidth]
  );

  useEffect(() => {
    if (!isResizing || resizeStartRef.current === null || resizeIndexRef.current === null) return;

    const currentResizeIndex = resizeIndexRef.current;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current || !imageRef.current || resizeStartRef.current === null) return;

      const deltaX = e.clientX - resizeStartRef.current.x;
      // index 0 = left (dragging left increases width, so subtract deltaX)
      // index 1 = right (dragging right increases width, so add deltaX)
      const newWidth =
        currentResizeIndex === 0
          ? resizeStartRef.current.width - deltaX
          : resizeStartRef.current.width + deltaX;

      if (newWidth > 0) {
        containerRef.current.style.width = `${newWidth}px`;
        imageRef.current.style.width = `${newWidth}px`;
      }
    };

    const handleMouseUp = () => {
      if (!containerRef.current || !imageRef.current) return;

      const newWidth = containerRef.current.offsetWidth;
      const margin = getCurrentMargin();
      const newStyle = `width: ${newWidth}px; height: auto; ${margin ? ` margin: ${margin};` : ""}`;
      updateStyle(newStyle);

      setIsResizing(false);
      resizeStartRef.current = null;
      resizeIndexRef.current = null;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!containerRef.current || !imageRef.current || resizeStartRef.current === null) return;

      const deltaX = e.touches[0].clientX - resizeStartRef.current.x;
      // index 0 = left (dragging left increases width, so subtract deltaX)
      // index 1 = right (dragging right increases width, so add deltaX)
      const newWidth =
        currentResizeIndex === 0
          ? resizeStartRef.current.width - deltaX
          : resizeStartRef.current.width + deltaX;

      if (newWidth > 0) {
        containerRef.current.style.width = `${newWidth}px`;
        imageRef.current.style.width = `${newWidth}px`;
      }
    };

    const handleTouchEnd = () => {
      if (!containerRef.current || !imageRef.current) return;

      const newWidth = containerRef.current.offsetWidth;
      const margin = getCurrentMargin();
      const newStyle = `width: ${newWidth}px; height: auto; cursor: pointer;${
        margin ? ` margin: ${margin};` : ""
      }`;
      updateStyle(newStyle);

      setIsResizing(false);
      resizeStartRef.current = null;
      resizeIndexRef.current = null;
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("touchmove", handleTouchMove, { passive: false });
    document.addEventListener("touchend", handleTouchEnd);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, [isResizing, getCurrentMargin, updateStyle]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        containerRef.current &&
        !containerRef.current.contains(target) &&
        !target.closest("[data-mantine-action-icon]")
      ) {
        setIsSelected(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  // Handle container click
  const handleContainerClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setIsSelected(true);

      if (layout.view === "mobile") {
        const focusedElement = document.querySelector(".ProseMirror-focused") as HTMLElement;
        focusedElement?.blur();
      }
    },
    [layout.view]
  );

  const barWidth = layout.view === "mobile" ? 4 : 3;
  const barHeight = layout.view === "mobile" ? 40 : 30;

  const editable = editor?.isEditable ?? true;

  // Parse style string to object
  const parseStyle = useCallback(
    (styleStr: string | undefined): React.CSSProperties => {
      if (!styleStr || typeof styleStr !== "string") {
        return { width: "100%", height: "auto" };
      }

      const styles: React.CSSProperties = {};
      const parts = styleStr.split(";").filter(Boolean);

      parts.forEach((part) => {
        const [key, value] = part.split(":").map((s) => s.trim());
        if (key && value) {
          const camelKey = key.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
          if (camelKey === "width") {
            styles.width = value;
          } else if (camelKey === "height") {
            styles.height = value;
          } else if (camelKey === "margin") {
            styles.margin = value;
          } else if (camelKey === "cursor") {
            styles.cursor = value as React.CSSProperties["cursor"];
          }
        }
      });

      return styles;
    },
    [editable]
  );

  const imageStyle = parseStyle(style);

  if (!editable) {
    return (
      <NodeViewWrapper as="div" style={imageStyle}>
        <MantineImage
          ref={imageRef}
          src={attrs.src}
          alt={attrs.alt}
          {...Object.entries(attrs).reduce((acc, [key, value]) => {
            if (value !== undefined && value !== null && key !== "style") {
              acc[key] = value as string;
            }
            return acc;
          }, {} as Record<string, string>)}
        />
      </NodeViewWrapper>
    );
  }

  return (
    <NodeViewWrapper as="div">
      <Box
        ref={containerRef}
        style={{
          position: "relative",
          display: "inline-block",
          ...(isSelected
            ? { border: `1px solid ${color({ light: "gray.3", dark: "gray.8" })}` }
            : { border: `1px solid transparent` }),
          cursor: "pointer",
        }}
        onClick={handleContainerClick}
        component="div"
      >
        <MantineImage
          ref={imageRef}
          src={attrs.src}
          alt={attrs.alt}
          style={imageStyle}
          {...Object.entries(attrs).reduce((acc, [key, value]) => {
            if (value !== undefined && value !== null && key !== "style") {
              acc[key] = value as string;
            }
            return acc;
          }, {} as Record<string, string>)}
        />

        {isSelected && (
          <>
            {/* Left resize bar */}
            <Box
              style={{
                position: "absolute",
                left: -barWidth / 2,
                top: "50%",
                transform: "translateY(-50%)",
                width: barWidth,
                height: barHeight,
                backgroundColor: color({ light: "gray.6", dark: "gray.4" }),
                borderRadius: 2,
                cursor: "ew-resize",
                zIndex: 10,
              }}
              component="div"
              onMouseDown={(e) => handleMouseDown(e, 0)}
              onTouchStart={(e) => handleTouchStart(e, 0)}
            />

            {/* Right resize bar */}
            <Box
              style={{
                position: "absolute",
                right: -barWidth / 2,
                top: "50%",
                transform: "translateY(-50%)",
                width: barWidth,
                height: barHeight,
                backgroundColor: color({ light: "gray.6", dark: "gray.4" }),
                borderRadius: 2,
                cursor: "ew-resize",
                zIndex: 10,
              }}
              component="div"
              onMouseDown={(e) => handleMouseDown(e, 1)}
              onTouchStart={(e) => handleTouchStart(e, 1)}
            />
          </>
        )}
      </Box>
    </NodeViewWrapper>
  );
};
