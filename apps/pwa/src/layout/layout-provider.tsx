"use client";

import { getGlobal } from "@/global";
import { useDebouncedCallback, useForceUpdate } from "@mantine/hooks";
import { usePathname } from "next/navigation";
import { FC, PropsWithChildren, useEffect, useRef, useState } from "react";
import { Context, LayoutComponents, LayoutContext, LayoutState } from "./layout-context";
import { getViewSize, getViewType } from "./layout-service";

const LayoutProvider: FC<PropsWithChildren> = (props) => {
  const pathname = usePathname();
  const forceUpdate = useForceUpdate();

  const [components, setComponents] = useState<LayoutComponents>({});
  const [isResizing, setIsResizing] = useState(false);
  const state = useRef<LayoutState>({
    width: 0,
    height: 0,
    isInitialized: false,
    isStandalone: false,
    isIpad: false,
    isAndroid: false,
    view: getViewType(0),
    isBrowerCollapsed: false,
  });

  const setState = (update: Partial<LayoutState>) => {
    const _state = { ...state.current, ...update };
    const isDiff = JSON.stringify(_state) !== JSON.stringify(state.current);
    state.current = _state;
    if (isDiff) forceUpdate();
  };

  const initialize = () => {
    const result = getViewSize();
    document.documentElement.setAttribute("data-view", result.view);
    setState({ isInitialized: true, ...result });
  };

  useEffect(() => {
    setComponents((s) => {
      if (s && s.pathname === pathname) return s;
      return {};
    });
  }, [pathname]);

  const onResized = useDebouncedCallback(() => {
    const result = getViewSize();
    document.documentElement.setAttribute("data-view", result.view);
    setState({ ...result });
    setIsResizing(false);
  }, 300);

  useEffect(() => {
    initialize();

    window.addEventListener("resize", onResized);

    return () => {
      window.removeEventListener("resize", onResized);
    };
  }, []);

  useEffect(() => {
    if (state.current.view === "mobile") {
      const windowHeight = window.innerHeight;
      const isStandalone = window.matchMedia("(display-mode: standalone)").matches;

      const onScroll = () => {
        if (isStandalone) return;
        const documentHeight = document.documentElement.clientHeight;
        const isCollapsed = windowHeight !== documentHeight;
        setState({ isBrowerCollapsed: isCollapsed });
      };

      window.addEventListener("scroll", onScroll);

      return () => {
        window.removeEventListener("scroll", onScroll);
      };
    }
  }, [state.current.view]);

  const context: LayoutContext = {
    ...state.current,
    isResizing,
    components,
    setComponents: (args, delay = 100) => {
      setTimeout(() => {
        setComponents((s) => ({ ...s, ...args }));
      }, delay);
    },
    resetComponents: () => setComponents({}),
  };
  getGlobal()._view = context.view;

  return <Context.Provider value={context}>{props.children}</Context.Provider>;
};

export default LayoutProvider;
