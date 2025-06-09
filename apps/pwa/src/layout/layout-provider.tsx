"use client";

import { getGlobal } from "@/global";
import { tryParseJson } from "@/utils/object.utils";
import { useDebouncedCallback } from "@mantine/hooks";
import { usePathname } from "next/navigation";
import { FC, PropsWithChildren, useEffect, useState } from "react";
import { Context, LayoutComponents, LayoutConfig, LayoutContext } from "./layout-context";
import { getViewSize, getViewType } from "./layout-service";

const LayoutProvider: FC<PropsWithChildren> = (props) => {
  const pathname = usePathname();

  const [isBrowerCollapsed, setIsBrowserCollapsed] = useState(false);
  const [config, setConfig] = useState<LayoutConfig>({});
  const [isResizing, setIsResizing] = useState(false);
  const [components, setComponents] = useState<LayoutComponents>({});

  const [state, setState] = useState({
    width: 0,
    height: 0,
    isInitialized: false,
    isStandalone: false,
    isIpad: false,
    isAndroid: false,
    view: getViewType(0),
  });

  getGlobal()._view = state.view;

  const initialize = () => {
    setConfig(tryParseJson(localStorage.getItem("layout-config")));
    setState({ isInitialized: true, ...getViewSize() });
  };

  const onResized = useDebouncedCallback(() => {
    setState((s) => ({ ...s, ...getViewSize() }));
    setIsResizing(false);
  }, 300);

  const onCollapsed = useDebouncedCallback(() => {
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.clientHeight;
    setIsBrowserCollapsed(windowHeight !== documentHeight);
  }, 100);

  useEffect(() => {
    initialize();

    const onResize = () => {
      setIsResizing(true);
      onCollapsed();
      onResized();
    };

    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
    };
  }, []);

  useEffect(() => {
    setComponents((s) => {
      if (s && s.pathname === pathname) return s;
      return {};
    });
  }, [pathname]);

  useEffect(() => {
    if (state.isInitialized) {
      localStorage.setItem("layout-config", JSON.stringify(config));
    }
  }, [state.isInitialized, config]);

  const context: LayoutContext = {
    ...state,
    isBrowerCollapsed,
    config,
    setConfig,
    isResizing,
    components,
    setComponents: (args, delay = 100) => {
      setTimeout(() => {
        setComponents((s) => ({ ...s, ...args }));
      }, delay);
    },
    resetComponents: () => setComponents({}),
  };

  return <Context.Provider value={context}>{props.children}</Context.Provider>;
};

export default LayoutProvider;
