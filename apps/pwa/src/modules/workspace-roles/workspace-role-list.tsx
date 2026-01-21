"use client";

import { Button } from "@/components/buttons/button";
import { Container } from "@/components/container";
import { WorkspaceRoleCard } from "@/modules/workspace-roles/components/workspace-role-card";
import { OnModalRoleForm } from "@/modules/workspace-roles/modals/modal-workspace-role-form";
import { WorkspaceDefaultRoleId } from "@/modules/workspace-roles/workspace-roles-types";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { stringable } from "@joy-one-client/utils/string";
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

        <WorkspaceRoleCard id={WorkspaceDefaultRoleId.OWNER} />
        <WorkspaceRoleCard id={WorkspaceDefaultRoleId.ADMIN} />
        <WorkspaceRoleCard id={WorkspaceDefaultRoleId.MEMBER} />

        {workspace.roles
          .filter(
            (v) =>
              ![
                WorkspaceDefaultRoleId.OWNER,
                WorkspaceDefaultRoleId.ADMIN,
                WorkspaceDefaultRoleId.MEMBER,
              ]
                .map(stringable)
                .includes(v._id)
          )
          .map((role) => {
            return <WorkspaceRoleCard key={role._id} id={role._id} />;
          })}
      </Stack>
    </Container>
  );
};
