import { getGlobal } from "@/global";
import { ViewportType } from "@/types";

export const getViewType = (width: number): ViewportType => {
  if (width < 1024) return "mobile";
  if (width <= 1190) return "tablet";
  return "desktop";
};

export let getView: () => ViewportType = () => {
  return getGlobal()._view || "mobile";
};

export const getViewSize = () => {
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