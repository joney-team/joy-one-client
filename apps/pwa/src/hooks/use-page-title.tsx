"use client";

import { requestAnimationFrameTimes } from "@joy-one/utils/request-animation-frame";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

/**
 * Detects if a title looks like a URL path (e.g., "domain/tasks/12313")
 */
const isUrlPath = (title: string, currentPathname?: string): boolean => {
  if (!title) return false;

  // If title exactly matches the pathname, it's definitely a URL path
  if (currentPathname) {
    const normalizedPathname = currentPathname.toLowerCase();
    const normalizedTitle = title.toLowerCase();

    if (
      normalizedTitle === normalizedPathname ||
      normalizedTitle.endsWith(normalizedPathname) ||
      normalizedTitle.includes(normalizedPathname + " ") ||
      normalizedTitle.includes(" " + normalizedPathname)
    ) {
      // But exclude if it's part of a proper title format (e.g., "Page Title - /path" is valid)
      // Only consider it a URL path if the pathname is at the start or the title is very short
      if (normalizedTitle.startsWith(normalizedPathname) || title.length < 30) {
        return true;
      }
    }
  }

  // Check if title contains a path-like pattern
  // Pattern matches: "domain/path", "domain.com/path", "/path/to/page"
  // But not: "Home / Dashboard" (which has spaces around the slash)
  const hasPathPattern =
    /^[^/]*\/[^/\s]+/.test(title) ||
    (title.startsWith("/") && title.length > 1 && !title.includes(" - "));

  // Also check if it looks like a URL without protocol
  const looksLikeUrl =
    /^[a-z0-9.-]+\.[a-z]{2,}\//i.test(title) || /^[a-z0-9.-]+\.[a-z]{2,}$/i.test(title);

  return hasPathPattern || looksLikeUrl;
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
  const lastPathnameRef = useRef<string | null>(null);

  // Initialize with current title if it's valid
  useEffect(() => {
    const currentTitle = document.title;
    if (currentTitle && !isUrlPath(currentTitle)) {
      previousTitleRef.current = currentTitle;
    }
  }, []);

  useEffect(() => {
    // When pathname changes, we're navigating to a new page
    const previousPathname = lastPathnameRef.current;
    lastPathnameRef.current = pathname;

    // Store the current title as the previous title if it's valid
    const currentTitle = document.title;
    if (currentTitle && !isUrlPath(currentTitle, pathname)) {
      previousTitleRef.current = currentTitle;
    }

    // Only start monitoring if we actually navigated (pathname changed)
    if (previousPathname === pathname) {
      return;
    }

    // Proactively restore title immediately on navigation to prevent flicker
    // This is the key fix - we restore before Next.js has a chance to set the URL path
    if (previousTitleRef.current) {
      // Use multiple strategies to ensure the title is set
      document.title = previousTitleRef.current;
      requestAnimationFrameTimes(() => {
        if (isUrlPath(document.title, pathname) && previousTitleRef.current) {
          document.title = previousTitleRef.current;
        }
      });
    }

    let isActive = true;
    let lastCheckedTitle = document.title;

    const checkAndRestore = () => {
      if (!isActive) return;

      const title = document.title;

      // Skip if title hasn't changed
      if (title === lastCheckedTitle) {
        return;
      }

      lastCheckedTitle = title;

      if (isUrlPath(title, pathname)) {
        // Title is a URL path - restore previous if we have one
        if (previousTitleRef.current) {
          document.title = previousTitleRef.current;
          // Use requestAnimationFrame to ensure our change persists
          requestAnimationFrame(() => {
            if (isActive && isUrlPath(document.title, pathname) && previousTitleRef.current) {
              document.title = previousTitleRef.current;
            }
          });
        }
      } else if (title && title.trim().length > 0) {
        // Title is valid - update our stored title
        if (title !== previousTitleRef.current) {
          previousTitleRef.current = title;
        }
      }
    };

    // Immediate checks with multiple timing strategies to catch fast changes
    checkAndRestore();
    const timeout1 = setTimeout(checkAndRestore, 0);
    const timeout2 = setTimeout(checkAndRestore, 10);
    const timeout3 = setTimeout(checkAndRestore, 50);
    const timeout4 = setTimeout(checkAndRestore, 100);

    // Set up a MutationObserver to watch for title changes
    const observer = new MutationObserver(() => {
      checkAndRestore();
    });

    // Observe changes to the title element and head
    const titleElement = document.querySelector("title");
    const headElement = document.head;

    if (titleElement) {
      observer.observe(titleElement, {
        childList: true,
        subtree: true,
        characterData: true,
      });
    }

    if (headElement) {
      observer.observe(headElement, {
        childList: true,
        subtree: true,
      });
    }

    // Also use interval as a fallback (runs for 2 seconds after navigation)
    let checkCount = 0;
    const maxChecks = 40; // 2 seconds (40 * 50ms)
    const checkInterval = setInterval(() => {
      if (!isActive) {
        clearInterval(checkInterval);
        return;
      }
      checkAndRestore();
      checkCount++;
      if (checkCount >= maxChecks) {
        clearInterval(checkInterval);
      }
    }, 50);

    // Cleanup
    return () => {
      isActive = false;
      observer.disconnect();
      clearInterval(checkInterval);
      clearTimeout(timeout1);
      clearTimeout(timeout2);
      clearTimeout(timeout3);
      clearTimeout(timeout4);
    };
  }, [pathname]);
};
