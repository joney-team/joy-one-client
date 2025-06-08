import { type FC } from "react";
import { Container } from "@/components/container";
import { Button } from "@/components/buttons/button";
import { WorkspaceRoleCard } from "@/modules/workspace-roles/workspace-role-card";
import { OnModalRoleForm } from "@/modules/workspace-roles/modals/modal-workspace-role-form";
import { t } from "@/modules/lang/lang-service";
import { WorkspaceSpecialRoleId } from "@/modules/workspace-roles/workspace-roles-types";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { Group, Stack } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";

export const WorkspaceRoleList: FC = () => {
  const workspace = useWorkspace();

  return (
    <Container size="sm" p={16}>
      <Stack className="MemberRoles">
        <Group justify="start">
          <Button leftIcon={IconPlus} onClick={() => OnModalRoleForm()} variant="outline" size="xs" radius={100}>
            {t("create_new")}
          </Button>
        </Group>

        <WorkspaceRoleCard id={WorkspaceSpecialRoleId.OWNER} />
        <WorkspaceRoleCard id={WorkspaceSpecialRoleId.ADMIN} />
        <WorkspaceRoleCard id={WorkspaceSpecialRoleId.MEMBER} />

        {workspace.roles
          .filter(
            (v) =>
              ![WorkspaceSpecialRoleId.OWNER, WorkspaceSpecialRoleId.ADMIN, WorkspaceSpecialRoleId.MEMBER].includes(
                v._id as any
              )
          )
          .map((role) => {
            return <WorkspaceRoleCard key={role._id} id={role._id} />;
          })}
      </Stack>
    </Container>
  );
};
