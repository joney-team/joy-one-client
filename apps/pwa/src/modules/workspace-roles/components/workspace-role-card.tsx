"use client";

import { OnModalRoleForm } from "@/modules/workspace-roles/modals/modal-workspace-role-form";
import { tl } from "@/modules/lang/lang-service";
import {
  WorkspacePermission,
  WorkspaceSpecialRoleId,
} from "@/modules/workspace-roles/workspace-roles-types";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { ActionIcon, Card, em, Group, Stack, Text, ThemeIcon } from "@mantine/core";
import { IconAccessible, IconPencil } from "@tabler/icons-react";
import { FC, Fragment } from "react";

interface WorkspaceRoleCardProps {
  id: any;
}

export const WorkspaceRoleCard: FC<WorkspaceRoleCardProps> = (props) => {
  const workspace = useWorkspace();
  const isAbleToEdit = ![WorkspaceSpecialRoleId.OWNER, WorkspaceSpecialRoleId.ADMIN].includes(
    props.id
  );

  const role = workspace.roles.find((role) => role._id === props.id);
  const roleName = tl(role?.name || `role_${props.id}`);
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
                    • {tl("role_access_all")}
                  </Text>
                  <Text fz={em(12)} c="gray">
                    • {tl("role_owner_desc")}
                  </Text>
                </Fragment>
              );
            }

            if (props.id === WorkspaceSpecialRoleId.ADMIN) {
              return (
                <Fragment>
                  <Text fz={em(12)} c="gray">
                    • {tl("role_access_all")}
                  </Text>
                  <Text fz={em(12)} c="gray">
                    • {tl("role_admin_desc")}
                  </Text>
                </Fragment>
              );
            }

            if (props.id === WorkspaceSpecialRoleId.MEMBER) {
              return (
                <Fragment>
                  <Text fz={em(12)} c="gray">
                    • {tl("role_default")}
                  </Text>

                  <Text fz={em(12)} c="gray">
                    • {tl("grant_permissions")} {permissionCounts}/
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
                    • {tl("grant_permissions")} {permissionCounts}/
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
