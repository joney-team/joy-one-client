"use client";

import { Button } from "@/components/buttons/button";
import { Container } from "@/components/container";
import { WorkspaceRoleCard } from "@/modules/workspace-roles/components/workspace-role-card";
import { OnModalRoleForm } from "@/modules/workspace-roles/modals/modal-workspace-role-form";
import { WorkspaceSpecialRoleId } from "@/modules/workspace-roles/workspace-roles-types";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { Trans } from "@lingui/react/macro";
import { Group, Stack } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { type FC } from "react";

export const WorkspaceRoleList: FC = () => {
  const workspace = useWorkspace();

  return (
    <Container size="sm" p={16}>
      <Stack className="MemberRoles">
        <Group justify="start">
          <Button
            leftIcon={IconPlus}
            onClick={() => OnModalRoleForm()}
            variant="outline"
            size="xs"
            radius={100}
          >
            <Trans>Create new</Trans>
          </Button>
        </Group>

        <WorkspaceRoleCard id={WorkspaceSpecialRoleId.OWNER} />
        <WorkspaceRoleCard id={WorkspaceSpecialRoleId.ADMIN} />
        <WorkspaceRoleCard id={WorkspaceSpecialRoleId.MEMBER} />

        {workspace.roles
          .filter(
            (v) =>
              ![
                WorkspaceSpecialRoleId.OWNER,
                WorkspaceSpecialRoleId.ADMIN,
                WorkspaceSpecialRoleId.MEMBER,
              ].includes(v._id as any)
          )
          .map((role) => {
            return <WorkspaceRoleCard key={role._id} id={role._id} />;
          })}
      </Stack>
    </Container>
  );
};
