import { t } from "@/modules/lang/lang-service";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { getWorkspaceModuleName, WorkspaceModuleId } from "@/modules/workspaces/workspace-modules";
import { WorkspaceType } from "@/modules/workspaces/workspaces-types";
import { ActionIcon, Card, Group, MantineColor, Stack, Text, ThemeIcon } from "@mantine/core";
import { useHover } from "@mantine/hooks";
import { IconArrowRight } from "@tabler/icons-react";
import Link from "next/link";
import { FC } from "react";
import { Image } from "../../../components/image";

export interface WorkspaceSettingCardProps {
  name?: string;
  description?: string;
  image?: string;
  color?: MantineColor;
  workspaceTypes?: WorkspaceType[];
  moduleId: WorkspaceModuleId;
}

export const WorkspaceSettingCard: FC<WorkspaceSettingCardProps> = (props) => {
  const hover = useHover();
  const workspace = useWorkspace();
  const workspaceModule = workspace.getModule(props.moduleId);

  if (!workspaceModule) {
    throw new Error(`Workspace module ${props.moduleId} not found`);
  }

  const name =
    props.name || getWorkspaceModuleName(props.moduleId, workspace.userMember?.workspace);

  return (
    <Link href={workspaceModule.href} style={{ textDecoration: "none" }} ref={hover.ref}>
      <Card withBorder shadow="none" pb={10}>
        <Group wrap="nowrap" align="start">
          {props.image ? (
            <Image src={props.image} alt={name} w={45} h={45} />
          ) : (
            <ThemeIcon size="xl" variant={hover.hovered ? "filled" : "light"} color={props.color}>
              <workspaceModule.icon
                strokeWidth={1.5}
                size={hover.hovered ? 28 : 25}
                style={{
                  transition: "width 0.2s ease-in-out",
                }}
              />
            </ThemeIcon>
          )}

          <Stack gap={5} flex={1}>
            <Text fw={600}>{t(name)}</Text>

            {props.description && (
              <Text mih={65} fz={14}>
                {t(props.description)}
              </Text>
            )}

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
