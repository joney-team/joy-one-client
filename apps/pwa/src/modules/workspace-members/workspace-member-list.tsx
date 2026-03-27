"use client";

import { Avatar } from "@/components/avatar";
import { Clickable } from "@/components/clickable";
import { List } from "@/components/list";
import { dateTimeColumn } from "@/components/list/columns/date-time-column";
import { DynamicSelectorFilterOption } from "@/components/list/filters/dynamic-selector-filter";
import { EventType } from "@/graphql/enums.graphql";
import { searchEntity } from "@/modules/search/search-service";
import { useColor } from "@/modules/theme/use-color";
import {
  ModalUserInformation,
  type ModalUserInformationRef,
} from "@/modules/users/modals/modal-user-information";
import { WorkspaceBranchesInput } from "@/modules/workspace-branches/workspace-branches-input";
import { WorkspaceRolesInput } from "@/modules/workspace-roles/components/workspace-roles-input";
import {
  WorkspaceDefaultRoleId,
  WorkspacePermission,
} from "@/modules/workspace-roles/workspace-roles-types";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { AppEntity } from "@/types";
import { useMutation } from "@apollo/client/react";
import { Trans, useLingui } from "@lingui/react/macro";
import { Badge, Card, ColorSwatch, Group, Stack, Text, ThemeIcon } from "@mantine/core";
import { IconAccessible, IconBuilding, IconLock, IconMail, IconPhone } from "@tabler/icons-react";
import { FC, Fragment, useRef } from "react";
import { useNormalizeRoles } from "../workspace-roles/hooks/use-normalize-roles";
import { WorkspaceMemberFragment } from "./graphql/fragmentWorkspaceMember.graphql";

import QUERY_WORKSPACE_BRANCHES_BY_IDS from "@/modules/workspace-branches/graphql/queryWorkspaceBranchsByIds.graphql";
import { WorkspaceMemberRoleName } from "../workspace-roles/components/workspace-role-name";
import MUTATION_ASSIGN_WORKSPACE_MEMBER_ROLES from "./graphql/mutationAssignWorkspaceMemberRoles.graphql";
import MUTATION_UPDATE_WORKSPACE_MEMBER from "./graphql/mutationUpdateWorkspaceMember.graphql";
import QUERY_WORKSPACE_MEMBERS from "./graphql/queryWorkspaceMembers.graphql";
import { normalizeUpdateWorkspaceMemberInput } from "./workspace-members-utils";

