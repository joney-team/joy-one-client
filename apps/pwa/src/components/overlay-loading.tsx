import { useApp } from "@/app.context";
import { FC } from "react";
import { AppLoader } from "./app-loader";

interface OverlayLoadingProps {
  enabled?: boolean;
}

const OverlayLoading: FC<OverlayLoadingProps> = (props) => {
  const app = useApp();
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
        <AppLoader color={app.metadata.appColor} />
      </div>
    </div>
  );
};

export default OverlayLoading;
