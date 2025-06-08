import { t } from "@/modules/lang/lang-service";
import { WorkspaceType } from "@/modules/workspaces/workspaces-types";
import { ActionIcon, Card, Group, MantineColor, Stack, Text, ThemeIcon } from "@mantine/core";
import { useHover } from "@mantine/hooks";
import { Icon, IconArrowRight } from "@tabler/icons-react";
import Link from "next/link";
import { FC } from "react";
import { Image } from "../../../components/image";

export interface WorkspaceSettingCardProps {
  name: string;
  description: string;
  icon?: Icon;
  image?: string;
  href: string;
  color?: MantineColor;
  workspaceTypes?: WorkspaceType[];
}

export const WorkspaceSettingCard: FC<WorkspaceSettingCardProps> = (props) => {
  const hover = useHover();

  return (
    <Link href={props.href} style={{ textDecoration: "none" }} ref={hover.ref}>
      <Card withBorder shadow="none" pb={10}>
        <Group wrap="nowrap" align="start">
          {props.icon && (
            <ThemeIcon size="xl" variant={hover.hovered ? "filled" : "light"} color={props.color}>
              <props.icon
                strokeWidth={1.5}
                size={hover.hovered ? 28 : 25}
                style={{
                  transition: "width 0.2s ease-in-out",
                }}
              />
            </ThemeIcon>
          )}

          {props.image && <Image src={props.image} alt={props.name} w={45} h={45} />}

          <Stack gap={5} flex={1}>
            <Text fw={600}>{t(props.name)}</Text>
            <Text mih={65} fz={14}>
              {t(props.description)}
            </Text>

            <Group justify="end">
              <ActionIcon variant="subtle" color="gray">
                <IconArrowRight size={16} />
              </ActionIcon>
            </Group>
          </Stack>
        </Group>
      </Card>
    </Link>
  );
};
