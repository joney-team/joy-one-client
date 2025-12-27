"use client";

import { Button } from "@/components/buttons/button";
import { Renderer } from "@/components/renderer";
import { useRouter } from "@/hooks/use-router";
import { OnModalWorkspaceInviteMember } from "@/modules/workspace-members/workspace-invite-member";
import { WorkspaceMemberList } from "@/modules/workspace-members/workspace-member-list";
import {
  WorkspacePermission,
  WorkspaceDefaultRoleId,
} from "@/modules/workspace-roles/workspace-roles-types";
import { OnModalTransferOwner } from "@/modules/workspaces/modals/modal-transfer-workspace-owner";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { useAvailableWorkspaceModules } from "@/modules/workspaces/workspace-modules";
import { Trans } from "@lingui/react/macro";
import { Group, Stack } from "@mantine/core";
import { IconTransfer, IconUsersPlus } from "@tabler/icons-react";
import { NextPage } from "next";

const Page: NextPage = () => {
  const workspace = useWorkspace();
  const router = useRouter();

  const { getAvailableModule } = useAvailableWorkspaceModules();
  const modSettingRoles = getAvailableModule("workspaceSettingsRoles");

  return (
    <Stack gap={0}>
      <Group px={16} pt={16} gap={10}>
        <Renderer visible={workspace.hasPermission(WorkspacePermission.WORKSPACE_MEMBERS_MANAGER)}>
          <Button
            leftIcon={IconUsersPlus}
            onClick={() => OnModalWorkspaceInviteMember()}
            variant="outline"
            size="xs"
            radius={100}
          >
            <Trans>Invite members</Trans>
          </Button>
        </Renderer>

        {modSettingRoles &&
          workspace.hasPermission(WorkspacePermission.WORKSPACE_ROLES_MANAGER) && (
            <Button
              leftIcon={modSettingRoles.icon}
              onClick={() => router.push(modSettingRoles.href)}
              variant="outline"
              size="xs"
              radius={100}
            >
              {modSettingRoles.name}
            </Button>
          )}

        {workspace.userMember.roles.some((v) => v._id === WorkspaceDefaultRoleId.OWNER) && (
          <Button
            leftIcon={IconTransfer}
            onClick={() => OnModalTransferOwner()}
            variant="outline"
            color="gray"
            size="xs"
            radius={100}
          >
            <Trans>Transfer ownership</Trans>
          </Button>
        )}
      </Group>

      <WorkspaceMemberList />
    </Stack>
  );
};

export default Page;
