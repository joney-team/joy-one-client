import { useColor } from "@/modules/theme/use-color";
import { useLayout } from "@/layout/layout-context";
import { Stack, Text, em } from "@mantine/core";
import { Icon } from "@tabler/icons-react";
import { FC } from "react";

export const WorkspaceTypeItem: FC<{
  icon: Icon;
  label: string;
  isActive?: boolean;
  onClick?: () => void;
}> = (props) => {
  const layout = useLayout();
  const color = useColor();

  return (
    <Stack
      onClick={props.onClick}
      align="center"
      justify="center"
      gap={3}
      style={{
        borderRadius: 15,
        width: 100,
        height: 60,
        border: `1px solid ${props.isActive ? color("primary") : color("gray.5")}`,
        backgroundColor: props.isActive ? color("primary") : "transparent",
        fontSize: layout.view === "mobile" ? 14 : 15,
        cursor: "pointer",
      }}
    >
      <props.icon size={em(28)} strokeWidth={1.5} color={props.isActive ? "white" : color("gray")} />
      <Text c={props.isActive ? "white" : "gray"} fz={em(12)} fw={500}>
        {props.label}
      </Text>
    </Stack>
  );
};
