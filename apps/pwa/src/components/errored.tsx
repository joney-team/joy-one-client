import { t } from "@/modules/lang/lang-service";
import { Box, Group, Text, ThemeIcon } from "@mantine/core";
import { IconInfoCircle } from "@tabler/icons-react";
import { FC } from "react";

export interface ErroredProps {
  error?: string;
  p?: number;
  visible?: boolean;
  centered?: boolean;
  hideIcon?: boolean;
}

export const Errored: FC<ErroredProps> = (props) => {
  if (typeof props.visible === "boolean" && !props.visible) return null;

  const centered = typeof props.centered === "boolean" ? props.centered : true;
  const padding = typeof props.p === "number" ? props.p : 10;

  return (
    <Box p={padding}>
      <Group
        justify={centered ? "center" : "flex-start"}
        align="center"
        gap={0}
        p={16}
        bg="var(--mantine-color-dark-light)"
        style={{ borderRadius: 5 }}
      >
        {!props.hideIcon && (
          <ThemeIcon variant="transparent" color="gray.6">
            <IconInfoCircle strokeWidth={1.5} size={18} />
          </ThemeIcon>
        )}

        <Text ta={props.centered ? "center" : "left"} fz="xs" c="gray.6">
          {props.error || t("error_unknown")}
        </Text>
      </Group>
    </Box>
  );
};
