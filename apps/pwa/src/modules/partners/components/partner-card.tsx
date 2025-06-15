import { PartnerEntity } from "@/modules/partners/partners-types";
import { ActionIcon, Anchor, Card, Group, Stack, Text, useMantineTheme } from "@mantine/core";
import { IconX } from "@tabler/icons-react";
import Link from "next/link";
import { FC } from "react";
import { Avatar } from "@/components/avatar";

type OnRemove = (partner: PartnerEntity) => void;

export const PartnerCard: FC<{
  partner: PartnerEntity;
  collapsed?: boolean;
  onRemove?: OnRemove | undefined;
}> = (props) => {
  const { partner } = props;
  const theme = useMantineTheme();

  return (
    <Anchor component={Link} href={`/partners?id=${partner._id}`} onClick={(e) => e.stopPropagation()} td="none">
      <Card
        key={partner._id}
        p={2}
        style={{
          borderColor: theme.colors.gray[4],
          boxShadow: "none",
          position: "relative",
          overflow: "visible",
        }}
        withBorder
        radius={150}
      >
        <Group gap={5}>
          <Avatar partner={partner} size={28} radius="xl" />

          {!props.collapsed && (
            <Stack gap={2} pr={12}>
              <Text fz={10} fw={600}>
                {partner.name}
              </Text>
              <Text fz={8} fw={500} mt={-2}>
                {partner.phone}
              </Text>
            </Stack>
          )}
        </Group>

        {typeof props.onRemove === "function" && (
          <ActionIcon
            color="dark.1"
            radius={100}
            size={16}
            style={{
              position: "absolute",
              right: -4,
              top: -4,
              border: `2px solid white`,
            }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (typeof props.onRemove === "function") return props.onRemove(partner);
            }}
          >
            <IconX size={7} strokeWidth={3} />
          </ActionIcon>
        )}
      </Card>
    </Anchor>
  );
};
