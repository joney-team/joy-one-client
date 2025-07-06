"use client";

import { Avatar } from "@/components/avatar";
import { Clickable } from "@/components/clickable";
import { List } from "@/components/list";
import { DateTimeColumn } from "@/components/list/columns/date-time-column";
import { DynamicSelectorFilterOption } from "@/components/list/filters/dynamic-selector-filter";
import { EventType } from "@/modules/events/event-types";
import { t } from "@/modules/lang/lang-service";
import { searchEntity } from "@/modules/search/search-service";
import { useColor } from "@/modules/theme/use-color";
import { OnModalUserInformation } from "@/modules/users/modals/modal-user-information";
import { WorkspaceBranchesInput } from "@/modules/workspace-branches/workspace-branches-input";
import { getWorkspaceBranchByIds } from "@/modules/workspace-branches/workspace-branches-service";
import {
  getUserMemberRoleLabel,
  updateWorkspaceMember,
} from "@/modules/workspace-members/workspace-members-service";
import { WorkspaceMember } from "@/modules/workspace-members/workspace-members-types";
import { WorkspaceRolesInput } from "@/modules/workspace-roles/components/workspace-roles-input";
import {
  WorkspacePermission,
  WorkspaceSpecialRoleId,
} from "@/modules/workspace-roles/workspace-roles-types";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { AppEntity } from "@/types";
import { Badge, Card, ColorSwatch, Group, Stack, Text, ThemeIcon } from "@mantine/core";
import { IconAccessible, IconBuilding, IconLock, IconMail, IconPhone } from "@tabler/icons-react";
import { FC } from "react";

export const WorkspaceMemberList: FC = () => {
  const workspace = useWorkspace();
  const color = useColor();

  const bindOptions = (options: DynamicSelectorFilterOption[]) => {
    return [
      ...options.map((v) => ({ label: v.label, value: v.value, data: v.data })),
      { label: t("main_workspace_branch"), value: "root", data: null },
    ];
  };

  return (
    <Stack p={16}>
      <List<WorkspaceMember>
        route="/workspace-members"
        id="workspace-members"
        name="members"
        columns={{
          name: {
            render: ({ data }) => (
              <Group
                gap={5}
                py={5}
                className="clickable"
                onClick={() => OnModalUserInformation(data.userId)}
              >
                <Avatar user={data} size={30} />
                <Clickable onClick={() => OnModalUserInformation(data.userId)}>
                  <Text>{data.name || t("unamed")}</Text>
                </Clickable>
              </Group>
            ),
          },
          createdAt: DateTimeColumn({
            valuePath: "joinedAt",
            name: "join_workspace_at",
            isFromNow: true,
            hideTime: true,
            isHasFilter: false,
            isSortable: true,
            w: 180,
          }),
          email: {
            icon: IconMail,
            w: 200,
            render: ({ data }) => {
              if (!data.email) return null;

              if (data.email) {
                return (
                  <Clickable href={`mailto:${data.email}`} blank>
                    <Text>{data.email}</Text>
                  </Clickable>
                );
              }
            },
          },
          phone: {
            icon: IconPhone,
            w: 150,
            render: ({ data }) => {
              if (!data.phone) return null;

              return (
                <Clickable href={`tel:${data.phone}`} blank>
                  <Text>{data.phone}</Text>
                </Clickable>
              );
            },
          },
          roles: {
            name: "role",
            icon: IconAccessible,
            render: ({ data }) => {
              const isOwner = data.roles.some((v) => v._id === WorkspaceSpecialRoleId.OWNER);
              const isHasPermission = workspace.hasPermission(
                WorkspacePermission.WORKSPACE_ROLES_MANAGER
              );

              if (isOwner) {
                return (
                  <Badge
                    variant="light"
                    color={color("primary")}
                    rightSection={<IconLock size={13} style={{ marginLeft: -3 }} />}
                  >
                    {t(`role_${WorkspaceSpecialRoleId.OWNER}`)}
                  </Badge>
                );
              }

              return (
                <WorkspaceRolesInput
                  key={data.userId}
                  autoHide
                  disabled={!isHasPermission}
                  value={data.roles}
                  onChange={(roles) => {
                    if (!data.memberId) return;
                    return updateWorkspaceMember(data.memberId, {
                      ...data,
                      roleIds: roles.map((v) => v._id),
                    });
                  }}
                />
              );
            },
            exportToExcel: (_, data) => {
              return {
                text: getUserMemberRoleLabel(data),
              };
            },
          },
          workspaceBranchIds: {
            w: 300,
            name: "workspace_branch",
            icon: IconBuilding,
            render: ({ data }) => {
              if (data.permissions.includes(WorkspacePermission.WORKSPACE_BRANCHES_FULL_ACCESS)) {
                return <Badge variant="light">{t("all_branches")}</Badge>;
              }

              return (
                <WorkspaceBranchesInput
                  autoHide
                  key={data.userId}
                  disabled={!workspace.hasPermission(WorkspacePermission.WORKSPACE_MEMBERS_MANAGER)}
                  value={data.workspaceBranches}
                  onChange={(branches) => {
                    if (!data.memberId) return;
                    return updateWorkspaceMember(data.memberId, {
                      ...data,
                      workspaceBranchIds: branches.map((v) => v._id),
                    });
                  }}
                />
              );
            },
            disabled: !workspace.isShouldEnableBranches,
            filter:
              workspace.userMember.workspace.branches > 0 &&
              workspace.hasPermission(WorkspacePermission.WORKSPACE_BRANCHES_FULL_ACCESS)
                ? {
                    dynamicSelector: {
                      getOptions: async (ids) => {
                        const options = await getWorkspaceBranchByIds(
                          ids.filter((v) => v !== "root")
                        );
                        return bindOptions(
                          options.map((v) => ({ label: v.name, value: v._id, data: v }))
                        );
                      },
                      search: async (q) => {
                        const options = await searchEntity(AppEntity.WORKSPACE_BRANCHES, q);
                        return bindOptions(
                          options.map((v) => ({ label: v.name, value: v._id, data: v }))
                        );
                      },
                      listRoute: "/workspace-branches",
                    },
                  }
                : workspace.userMember.workspaceBranches.length > 1
                ? {
                    staticSelector: {
                      options: workspace.userMember.workspaceBranches.map((v) => ({
                        label: v.name,
                        value: v._id,
                      })),
                    },
                  }
                : undefined,
          },
        }}
        card={({ data }) => <MemberCard member={data} />}
        events={[
          EventType.WORKSPACE_MEMBER_UPDATED,
          EventType.WORKSPACE_MEMBER_LEAVED,
          EventType.WORKSPACE_MEMBER_TRANSFER_OWNER,
        ]}
      />
    </Stack>
  );
};

