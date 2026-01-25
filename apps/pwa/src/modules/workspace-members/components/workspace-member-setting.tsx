"use client";

import { Button } from "@/components/buttons/button";
import { FormSession } from "@/components/form-session";
import { configs } from "@/configs/layout.config";
import { WorkspaceMemberWorkingTimeType } from "@/graphql/enums.graphql";
import { useAuth } from "@/modules/auth/auth-context";
import { useColor } from "@/modules/theme/use-color";
import { WorkspaceBranchesInput } from "@/modules/workspace-branches/workspace-branches-input";
import { WorkspaceMemberDataFragment } from "@/modules/workspace-members/graphql/fragmentWorkspaceMember.graphql";
import { useWorkspaceMembers } from "@/modules/workspace-members/workspace-members-hooks";
import {
  getMemberRoleLabel,
  removeWorkspaceMember,
  updateWorkspaceMember,
} from "@/modules/workspace-members/workspace-members-service";
import { UpdateWorkspaceMemberDto } from "@/modules/workspace-members/workspace-members-types";
import { WorkspaceRolesInput } from "@/modules/workspace-roles/components/workspace-roles-input";
import { workspaceDefaultRoles } from "@/modules/workspace-roles/workspace-roles-constants";
import {
  WorkspaceDefaultRoleId,
  WorkspacePermission,
} from "@/modules/workspace-roles/workspace-roles-types";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { onArchive } from "@/utils/actions";
import { onError } from "@/utils/exceptions.utils";
import { capitalize } from "@/utils/string.utils";
import { useMutation } from "@apollo/client/react";
import { Trans, useLingui } from "@lingui/react/macro";
import { Badge, Center, ColorInput, Select, Skeleton, Stack, Text, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDebouncedCallback } from "@mantine/hooks";
import { IconArchive, IconLock } from "@tabler/icons-react";
import { FC } from "react";
import MUTATION_ASSIGN_WORKSPACE_MEMBER_ROLES from "../graphql/mutationAssignWorkspaceMemberRoles.graphql";

interface WorkspaceMemberSettingProps {
  userId: string;
  onClose?: () => void;
  removeable?: boolean;
}

const WorkspaceMemberSettingContent: FC<
  WorkspaceMemberSettingProps & { userMember: WorkspaceMemberDataFragment }
> = (props) => {
  const workspace = useWorkspace();
  const auth = useAuth();
  const color = useColor();
  const { t } = useLingui();
  const { userMember } = props;

  const isMe = auth.user?._id === props.userId;

  const isHasPermission = workspace.hasPermission(WorkspacePermission.WORKSPACE_MEMBERS_MANAGER);
  const isAbleToUpdate = isHasPermission || isMe;
  const isMainWorkspaceAccessable = userMember.permissions.includes(
    WorkspacePermission.WORKSPACE_BRANCHES_FULL_ACCESS
  );
  const isOwner = userMember.roles.some((v) => v._id === WorkspaceDefaultRoleId.OWNER);

  const onUpdate = useDebouncedCallback((values: UpdateWorkspaceMemberDto) => {
    if (userMember && isAbleToUpdate) {
      updateWorkspaceMember(userMember.memberId!, values).catch(onError);
    }
  }, 500);

  const [assignRoles] = useMutation(MUTATION_ASSIGN_WORKSPACE_MEMBER_ROLES);

  const form = useForm<UpdateWorkspaceMemberDto>({
    initialValues: {
      ...userMember,
      roleIds: userMember.roles.map((v) => v._id) || [],
      displayName: userMember?.memberDisplayName || "",
      color: userMember?.color || "",
      workingTimeType: userMember?.workingTimeType ?? WorkspaceMemberWorkingTimeType.Fulltime,
    },
    onValuesChange: (values) => {
      onUpdate(values);
      return values;
    },
  });

  return (
    <Stack p={16}>
      <FormSession
        title={<Trans>Display name in Workspace</Trans>}
        description={
          <Trans>
            Nickname or full name, used internally in Workspace. Leave blank if using default
            account name.
          </Trans>
        }
      >
        <TextInput {...form.getInputProps("displayName")} disabled={!isAbleToUpdate} />
      </FormSession>

      <FormSession title={<Trans>Color</Trans>}>
        <ColorInput
          format="hex"
          swatches={configs.swatches}
          disabled={!isAbleToUpdate}
          {...form.getInputProps("color")}
        />
      </FormSession>

      <FormSession title={<Trans>Working time type</Trans>}>
        <Select
          value={form.values.workingTimeType}
          data={Object.values(WorkspaceMemberWorkingTimeType).map((type) => ({
            label: capitalize(type.toLowerCase()),
            value: type,
          }))}
          {...form.getInputProps("workingTimeType")}
          disabled={!workspace.hasPermission(WorkspacePermission.WORKSPACE_ROLES_MANAGER)}
        />
      </FormSession>

      <FormSession title={<Trans>Member roles</Trans>}>
        {isOwner ? (
          <Badge
            variant="light"
            color={color("primary")}
            rightSection={<IconLock size={13} style={{ marginLeft: -3 }} />}
          >
            {t(workspaceDefaultRoles[WorkspaceDefaultRoleId.OWNER].name)}
          </Badge>
        ) : workspace.hasPermission(WorkspacePermission.WORKSPACE_ROLES_MANAGER) ? (
          <WorkspaceRolesInput
            value={userMember.roles}
            onChange={(roles) => {
              if (!userMember.memberId) return;
              return assignRoles({
                variables: {
                  memberId: userMember.memberId,
                  roleIds: roles.map((v) => v._id),
                },
              });
            }}
          />
        ) : (
          getMemberRoleLabel(userMember)
        )}
      </FormSession>

      {workspace.isShouldEnableBranches && (
        <FormSession title={<Trans>Branches</Trans>}>
          {isMainWorkspaceAccessable ? (
            <Badge variant="light">
              <Trans>All branches</Trans>
            </Badge>
          ) : (
            <WorkspaceBranchesInput
              key={userMember.userId}
              disabled={!workspace.hasPermission(WorkspacePermission.WORKSPACE_MEMBERS_MANAGER)}
              value={userMember.workspaceBranches}
              onChange={(branches) => {
                if (!userMember.memberId) return;
                return updateWorkspaceMember(userMember.memberId, {
                  ...userMember,
                  workspaceBranchIds: branches.map((v) => v._id),
                } as any);
              }}
            />
          )}
        </FormSession>
      )}

      {props.removeable &&
        userMember.memberId &&
        workspace.hasPermission(WorkspacePermission.WORKSPACE_MEMBERS_MANAGER) &&
        !userMember.roles.some((v) => v._id === WorkspaceDefaultRoleId.OWNER) && (
          <Center mt={20}>
            <Button
              variant="subtle"
              color="red"
              size="compact-xs"
              leftIcon={IconArchive}
              onClick={() =>
                onArchive({
                  name: userMember.memberDisplayName ?? userMember.name,
                  process: async () => {
                    await removeWorkspaceMember(userMember.memberId!);
                    props.onClose?.();
                  },
                })
              }
            >
              <Text fz={12} fw={400}>
                <Trans>Remove</Trans>
              </Text>
            </Button>
          </Center>
        )}
    </Stack>
  );
};

export const WorkspaceMemberSetting: FC<WorkspaceMemberSettingProps> = (props) => {
  const [userMemberInfos] = useWorkspaceMembers([props.userId]);
  const userMember = userMemberInfos.find((v) => v.userId === props.userId);
  if (!userMember) return <Skeleton height={200} />;
  return <WorkspaceMemberSettingContent {...props} userMember={userMember} />;
};
