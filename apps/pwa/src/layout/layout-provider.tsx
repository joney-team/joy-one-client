import { ViewportType } from "@/types";
import { tryParseJson } from "@/utils/object.utils";
import { rgba } from "@mantine/core";
import { useDebouncedCallback } from "@mantine/hooks";
import { usePathname } from "next/navigation";
import { FC, PropsWithChildren, useEffect, useState } from "react";
import { Context, LayoutComponents, LayoutConfig, LayoutContext } from "./layout-context";

const getViewType = (width: number): ViewportType => {
  if (width < 1024) return "mobile";
  if (width <= 1190) return "tablet";
  return "desktop";
};

export let getView: () => ViewportType = () => "mobile";

const getSize = () => {
  let width = window.innerWidth;
  let height = window.innerHeight;

  return {
    width,
    height,
    isStandalone: window.matchMedia("(display-mode: standalone)").matches,
    isIpad: /iPad|Macintosh/.test(navigator.userAgent),
    isAndroid: /Android/.test(navigator.userAgent),
    view: getViewType(width),
  };
};

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

  const initialize = () => {
    setConfig(tryParseJson(localStorage.getItem("layout-config")));
    setState({ isInitialized: true, ...getSize() });
  };

  const onResized = useDebouncedCallback(() => {
    setState((s) => ({ ...s, ...getSize() }));
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

  const navPaddingBottom = !state.isAndroid && (state.isStandalone || isBrowerCollapsed) ? 20 : 0;
  const borderColor = rgba("var(--mantine-color-text)", 0.08);
  const sidebarWidth = state.view === "mobile" ? 0 : config.isNavbarCollapsed ? 62 : 200;
  const headHeight = state.view === "mobile" ? 50 : 48;
  const navigationHeight = state.view === "mobile" ? 55 : 0;

  const bodySize = {
    height: state.height - headHeight - navigationHeight,
    width: state.width - sidebarWidth,
  };

  const context: LayoutContext = {
    ...state,
    bodySize,
    isBrowerCollapsed,
    config,
    setConfig,
    sidebarWidth,
    headHeight,
    navigationHeight,
    border: `1px solid ${borderColor}`,
    borderColor,
    spacing: 16,
    navPaddingBottom,
    isResizing,
    components,
    setComponents: (args, delay = 100) => {
      setTimeout(() => {
        setComponents((s) => ({ ...s, ...args }));
      }, delay);
    },
    resetComponents: () => setComponents({}),
  };

  getView = () => context.view;

  return <Context.Provider value={context}>{props.children}</Context.Provider>;
};

export default LayoutProvider;