const MemberCard: FC<{ member: WorkspaceMember }> = (props) => {
  const { member } = props;

  return (
    <Card
      key={member.userId}
      p={10}
      shadow="xs"
      style={{ cursor: "pointer" }}
      onClick={() => {
        OnModalUserInformation(member.userId);
      }}
    >
      <Group align="start" wrap="nowrap" gap={10}>
        <Avatar user={member} size={40} />

        <Stack gap={5} flex={1}>
          <Group justify="space-between" w="100%" wrap="nowrap" align="start">
            <Text fw={500}>{member.name || "Unamed"}</Text>

            {member.color && <ColorSwatch color={member.color} size={10} />}
          </Group>

          {member.email && (
            <Group gap={5} wrap="nowrap">
              <ThemeIcon color="dark" size="xs" variant="transparent">
                <IconMail strokeWidth={1.5} size={16} />
              </ThemeIcon>
              <Text fz={12}>{member.email}</Text>
            </Group>
          )}

          {member.phone && (
            <Group gap={5} wrap="nowrap">
              <ThemeIcon color="dark" size="xs" variant="transparent">
                <IconPhone strokeWidth={1.5} size={16} />
              </ThemeIcon>
              <Text fz={12}>{member.phone}</Text>
            </Group>
          )}

          <Group gap={5} wrap="nowrap">
            <ThemeIcon color="dark" size="xs" variant="transparent">
              <IconAccessible strokeWidth={1.5} size={16} />
            </ThemeIcon>

            <Text fz={12} fw={500}>
              {getUserMemberRoleLabel(member)}
            </Text>
          </Group>
        </Stack>
      </Group>
    </Card>
  );
};
