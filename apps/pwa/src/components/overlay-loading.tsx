"use client";

import { useApp } from "@/app.context";
import { Loader } from "@mantine/core";
import { type FC } from "react";
import { Animate } from "./animate/animate";
import { zIndexes } from "@joy-one-client/config/layout";

interface OverlayLoadingProps {
  enabled?: boolean;
}

const OverlayLoading: FC<OverlayLoadingProps> = ({ enabled = true }) => {
  const app = useApp();

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100dvw",
        height: "100dvh",
        zIndex: enabled ? zIndexes.screenOverlay : -10,
        opacity: enabled ? 1 : 0,
        visibility: enabled ? "visible" : "hidden",
        background: "var(--mantine-color-body)",
      }}
    >
      <div
        style={{
          height: "100%",
          gap: 0,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: 30,
        }}
      >
        {app.metadata.isExtended ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              gap: 10,
            }}
          >
            <img
              src={app.metadata.appIcon ?? ""}
              style={{
                width: 100,
                height: 100,
                borderRadius: 10,
                objectFit: "contain",
                overflow: "hidden",
              }}
            />

            <Loader size="sm" type="dots" />
          </div>
        ) : (
          <Animate src="/animate/symbol.json" style={{ width: 80 }} />
        )}
      </div>
    </div>
  );
};

export default OverlayLoading;
