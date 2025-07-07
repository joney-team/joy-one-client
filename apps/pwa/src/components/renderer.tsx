"use client";

import { ViewportType } from "@/types";
import { useLayout } from "@/layout/layout-context";
import { FC, PropsWithChildren } from "react";

interface RendererProps {
  visible?: boolean;
  views?: ViewportType[];
}

export const Renderer: FC<PropsWithChildren<RendererProps>> = (props) => {
  const viewport = useLayout();

  const disabled =
    typeof props.children === "undefined" ||
    (typeof props.visible === "undefined" && typeof props.views === "undefined") ||
    (typeof props.visible === "boolean" && !!!props.visible) ||
    (Array.isArray(props.views) && !props.views.includes(viewport.view));

  if (disabled) return null;
  return props.children;
};
