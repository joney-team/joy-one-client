"use client";

import { OnModalRoleForm } from "@/modules/workspace-roles/modals/modal-workspace-role-form";
import {
  WorkspaceDefaultRoleId,
  WorkspacePermission,
} from "@/modules/workspace-roles/workspace-roles-types";
import { stringable } from "@joy-one-client/utils/string";
import { Trans } from "@lingui/react/macro";
import { ActionIcon, Card, em, Group, Stack, Text, ThemeIcon } from "@mantine/core";
import { IconAccessible, IconPencil } from "@tabler/icons-react";
import { FC, Fragment, useMemo } from "react";
import { WorkspaceRoleDataFragment } from "../graphql/fragmentWorkspaceRole.graphql";

interface WorkspaceRoleCardProps {
  role: WorkspaceRoleDataFragment;
}

export const WorkspaceRoleCard: FC<WorkspaceRoleCardProps> = ({ role }) => {
  const isAbleToEdit = ![WorkspaceDefaultRoleId.OWNER, WorkspaceDefaultRoleId.ADMIN]
    .map(stringable)
    .includes(role._id);

  const permissions = role?.permissions ?? [];
  const permissionCounts = Object.values(WorkspacePermission).filter((key) =>
    permissions.includes(key)
  ).length;

  const description = useMemo(() => {
    if (role._id === WorkspaceDefaultRoleId.OWNER) {
      return (
        <Fragment>
          <Text fz={em(12)} c="gray">
            • <Trans>Has access to all functions of the system</Trans>
          </Text>
          <Text fz={em(12)} c="gray">
            •{" "}
            <Trans>
              Cannot be deleted, cannot be assigned to other members, can only be transferred
            </Trans>
          </Text>
        </Fragment>
      );
    }

    if (role._id === WorkspaceDefaultRoleId.ADMIN) {
      return (
        <Fragment>
          <Text fz={em(12)} c="gray">
            • <Trans>Has access to all functions of the system</Trans>
          </Text>
          <Text fz={em(12)} c="gray">
            • <Trans>Cannot be deleted, can be assigned to other members</Trans>
          </Text>
        </Fragment>
      );
    }

    if (role._id === WorkspaceDefaultRoleId.MEMBER) {
      return (
        <Fragment>
          <Text fz={em(12)} c="gray">
            • <Trans>Default role when not specified</Trans>
          </Text>

          <Text fz={em(12)} c="gray">
            • <Trans>Grant permissions</Trans> {permissionCounts}/
            {Object.keys(WorkspacePermission).length}
          </Text>
        </Fragment>
      );
    }

    return (
      <Fragment>
        {role.description && (
          <Text fz={em(12)} c="gray">
            • {role.description}
          </Text>
        )}

        <Text fz={em(12)} c="gray">
          • <Trans>Grant permissions</Trans> {permissionCounts}/
          {Object.keys(WorkspacePermission).length}
        </Text>
      </Fragment>
    );
  }, [role]);

  return (
    <Card
      withBorder
      shadow="none"
      p={10}
      style={isAbleToEdit ? { cursor: "pointer" } : {}}
      onClick={isAbleToEdit ? () => OnModalRoleForm({ roleId: role._id }) : undefined}
    >
      <Group justify="space-between" align="start" wrap="nowrap">
        <Stack gap={5}>
          <Group gap={3}>
            <ThemeIcon variant="transparent" color="dark" size="xs">
              <IconAccessible size={18} />
            </ThemeIcon>
            <Text fz="sm" fw={500}>
              {role.name}
            </Text>
          </Group>

          {description}
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
