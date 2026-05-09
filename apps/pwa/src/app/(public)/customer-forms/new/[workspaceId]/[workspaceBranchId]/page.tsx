"use client";

import { renderPage } from "@/layout/layout-page";
import { useColor } from "@/modules/theme/use-color";
import { backgroundColors } from "@joy-one/config/colors";
import { Stack } from "@mantine/core";

const Content = renderPage(() =>
  import("@/modules/customer-forms/customer-form-register").then((mod) => mod.CustomerFormRegister)
);
export default () => {
  const color = useColor();

  return (
    <Stack mih="100dvh" bg={color({ light: backgroundColors.light, dark: backgroundColors.dark })}>
      <Content />
    </Stack>
  );
};
