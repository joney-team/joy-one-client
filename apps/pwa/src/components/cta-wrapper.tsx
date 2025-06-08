import { useLayout } from "@/layout/layout-context";
import { Stack } from "@mantine/core";
import { FC, PropsWithChildren } from "react";

export const CtasWrapper: FC<PropsWithChildren> = (props) => {
  const viewport = useLayout();
  const layout = useLayout();

  return (
    <Stack
      align="end"
      style={{
        position: "fixed",
        bottom: viewport.view === "desktop" ? 20 : 90,
        right: 0,
      }}
      px={16}
      gap={20}
    >
      {props.children}
    </Stack>
  );
};
