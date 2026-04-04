"use client";

import { Button } from "@/components/buttons/button";
import { Container } from "@/components/container";
import { WorkspaceRoleCard } from "@/modules/workspace-roles/components/workspace-role-card";
import { OnModalRoleForm } from "@/modules/workspace-roles/modals/modal-workspace-role-form";
import { Trans } from "@lingui/react/macro";
import { Group, Stack } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { type FC } from "react";
import { useWorkspaceRoles } from "./hooks/use-workspace-roles";

export const WorkspaceRoleList: FC = () => {
  const { workspaceRoles } = useWorkspaceRoles();

  return (
    <Container size="sm" p="md">
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

        {workspaceRoles.map((role) => {
          return <WorkspaceRoleCard key={role._id} role={role} />;
        })}
      </Stack>
    </Container>
  );
};
