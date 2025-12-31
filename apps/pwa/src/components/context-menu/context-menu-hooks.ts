import { useEffect, useState } from "react";

export const useContextMenuItem = (id: string) => {
  const [isOpened, setIsOpened] = useState(false);

  useEffect(() => {
    const menu = document.getElementById(id);
    if (menu) {
      setIsOpened(menu.getAttribute("data-context-menu-opened") === "true");
    }

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          mutation.type === "attributes" &&
          mutation.attributeName === "data-context-menu-opened"
        ) {
          setIsOpened(
            mutation.target instanceof HTMLElement
              ? mutation.target.getAttribute("data-context-menu-opened") === "true"
              : false
          );
        }
      });
    });

    observer.observe(menu ?? document.body, {
      attributes: true,
      attributeFilter: ["data-context-menu-opened"],
    });

    return () => {
      observer.disconnect();
    };
  }, [id]);

  return { isOpened };
};
