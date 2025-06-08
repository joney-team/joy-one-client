import { useColor } from "@/modules/theme/use-color";
import { ActionIcon, Card, Group, Text } from "@mantine/core";
import { useHover } from "@mantine/hooks";
import { Icon } from "@tabler/icons-react";
import { FC } from "react";

interface OrderTableCtaCardProps {
  label: string;
  icon: Icon;
  onClick: () => void;
  isActive: boolean;
}

export const OrderTableCtaCard: FC<OrderTableCtaCardProps> = (props) => {
  const color = useColor();
  const hover = useHover();

  return (
    <Card
      className="unselectable"
      withBorder
      p={5}
      onClick={props.onClick}
      style={{ cursor: "pointer" }}
      radius={100}
      ref={hover.ref}
    >
      <Group gap={8} pr={10}>
        <ActionIcon
          variant={props.isActive ? "filled" : "light"}
          color={color(props.isActive || hover.hovered ? "primary" : "gray")}
          radius={100}
        >
          <props.icon size={16} strokeWidth={1.5} />
        </ActionIcon>

        <Text fz={14} fw={500}>
          {props.label}
        </Text>
      </Group>
    </Card>
  );
};
