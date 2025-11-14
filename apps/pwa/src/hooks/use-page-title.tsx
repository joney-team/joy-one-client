"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

/**
 * Detects if a title looks like a URL path (e.g., "domain/tasks/12313")
 */
const isUrlPath = (title: string, currentPathname?: string): boolean => {
  // If title exactly matches the pathname, it's definitely a URL path
  if (currentPathname && (title === currentPathname || title.endsWith(currentPathname))) {
    return true;
  }

  // Check if title contains a path-like pattern (starts with domain or contains slashes)
  // Common patterns: "domain/path", "/path", or just the path segment
  // Pattern matches: "domain/path", "domain.com/path", "/path", but not "Home / Dashboard"
  return /^[^/]*\/[^/]/.test(title) || (title.startsWith("/") && title.length > 1);
};

/**
 * Hook to prevent page title flickering during Next.js navigation.
 *
 * When navigating between pages with generateMetadata, there's a brief moment
 * where the title shows the URL path before the metadata loads. This hook
 * keeps the previous page title visible until the new title is ready.
 *
 * @example
 * ```tsx
 * export default function Page() {
 *   usePageTitle();
 *   return <div>Content</div>;
 * }
 * ```
 */
export const usePageTitle = () => {
  const pathname = usePathname();
  const previousTitleRef = useRef<string | null>(null);
  const isRestoringRef = useRef(false);

  useEffect(() => {
    // Initialize with current title if it's valid
    const currentTitle = document.title;
    if (currentTitle && !isUrlPath(currentTitle)) {
      previousTitleRef.current = currentTitle;
    }
  }, []);

  useEffect(() => {
    // When pathname changes, we're navigating to a new page
    // Store the current title as the previous title if it's valid
    const currentTitle = document.title;
    if (currentTitle && !isUrlPath(currentTitle, pathname)) {
      previousTitleRef.current = currentTitle;
    }

    // Immediately check if title became a URL path after navigation
    // This handles the case where Next.js sets the title before our observer is set up
    const checkAndRestore = () => {
      const title = document.title;
      if (isUrlPath(title, pathname) && previousTitleRef.current && !isRestoringRef.current) {
        isRestoringRef.current = true;
        document.title = previousTitleRef.current;
      } else if (!isUrlPath(title, pathname) && title) {
        previousTitleRef.current = title;
        isRestoringRef.current = false;
      }
    };

    // Check immediately and after a short delay to catch early title changes
    checkAndRestore();
    const immediateCheck = setTimeout(checkAndRestore, 0);
    const delayedCheck = setTimeout(checkAndRestore, 100);

    // Set up a MutationObserver to watch for title changes
    const observer = new MutationObserver(() => {
      checkAndRestore();
    });

    // Observe changes to the title element
    const titleElement = document.querySelector("title");
    if (titleElement) {
      observer.observe(titleElement, {
        childList: true,
        subtree: true,
        characterData: true,
      });
    }

    // Also check periodically in case MutationObserver misses changes
    // This is a fallback for cases where Next.js updates the title in a way
    // that doesn't trigger the observer. We'll run this for a short period after navigation
    let checkCount = 0;
    const maxChecks = 20; // Check for up to 1 second (20 * 50ms)
    const checkInterval = setInterval(() => {
      checkAndRestore();
      checkCount++;
      if (checkCount >= maxChecks) {
        clearInterval(checkInterval);
      }
    }, 50); // Check every 50ms during navigation

    return () => {
      observer.disconnect();
      clearInterval(checkInterval);
      clearTimeout(immediateCheck);
      clearTimeout(delayedCheck);
    };
  }, [pathname]);
};
