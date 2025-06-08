import { useLayout } from "@/layout/layout-context";
import { Box } from "@mantine/core";
import { useOs } from "@mantine/hooks";
import { FC, PropsWithChildren } from "react";

export const SafeNavigation: FC<PropsWithChildren> = (props) => {
  const viewport = useLayout();
  const os = useOs();

  return (
    <Box
      className="Navigation"
      p={8}
      bg="var(--mantine-color-body)"
      style={{
        boxShadow: "0px -1px 5px rgba(0, 0, 0, 0.1)",
        borderTopLeftRadius: 5,
        borderTopRightRadius: 5,
        position: "fixed",
        width: "100%",
        bottom: 0,
        left: 0,
        zIndex: 10,
      }}
      pb={viewport.isIpad || viewport.isStandalone || os === "ios" ? 15 : 8}
    >
      {props.children}
    </Box>
  );
};
