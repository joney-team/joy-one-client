export interface PlaceDropdownMenuContext {
  target: HTMLElement;
  menu: HTMLDivElement;
  offset?: { x?: number; y?: number };
  zIndex?: number;
}

export function placeDropdownMenu(context: PlaceDropdownMenuContext) {
  const { menu, target, offset } = context;

  const targetRect = target.getBoundingClientRect();

  // Get menu dimensions - use offsetWidth/offsetHeight as fallback for more reliable measurement
  const menuRect = menu.getBoundingClientRect();
  const menuWidth = menuRect.width || menu.offsetWidth || 0;
  const menuHeight = menuRect.height || menu.offsetHeight || 0;

  // If menu has no dimensions yet, skip positioning
  if (menuWidth === 0 || menuHeight === 0) {
    // Retry on next frame if dimensions aren't ready
    requestAnimationFrame(() => placeDropdownMenu(context));
    return;
  }

  // Viewport dimensions
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  // Padding from viewport edges
  const padding = 16;

  // Default offset values
  const offsetX = offset?.x ?? 0;
  const offsetY = offset?.y ?? 0;

  // Calculate initial position (below target by default)
  let placeX = targetRect.x + offsetX;
  let placeY = targetRect.y + targetRect.height + offsetY;

  // Check if menu overflows bottom of viewport
  const wouldOverflowBottom = placeY + menuHeight + padding > viewportHeight;
  // Check if menu overflows top of viewport (when flipped)
  const wouldOverflowTop = placeY - menuHeight - padding < 0;

  // Vertical positioning: prefer bottom, flip to top if needed
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

  // Ensure position is within viewport bounds
  placeX = Math.max(padding, Math.min(placeX, viewportWidth - menuWidth - padding));
  placeY = Math.max(padding, Math.min(placeY, viewportHeight - menuHeight - padding));

  menu.style.setProperty("left", `${placeX}px`);
  menu.style.setProperty("top", `${placeY}px`);
}
