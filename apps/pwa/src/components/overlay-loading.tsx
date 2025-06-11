import { FC } from "react";
import { Animate } from "./animate/animate";

interface OverlayLoadingProps {
  enabled?: boolean;
}

const OverlayLoading: FC<OverlayLoadingProps> = (props) => {
  const loading = props.enabled;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100dvw",
        height: "100dvh",
        zIndex: loading ? 9999 : -10,
        opacity: loading ? 1 : 0,
        visibility: loading ? "visible" : "hidden",
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
        <Animate src="/animate/symbol.json" style={{ width: 80 }} />
      </div>
    </div>
  );
};

export default OverlayLoading;
