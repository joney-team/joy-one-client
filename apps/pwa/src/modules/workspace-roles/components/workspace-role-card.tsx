"use client";

import { OnModalRoleForm } from "@/modules/workspace-roles/modals/modal-workspace-role-form";
import {
  WorkspacePermission,
  WorkspaceSpecialRoleId,
} from "@/modules/workspace-roles/workspace-roles-types";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { t } from "@lingui/core/macro";
import { ActionIcon, Card, em, Group, Stack, Text, ThemeIcon } from "@mantine/core";
import { IconAccessible, IconPencil } from "@tabler/icons-react";
import { FC, Fragment } from "react";
import { workspaceSpecialRoleIds } from "../workspace-roles-constants";

interface WorkspaceRoleCardProps {
  id: any;
}

export const WorkspaceRoleCard: FC<WorkspaceRoleCardProps> = (props) => {
  const workspace = useWorkspace();
  const isAbleToEdit = ![WorkspaceSpecialRoleId.OWNER, WorkspaceSpecialRoleId.ADMIN].includes(
    props.id
  );

  const role = workspace.roles.find((role) => role._id === props.id);
  const roleName =
    role?.name || workspaceSpecialRoleIds[props.id as WorkspaceSpecialRoleId]?.name();
  const permissions =
    (props.id === WorkspaceSpecialRoleId.MEMBER
      ? workspace.settings.memberPermissions
      : role?.permissions) || [];
  const permissionCounts = Object.values(WorkspacePermission).filter((key) =>
    permissions.includes(key)
  ).length;

  return (
    <Card
      key={props.id}
      withBorder
      shadow="none"
      p={10}
      style={isAbleToEdit ? { cursor: "pointer" } : {}}
      onClick={isAbleToEdit ? () => OnModalRoleForm({ roleId: props.id }) : undefined}
    >
      <Group justify="space-between" align="start" wrap="nowrap">
        <Stack gap={5}>
          <Group gap={3}>
            <ThemeIcon variant="transparent" color="dark" size="xs">
              <IconAccessible size={18} />
            </ThemeIcon>
            <Text fz={em(15)} fw={500}>
              {roleName}
            </Text>
          </Group>

          {(function () {
            if (props.id === WorkspaceSpecialRoleId.OWNER) {
              return (
                <Fragment>
                  <Text fz={em(12)} c="gray">
                    • {t`Has access to all functions of the system`}
                  </Text>
                  <Text fz={em(12)} c="gray">
                    •{" "}
                    {t`Cannot be deleted, cannot be assigned to other members, can only be transferred`}
                  </Text>
                </Fragment>
              );
            }

            if (props.id === WorkspaceSpecialRoleId.ADMIN) {
              return (
                <Fragment>
                  <Text fz={em(12)} c="gray">
                    • {t`Has access to all functions of the system`}
                  </Text>
                  <Text fz={em(12)} c="gray">
                    • {t`Cannot be deleted, can be assigned to other members`}
                  </Text>
                </Fragment>
              );
            }

            if (props.id === WorkspaceSpecialRoleId.MEMBER) {
              return (
                <Fragment>
                  <Text fz={em(12)} c="gray">
                    • {t`Default role when not specified`}
                  </Text>

                  <Text fz={em(12)} c="gray">
                    • {t`Grant permissions`} {permissionCounts}/
                    {Object.keys(WorkspacePermission).length}
                  </Text>
                </Fragment>
              );
            }

            if (role) {
              return (
                <Fragment>
                  {role.description && (
                    <Text fz={em(12)} c="gray">
                      • {role.description}
                    </Text>
                  )}

                  <Text fz={em(12)} c="gray">
                    • {t`Grant permissions`} {permissionCounts}/
                    {Object.keys(WorkspacePermission).length}
                  </Text>
                </Fragment>
              );
            }
          })()}
        </Stack>

        <Stack>
          {isAbleToEdit && (
            <ActionIcon variant="transparent" size="xs" color="gray">
              <IconPencil size={18} />
            </ActionIcon>
          )}
        </Stack>
      </Group>
    </Card>
  );
};
