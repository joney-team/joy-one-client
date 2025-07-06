"use client";

import { Button } from "@/components/buttons/button";
import { Renderer } from "@/components/renderer";
import { WorkspaceMemberList } from "@/modules/workspace-members/workspace-member-list";
import { OnModalTransferOwner } from "@/modules/workspaces/modals/modal-transfer-workspace-owner";
import { OnModalWorkspaceInviteMember } from "@/modules/workspace-members/workspace-invite-member";
import { t } from "@/modules/lang/lang-service";
import {
  WorkspacePermission,
  WorkspaceSpecialRoleId,
} from "@/modules/workspace-roles/workspace-roles-types";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { Group, Stack } from "@mantine/core";
import { IconTransfer, IconUsersPlus } from "@tabler/icons-react";
import { NextPage } from "next";
import { useRouter } from "@/hooks/use-router";

const Page: NextPage = () => {
  const workspace = useWorkspace();
  const router = useRouter();
  const modSettingRoles = workspace.getModule("workspaceSettingsRoles");

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
            {t("invite_members")}
          </Button>
        </Renderer>

        <Renderer
          visible={
            modSettingRoles && workspace.hasPermission(WorkspacePermission.WORKSPACE_ROLES_MANAGER)
          }
        >
          <Button
            leftIcon={modSettingRoles.icon}
            onClick={() => router.push(modSettingRoles.href)}
            variant="outline"
            size="xs"
            radius={100}
          >
            {modSettingRoles.name}
          </Button>
        </Renderer>

        <Renderer
          visible={workspace.userMember.roles.some((v) => v._id === WorkspaceSpecialRoleId.OWNER)}
        >
          <Button
            leftIcon={IconTransfer}
            onClick={() => OnModalTransferOwner()}
            variant="outline"
            color="gray"
            size="xs"
            radius={100}
          >
            {t("transfer_ownership")}
          </Button>
        </Renderer>
      </Group>

      <WorkspaceMemberList />
    </Stack>
  );
};

export default Page;
