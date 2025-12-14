import { zIndexes } from "@joy-one-client/config/layout";

export interface PlaceDropdownMenuElements {
  target: HTMLElement;
  menu: HTMLDivElement;
}

export interface PlaceDropdownMenuOptions {
  offset?: { x?: number; y?: number };
  zIndex?: number;
  position?: "top" | "bottom" | "left" | "right";
}

export function placeDropdownMenu(
  elements: PlaceDropdownMenuElements,
  options?: PlaceDropdownMenuOptions
) {
  const { menu, target } = elements;
  const { offset, position, zIndex } = options ?? {};

  menu.style.setProperty("z-index", zIndex?.toString() ?? (zIndexes.commonModals + 2).toString());

  const targetRect = target.getBoundingClientRect();

  // Get menu dimensions - use offsetWidth/offsetHeight as fallback for more reliable measurement
  const menuRect = menu.getBoundingClientRect();
  const menuWidth = menuRect.width || menu.offsetWidth || 0;
  const menuHeight = menuRect.height || menu.offsetHeight || 0;

  // If menu has no dimensions yet, skip positioning
  if (menuWidth === 0 || menuHeight === 0) {
    // Retry on next frame if dimensions aren't ready
    // requestAnimationFrame(() => placeDropdownMenu(elements, options));
    throw new Error("Menu has no dimensions");
  }

  // Viewport dimensions
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  // Padding from viewport edges
  const padding = 16;

  // Default offset values
  const offsetX = offset?.x ?? 0;
  const offsetY = offset?.y ?? 0;

  let placeX: number;
  let placeY: number;

  // Calculate initial position based on position preference
  switch (position) {
    case "top":
      // Place above target
      placeX = targetRect.x + offsetX;
      placeY = targetRect.y - menuHeight - offsetY;
      break;
    case "bottom":
      // Place below target (default)
      placeX = targetRect.x + offsetX;
      placeY = targetRect.y + targetRect.height + offsetY;
      break;
    case "left":
      // Place to the left of target
      placeX = targetRect.x - menuWidth - offsetX;
      placeY = targetRect.y + offsetY;
      break;
    case "right":
      // Place to the right of target
      placeX = targetRect.x + targetRect.width + offsetX;
      placeY = targetRect.y + offsetY;
      break;
    default:
      // Default to bottom if position is not specified
      placeX = targetRect.x + offsetX;
      placeY = targetRect.y + targetRect.height + offsetY;
      break;
  }

  // Adjust position based on viewport constraints
  if (position === "top" || position === "bottom" || !position) {
    // Vertical positioning: check for overflow and adjust
    const wouldOverflowBottom = placeY + menuHeight + padding > viewportHeight;
    const wouldOverflowTop = placeY - padding < 0;

    if (position === "top") {
      // If top position overflows, try bottom
      if (wouldOverflowTop && !wouldOverflowBottom) {
        placeY = targetRect.y + targetRect.height + offsetY;
      } else if (wouldOverflowTop && wouldOverflowBottom) {
        // If both overflow, choose the side with more space
        const spaceBelow = viewportHeight - (targetRect.y + targetRect.height);
        const spaceAbove = targetRect.y;
        if (spaceBelow > spaceAbove) {
          placeY = targetRect.y + targetRect.height + offsetY;
        } else {
          placeY = padding;
        }
      }
    } else {
      // Default bottom behavior: prefer bottom, flip to top if needed
      if (wouldOverflowBottom && !wouldOverflowTop) {
        // Flip to top
        placeY = targetRect.y - menuHeight - offsetY;
      } else if (wouldOverflowBottom && wouldOverflowTop) {
        // If both overflow, choose the side with more space
        const spaceBelow = viewportHeight - (targetRect.y + targetRect.height);
        const spaceAbove = targetRect.y;

        if (spaceAbove > spaceBelow) {
          placeY = targetRect.y - menuHeight - offsetY;
        } else {
          // Keep bottom but clamp to viewport
          placeY = viewportHeight - menuHeight - padding;
        }
      }
    }

    // Horizontal positioning: adjust to prevent overflow
    const wouldOverflowRight = placeX + menuWidth + padding > viewportWidth;
    const wouldOverflowLeft = placeX - padding < 0;

    if (wouldOverflowRight && !wouldOverflowLeft) {
      // Shift left to fit
      placeX = viewportWidth - menuWidth - padding;
    } else if (wouldOverflowLeft && !wouldOverflowRight) {
      // Shift right to fit
      placeX = padding;
    } else if (wouldOverflowRight && wouldOverflowLeft) {
      // If menu is wider than viewport, center it
      placeX = Math.max(padding, (viewportWidth - menuWidth) / 2);
    }
  } else if (position === "left" || position === "right") {
    // Horizontal positioning: check for overflow and adjust
    const wouldOverflowRight = placeX + menuWidth + padding > viewportWidth;
    const wouldOverflowLeft = placeX - padding < 0;

    if (position === "left") {
      // If left position overflows, try right
      if (wouldOverflowLeft && !wouldOverflowRight) {
        placeX = targetRect.x + targetRect.width + offsetX;
      } else if (wouldOverflowLeft && wouldOverflowRight) {
        // If both overflow, choose the side with more space
        const spaceRight = viewportWidth - (targetRect.x + targetRect.width);
        const spaceLeft = targetRect.x;
        if (spaceRight > spaceLeft) {
          placeX = targetRect.x + targetRect.width + offsetX;
        } else {
          placeX = padding;
        }
      }
    } else {
      // Right position: if overflows, try left
      if (wouldOverflowRight && !wouldOverflowLeft) {
        placeX = targetRect.x - menuWidth - offsetX;
      } else if (wouldOverflowRight && wouldOverflowLeft) {
        // If both overflow, choose the side with more space
        const spaceRight = viewportWidth - (targetRect.x + targetRect.width);
        const spaceLeft = targetRect.x;
        if (spaceLeft > spaceRight) {
          placeX = targetRect.x - menuWidth - offsetX;
        } else {
          placeX = viewportWidth - menuWidth - padding;
        }
      }
    }

    // Vertical positioning: adjust to prevent overflow
    const wouldOverflowBottom = placeY + menuHeight + padding > viewportHeight;
    const wouldOverflowTop = placeY - padding < 0;

    if (wouldOverflowBottom && !wouldOverflowTop) {
      // Shift up to fit
      placeY = viewportHeight - menuHeight - padding;
    } else if (wouldOverflowTop && !wouldOverflowBottom) {
      // Shift down to fit
      placeY = padding;
    } else if (wouldOverflowBottom && wouldOverflowTop) {
      // If menu is taller than viewport, center it vertically
      placeY = Math.max(padding, (viewportHeight - menuHeight) / 2);
    }
  }

  // Ensure position is within viewport bounds
  placeX = Math.max(padding, Math.min(placeX, viewportWidth - menuWidth - padding));
  placeY = Math.max(padding, Math.min(placeY, viewportHeight - menuHeight - padding));

  menu.style.setProperty("left", `${placeX}px`);
  menu.style.setProperty("top", `${placeY}px`);
}
