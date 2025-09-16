export function scrollToElementById(
  id: string,
  options?: {
    block?: ScrollLogicalPosition;
    timeoutMs?: number;
    behavior?: ScrollBehavior;
  }
): Promise<void> {
  const { block = "start", timeoutMs = 5000, behavior = "smooth" } = options || {};

  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior, block });
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    const observer = new MutationObserver(() => {
      const found = document.getElementById(id);
      if (found) {
        observer.disconnect();
        setTimeout(() => found.scrollIntoView({ behavior, block }), 100);
        resolve();
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    setTimeout(() => {
      observer.disconnect();
      resolve();
    }, timeoutMs);
  });
}
