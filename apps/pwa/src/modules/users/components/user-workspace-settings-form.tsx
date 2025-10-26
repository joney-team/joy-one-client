"use client";

import { Button } from "@/components/buttons/button";
import { FormSession } from "@/components/form-session";
import { configs } from "@/configs/layout.config";
import { useAuth } from "@/modules/auth/auth-context";
import { useColor } from "@/modules/theme/use-color";
import { WorkspaceBranchesInput } from "@/modules/workspace-branches/workspace-branches-input";
import { useWorkspaceMembers } from "@/modules/workspace-members/workspace-members-hooks";
import {
  getWorkspaceMemberRoleLabel,
  removeWorkspaceMember,
  updateWorkspaceMember,
} from "@/modules/workspace-members/workspace-members-service";
import {
  UpdateWorkspaceMemberDto,
  WorkspaceMember,
  WorkspaceMemberWorkingTimeType,
} from "@/modules/workspace-members/workspace-members-types";
import { WorkspaceRolesInput } from "@/modules/workspace-roles/components/workspace-roles-input";
import { workspaceSpecialRoleIds } from "@/modules/workspace-roles/workspace-roles-constants";
import {
  WorkspacePermission,
  WorkspaceSpecialRoleId,
} from "@/modules/workspace-roles/workspace-roles-types";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { onArchive } from "@/utils/actions";
import { onError } from "@/utils/exceptions.utils";
import { capitalize } from "@/utils/string.utils";
import { t } from "@lingui/core/macro";
import { Badge, Center, ColorInput, Select, Skeleton, Stack, Text, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDebouncedCallback } from "@mantine/hooks";
import { IconArchive, IconLock } from "@tabler/icons-react";
import { FC } from "react";

interface UserWorkspaceSettingsProps {
  userId: string;
  onClose?: () => void;
  removeable?: boolean;
}

const UserWorkspaceSettingsForm: FC<
  UserWorkspaceSettingsProps & { userMember: WorkspaceMember }
> = (props) => {
  const workspace = useWorkspace();
  const auth = useAuth();
  const color = useColor();
  const { userMember } = props;

  const isMe = auth.user?._id === props.userId;

  const isHasPermission = workspace.hasPermission(WorkspacePermission.WORKSPACE_MEMBERS_MANAGER);
  const isAbleToUpdate = isHasPermission || isMe;
  const isMainWorkspaceAccessable = userMember.permissions.includes(
    WorkspacePermission.WORKSPACE_BRANCHES_FULL_ACCESS
  );
  const isOwner = userMember.roles.some((v) => v._id === WorkspaceSpecialRoleId.OWNER);

  const onUpdate = useDebouncedCallback((values: UpdateWorkspaceMemberDto) => {
    if (userMember && isAbleToUpdate) {
      updateWorkspaceMember(userMember.memberId!, values).catch(onError);
    }
  }, 500);

  const form = useForm<UpdateWorkspaceMemberDto>({
    initialValues: {
      ...userMember,
      roleIds: userMember.roles.map((v) => v._id) || [],
      displayName: userMember?.memberDisplayName || "",
      color: userMember?.color || "",
      workingTimeType: userMember?.workingTimeType || WorkspaceMemberWorkingTimeType.FULLTIME,
    },
    onValuesChange: (values) => {
      onUpdate(values);
      return values;
    },
  });

  return (
    <Stack p={16}>
      <FormSession
        title={t`Display name in Workspace`}
        description={t`Nickname or full name, used internally in Workspace. Leave blank if using default account name.`}
      >
        <TextInput {...form.getInputProps("displayName")} disabled={!isAbleToUpdate} />
      </FormSession>

      <FormSession title="color">
        <ColorInput
          format="hex"
          swatches={configs.swatches}
          disabled={!isAbleToUpdate}
          {...form.getInputProps("color")}
        />
      </FormSession>

      <FormSession title={t`Working time type`}>
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

      <FormSession title={t`Member roles`}>
        {isOwner ? (
          <Badge
            variant="light"
            color={color("primary")}
            rightSection={<IconLock size={13} style={{ marginLeft: -3 }} />}
          >
            {workspaceSpecialRoleIds[WorkspaceSpecialRoleId.OWNER].name()}
          </Badge>
        ) : workspace.hasPermission(WorkspacePermission.WORKSPACE_ROLES_MANAGER) ? (
          <WorkspaceRolesInput
            value={userMember.roles}
            onChange={(roles) =>
              form.setFieldValue(
                "roleIds",
                roles.map((v) => v._id)
              )
            }
          />
        ) : (
          getWorkspaceMemberRoleLabel(userMember)
        )}
      </FormSession>

      {workspace.isShouldEnableBranches && (
        <FormSession title={t`Branches`}>
          {isMainWorkspaceAccessable ? (
            <Badge variant="light">{t`All branches`}</Badge>
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
                });
              }}
            />
          )}
        </FormSession>
      )}

      {props.removeable &&
        userMember.memberId &&
        workspace.hasPermission(WorkspacePermission.WORKSPACE_MEMBERS_MANAGER) &&
        !userMember.roles.some((v) => v._id === WorkspaceSpecialRoleId.OWNER) && (
          <Center mt={20}>
            <Button
              variant="subtle"
              color="red"
              size="xs"
              leftIcon={IconArchive}
              iconStrokeWidth={1.3}
              onClick={() =>
                onArchive({
                  name: "member",
                  process: () => removeWorkspaceMember(userMember.memberId!),
                  onArchived: () => props.onClose?.(),
                })
              }
            >
              <Text fz={12} fw={400}>
                {t`Remove`}
              </Text>
            </Button>
          </Center>
        )}
    </Stack>
  );
};

export const UserWorkspaceSettings: FC<UserWorkspaceSettingsProps> = (props) => {
  const [userMemberInfos] = useWorkspaceMembers([props.userId]);
  const userMember = userMemberInfos.find((v) => v.userId === props.userId);
  if (!userMember) return <Skeleton height={200} />;
  return <UserWorkspaceSettingsForm {...props} userMember={userMember} />;
};