export const WorkspaceMemberList: FC = () => {
  const { t } = useLingui();
  const workspace = useWorkspace();
  const color = useColor();
  const { normalizeRole } = useNormalizeRoles();
  const modalUserInformationRef = useRef<ModalUserInformationRef>(null);

  const [assignRoles] = useMutation(MUTATION_ASSIGN_WORKSPACE_MEMBER_ROLES);
  const [updateWorkspaceMember] = useMutation(MUTATION_UPDATE_WORKSPACE_MEMBER);

  const bindOptions = (options: DynamicSelectorFilterOption[]) => {
    return [
      ...options.map((v) => ({ label: v.label, value: v.value, data: v.data })),
      { label: t`Main office`, value: "root", data: null },
    ];
  };

  return (
    <Stack p={16}>
      <List<WorkspaceMemberFragment>
        id="workspace-members"
        query={QUERY_WORKSPACE_MEMBERS}
        name={<Trans>Members</Trans>}
        columns={{
          name: {
            defaultWidth: 300,
            name: <Trans>Name</Trans>,
            render: ({ data }) => (
              <Group
                gap={5}
                py={5}
                className="clickable"
                onClick={() => modalUserInformationRef.current?.open(data.userId)}
              >
                <Avatar user={data} size={30} />
                <Clickable>{data.name || t`Unnamed`}</Clickable>
              </Group>
            ),
          },
          joinedAt: dateTimeColumn({
            valuePath: "joinedAt",
            name: <Trans>Joined at</Trans>,
            isShowRelativeTime: true,
            hideTime: true,
            isHasFilter: false,
            sortable: true,
            defaultWidth: 180,
          }),
          email: {
            icon: IconMail,
            name: <Trans>Email</Trans>,
            defaultWidth: 200,
            render: ({ data }) => {
              if (!data.email) return null;

              if (data.email) {
                return (
                  <Clickable href={`mailto:${data.email}`} blank>
                    {data.email}
                  </Clickable>
                );
              }
            },
          },
          phone: {
            icon: IconPhone,
            name: <Trans>Phone</Trans>,
            defaultWidth: 200,
            render: ({ data }) => {
              if (!data.phone) return null;

              return (
                <Clickable href={`tel:${data.phone}`} blank>
                  {data.phone}
                </Clickable>
              );
            },
          },
          roles: {
            name: <Trans>Role</Trans>,
            icon: IconAccessible,
            render: ({ data }) => {
              const roles = data.roles.map(normalizeRole);
              const owner = roles.find((v: any) => v._id === WorkspaceDefaultRoleId.OWNER);
              const isCanAssignRole = workspace.hasPermission(
                WorkspacePermission.WORKSPACE_ROLES_MANAGER,
              );

              if (owner) {
                return (
                  <Badge
                    variant="light"
                    color={color("primary")}
                    rightSection={<IconLock size={13} style={{ marginLeft: -3 }} />}
                  >
                    {owner.name}
                  </Badge>
                );
              }

              return (
                <WorkspaceRolesInput
                  autoHide
                  disabled={!isCanAssignRole}
                  value={data.roles}
                  onChange={(roles) => {
                    if (!data.memberId) return;
                    return assignRoles({
                      variables: {
                        memberId: data.memberId,
                        roleIds: roles.map((v) => v._id),
                      },
                    });
                  }}
                />
              );
            },
          },
          workspaceBranches: {
            defaultWidth: 300,
            name: <Trans>Branch</Trans>,
            icon: IconBuilding,
            render: ({ data }) => {
              if (data.permissions.includes(WorkspacePermission.WORKSPACE_BRANCHES_FULL_ACCESS)) {
                return (
                  <Badge variant="light">
                    <Trans>All branches</Trans>
                  </Badge>
                );
              }

              return (
                <WorkspaceBranchesInput
                  autoHide
                  key={data.userId}
                  disabled={!workspace.hasPermission(WorkspacePermission.WORKSPACE_MEMBERS_MANAGER)}
                  value={data.workspaceBranches}
                  onChange={(branches) => {
                    if (!data.memberId) return;

                    return updateWorkspaceMember({
                      variables: {
                        memberId: data.memberId,
                        input: {
                          ...normalizeUpdateWorkspaceMemberInput(data),
                          workspaceBranchIds: branches.map((v) => v._id),
                        },
                      },
                    });
                  }}
                />
              );
            },
            disabled: !workspace.isShouldEnableBranches,
            filter:
              workspace.member.workspaceBranches.length > 0 &&
              workspace.hasPermission(WorkspacePermission.WORKSPACE_BRANCHES_FULL_ACCESS)
                ? {
                    dynamicSelector: {
                      getSelectedOptions: async (ids, client) => {
                        const results = await client.query({
                          query: QUERY_WORKSPACE_BRANCHES_BY_IDS,
                          variables: { ids: ids.filter((v) => v !== "root") },
                        });
                        const options = results.data?.branches ?? [];
                        return bindOptions(
                          options.map((v) => ({ label: v.name, value: v._id, data: v })),
                        );
                      },
                      search: async (q) => {
                        const options = await searchEntity(AppEntity.WORKSPACE_BRANCHES, q);
                        return bindOptions(
                          options.map((v) => ({ label: v.name, value: v._id, data: v })),
                        );
                      },
                      listRoute: "/workspace-branches",
                    },
                  }
                : workspace.member.workspaceBranches.length > 1
                  ? {
                      staticSelector: {
                        options: workspace.member.workspaceBranches.map((v) => ({
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
          EventType.WorkspaceMemberUpdated,
          EventType.WorkspaceMemberAssignRoles,
          EventType.WorkspaceMemberLeaved,
          EventType.WorkspaceMemberTransferOwner,
        ]}
      />

      <ModalUserInformation ref={modalUserInformationRef} />
    </Stack>
  );
};

const MemberCard: FC<{ member: WorkspaceMemberFragment }> = (props) => {
  const { member } = props;
  const modalUserInformationRef = useRef<ModalUserInformationRef>(null);

  return (
    <Fragment>
      <Card
        key={member.userId}
        p={10}
        shadow="xs"
        style={{ cursor: "pointer" }}
        onClick={() => open(member.userId)}
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
                <WorkspaceMemberRoleName member={member} />
              </Text>
            </Group>
          </Stack>
        </Group>
      </Card>

      <ModalUserInformation ref={modalUserInformationRef} />
    </Fragment>
  );
};
