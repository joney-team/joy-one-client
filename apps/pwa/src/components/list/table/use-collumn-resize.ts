import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Hook to handle column resizing
 *
 * Usage example:
 * ```tsx
 * const handleColumnResize = (columnKey: string, newWidth: number) => {
 *   // Update your column settings state here
 *   // e.g., setColumnSettings(prev => prev.map(col =>
 *   //   col.id === columnKey ? { ...col, width: newWidth } : col
 *   // ));
 * };
 *
 * const resize = useColumnResize(columnKey, initialWidth, handleColumnResize);
 *
 * // Attach to a resize handle element:
 * // <div onMouseDown={resize.handleMouseDown} style={{ cursor: 'col-resize' }} />
 * ```
 *
 * Note: For the hook to update DOM elements during resize, add `data-column-key={columnKey}`
 * to your header cells and `data-body-column-key={columnKey}` to body cells.
 *
 * @param columnKey - The ID of the column being resized
 * @param initialWidth - The initial width of the column
 * @param onResize - Callback function that receives the new width when resizing is complete
 * @param minWidth - Minimum width constraint (default: 40)
 * @param disabled - Whether column resizing is disabled (default: false)
 * @returns Object with resize handlers and state: { handleMouseDown, isResizing, currentWidth }
 */
export function useColumnResize({
  columnKey,
  initialWidth,
  onResize,
  minWidth = 40,
  disabled = false,
}: {
  columnKey: string;
  initialWidth: number;
  onResize: (columnKey: string, newWidth: number) => void;
  minWidth: number;
  disabled?: boolean;
}) {
  const [isResizing, setIsResizing] = useState(false);
  const [currentWidth, setCurrentWidth] = useState<number>(initialWidth);
  const startXRef = useRef<number>(0);
  const startWidthRef = useRef<number>(0);
  const finalWidthRef = useRef<number>(0);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (disabled) {
        return;
      }

      e.preventDefault();
      e.stopPropagation();

      const startX = e.clientX;
      const startWidth = currentWidth || initialWidth || 100;

      startXRef.current = startX;
      startWidthRef.current = startWidth;
      finalWidthRef.current = startWidth;
      setIsResizing(true);

      const tableElement: HTMLElement | null = document.querySelector(
        `[data-column-key="${columnKey}"]`
      );

      const bodyCells: HTMLElement[] = Array.from(
        document.querySelectorAll(`[data-body-column-key="${columnKey}"]`)
      );

      // Helper function to update DOM widths
      const updateDOMWidths = (width: number) => {
        if (tableElement) {
          tableElement.style.minWidth = `${width}px`;
          tableElement.style.maxWidth = `${width}px`;
        }

        // Also update the corresponding cell in body
        bodyCells.forEach((cell) => {
          const htmlCell = cell as HTMLElement;
          htmlCell.style.minWidth = `${width}px`;
          htmlCell.style.maxWidth = `${width}px`;
        });
      };

      // Helper function to restore original width
      const restoreOriginalWidth = () => {
        updateDOMWidths(startWidthRef.current);
        setCurrentWidth(startWidthRef.current);
      };

      const handleMouseMove = (e: MouseEvent) => {
        const deltaX = e.clientX - startXRef.current;
        const newWidth = Math.max(minWidth, startWidthRef.current + deltaX);

        finalWidthRef.current = newWidth;
        setCurrentWidth(newWidth);
        updateDOMWidths(newWidth);
      };

      const handleMouseUp = () => {
        cleanup(true);
      };

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          e.preventDefault();
          e.stopPropagation();
          restoreOriginalWidth();
          cleanup(false);
        }
      };

      const cleanup = (shouldCallCallback: boolean) => {
        setIsResizing(false);

        if (shouldCallCallback) {
          // Call the resize callback with the final width
          onResize(columnKey, finalWidthRef.current);
        }

        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
        document.removeEventListener("keydown", handleKeyDown);
        document.body.style.cursor = "";
        document.body.style.userSelect = "";

        if (tableElement) {
          tableElement.style.removeProperty("min-width");
          tableElement.style.removeProperty("max-width");
        }

        bodyCells.forEach((cell) => {
          const htmlCell = cell as HTMLElement;
          htmlCell.style.removeProperty("min-width");
          htmlCell.style.removeProperty("max-width");
        });
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    },
    [columnKey, currentWidth, initialWidth, minWidth, onResize, disabled]
  );

  // Update current width when initialWidth changes externally
  useEffect(() => {
    setCurrentWidth(initialWidth);
  }, [initialWidth]);

  return {
    handleMouseDown,
    isResizing,
    currentWidth,
  };
}
