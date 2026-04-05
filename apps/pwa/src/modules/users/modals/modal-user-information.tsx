"use client";

import { Avatar } from "@/components/avatar";
import { Badge } from "@/components/badge";
import { Empty } from "@/components/empty";
import { DateFormat, RelativeTimeFormat } from "@/components/format/date-format";
import { EventType } from "@/graphql/enums.graphql";
import { useAuth } from "@/modules/auth/auth-context";
import { useEventsListener } from "@/modules/events/event-service";
import { useColor } from "@/modules/theme/use-color";
import { WorkspaceMemberSetting } from "@/modules/workspace-members/components/workspace-member-setting";
import { useIsOnline } from "@/modules/workspace-members/hooks/use-is-member-online";
import { useWorkspaceMembers } from "@/modules/workspace-members/workspace-members-hooks";
import { WorkspaceMemberRoleName } from "@/modules/workspace-roles/components/workspace-role-name";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { nonLoading } from "@/utils/non-loading";
import { getAvatarInitials } from "@/utils/string.utils";
import { useLazyQuery } from "@apollo/client/react";
import { zIndexes } from "@joy-one-client/config/layout";
import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import {
  ActionIcon,
  Anchor,
  Card,
  Group,
  Modal,
  SimpleGrid,
  Skeleton,
  Stack,
  Tabs,
  Text,
  Title,
} from "@mantine/core";
import { setUser } from "@sentry/react";
import {
  Icon,
  IconAccessible,
  IconBrandGithub,
  IconCake,
  IconMail,
  IconPhone,
  IconUser,
  IconX,
} from "@tabler/icons-react";
import dynamic from "next/dynamic";
import { FC, forwardRef, Fragment, ReactNode, useImperativeHandle, useState } from "react";
import { UserPublicInformationFragment } from "../graphql/fragmentUserPublicINformation.graphql";
import GetUserPublicInformationDocument from "../graphql/getUserPublicInformation.graphql";

const EventsList = dynamic(
  () => import("@/modules/events/events-list").then((mod) => mod.EventsList),
  {
    ssr: false,
    loading: nonLoading,
  },
);

const UserInformation: FC<{ user: UserPublicInformationFragment; onClose: () => void }> = (
  props,
) => {
  const { user } = props;
  const [tab, setTab] = useState<string>("activity");

  const workspace = useWorkspace();
  const auth = useAuth();
  const mutualWorkspace = user.mutualWorkspaces.find((w) => w._id === workspace.member.workspaceId);
  const isOnline = useIsOnline(user._id);
  const isMe = auth.user?._id === user._id;

  const [userMemberInfos] = useWorkspaceMembers([user._id]);
  const member = userMemberInfos.find((v) => v.userId === user._id);

  const githubProvider = user.providers?.find((p) => p.providerId === "github.com");

  return (
    <Stack p={5} gap={30}>
      <Group align="start">
        <Avatar
          onlineIndicatorProps={{ size: 15, offset: 12 }}
          color={mutualWorkspace?.memberColor || mutualWorkspace?.color || user.color || "primary"}
          src={user.avatar}
          size={80}
        >
          {getAvatarInitials(user.name)}
        </Avatar>

        <Stack flex={1}>
          <Group justify="space-between" align="start">
            <Stack gap={0} flex={1}>
              <Group>
                <Title order={3} fw={500}>
                  {user.name}
                </Title>

                <Badge
                  color={isOnline ? "green" : "gray"}
                  variant={isOnline ? "filled" : "light"}
                  radius={4}
                >
                  {isOnline ? <Trans>Online</Trans> : <Trans>Offline</Trans>}
                </Badge>
              </Group>

              {!!user.lastSignInAt && !isOnline && (
                <Text c="gray" fz={10}>
                  <Trans>
                    Last sign in at <RelativeTimeFormat value={user.lastSignInAt} />
                  </Trans>
                </Text>
              )}
            </Stack>

            <ActionIcon variant="subtle" onClick={props.onClose} color="gray">
              <IconX strokeWidth={1.5} size={18} />
            </ActionIcon>
          </Group>

          <SimpleGrid cols={{ md: 3 }}>
            {!!member?.memberDisplayName && (
              <ShortInfoSession
                label={<Trans>Display name</Trans>}
                value={member?.memberDisplayName}
                icon={IconUser}
              />
            )}

            {!!mutualWorkspace && member && (
              <ShortInfoSession
                label={<Trans>Member role</Trans>}
                value={<WorkspaceMemberRoleName member={member} />}
                icon={IconAccessible}
              />
            )}

            <ShortInfoSession
              label={t`Email`}
              value={user.email}
              icon={IconMail}
              href={`mailto:${user.email}`}
            />

            {!!user.phone && (
              <ShortInfoSession
                label={t`Phone`}
                value={user.phone}
                icon={IconPhone}
                href={`tel:${user.phone}`}
              />
            )}

            {!!githubProvider && githubProvider.username && (
              <ShortInfoSession
                label="Github"
                value={githubProvider.username}
                icon={IconBrandGithub}
                href={`https://github.com/${githubProvider.username}`}
              />
            )}

            {!!user.birthday && (
              <ShortInfoSession
                label={t`Birthday`}
                value={<DateFormat value={user.birthday} type="date" />}
                icon={IconCake}
              />
            )}
          </SimpleGrid>
        </Stack>
      </Group>

      <Tabs value={tab} onChange={(t) => setTab(t || "activity")}>
        <Tabs.List>
          <Tabs.Tab value="activity" fz={14} fw={500} h={30} px={16 * 2}>
            <Trans>Activity</Trans>
          </Tabs.Tab>

          {!isMe && (
            <Tabs.Tab value="mutual_workspaces" fz={14} fw={500} h={30} px={16 * 2}>
              <Trans>Mutual workspaces</Trans>

              <Text component="span" ml={3} fz={14} c="gray">
                ({user.mutualWorkspaces.length})
              </Text>
            </Tabs.Tab>
          )}

          {!!member && (
            <Tabs.Tab value="workspace-settings" fz={14} fw={500} h={30} px={16 * 2}>
              <Trans>Workspace settings</Trans>
            </Tabs.Tab>
          )}
        </Tabs.List>

        <Tabs.Panel value="activity" pt={16}>
          <UserActivity user={user} />
        </Tabs.Panel>

        <Tabs.Panel value="mutual_workspaces" pt={16}>
          <UserMutualWorkspaces user={user} />
        </Tabs.Panel>

        {!!member && (
          <Tabs.Panel value="workspace-settings" pt={16}>
            <WorkspaceMemberSetting userId={user._id} onClose={props.onClose} removeable />
          </Tabs.Panel>
        )}
      </Tabs>
    </Stack>
  );
};

const UserMutualWorkspaces: FC<{ user: UserPublicInformationFragment }> = (props) => {
  const { user } = props;

  return (
    <Group gap={10}>
      {user.mutualWorkspaces.map((data) => {
        return (
          <Card withBorder shadow="none" key={data._id} p={10}>
            <Group gap={10}>
              <Avatar src={data.logo} size={40} color={data.color || "primary"} radius={5}>
                {getAvatarInitials(data.name)}
              </Avatar>

              <Stack gap={0}>
                <Text fz={16}>{data.name}</Text>
                <Text fz={12} c="gray">
                  <WorkspaceMemberRoleName
                    member={{
                      memberId: data.memberId,
                      roles: data.roles.map((r) => ({
                        __typename: "WorkspaceMemberRole",
                        _id: r._id,
                        name: r.name,
                        color: r.color,
                      })),
                    }}
                  />
                </Text>
              </Stack>
            </Group>
          </Card>
        );
      })}
    </Group>
  );
};

const UserActivity: FC<{ user: UserPublicInformationFragment }> = (props) => {
  const { user } = props;

  return (
    <Stack>
      <EventsList
        my={10}
        userId={user._id}
        empty={<Empty hideBorder message={<Trans>No activity</Trans>} />}
        fetching={<Skeleton height={50} />}
      />
    </Stack>
  );
};

const ShortInfoSession: FC<{
  label: ReactNode;
  value: ReactNode;
  icon?: Icon;
  href?: string;
}> = (props) => {
  const { label, value, href } = props;
  const color = useColor();

  const render = (children: ReactNode) => {
    if (href)
      return (
        <Anchor href={href} target="_blank" c="gray">
          {children}
        </Anchor>
      );

    return children;
  };

  return (
    <Stack gap={0}>
      <Text fz={14} fw={600} c="dark">
        {label}
      </Text>
      {render(
        <Group gap={5} wrap="nowrap">
          {props.icon && <props.icon size={16} color={color("gray")} />}
          <Text fz={14} c="gray" truncate="end">
            {value}
          </Text>
        </Group>,
      )}
    </Stack>
  );
};

export interface ModalUserInformationRef {
  open: (userId: string) => void;
  close: () => void;
}

export interface ModalUserInformationProps {
  children?: (ref: ModalUserInformationRef) => ReactNode;
}

export const ModalUserInformation = forwardRef<ModalUserInformationRef, ModalUserInformationProps>(
  (props, ref) => {
    const { children } = props;
    const [userId, setUserId] = useState<string | null>(null);

    const [fetchUserInformation, { data: userInformation, loading, refetch }] = useLazyQuery(
      GetUserPublicInformationDocument,
      {
        fetchPolicy: "cache-and-network",
      },
    );

    useEventsListener(
      [
        EventType.WorkspaceMemberUpdated,
        EventType.WorkspaceMemberLeaved,
        EventType.WorkspaceMemberTransferOwner,
      ],
      () => {
        if (!userId) return;
        refetch();
      },
    );

    useImperativeHandle(ref, () => ({
      open: (userId) => {
        setUserId(userId);
        fetchUserInformation({ variables: { userId } }).catch(() => {
          setUser(null);
        });
      },
      close: () => {
        setUserId(null);
      },
    }));

    const onClose = () => {
      setUserId(null);
    };

    return (
      <Fragment>
        {typeof children === "function" &&
          children({
            open: (id) => {
              setUserId(id);
              fetchUserInformation({ variables: { userId: id } }).catch(() => {
                setUser(null);
              });
            },
            close: () => {
              setUserId(null);
            },
          })}

        <Modal
          opened={!!userId}
          onClose={onClose}
          withCloseButton={false}
          size="xl"
          zIndex={zIndexes.commonModals}
        >
          <Stack>
            {!!userInformation?.user && userInformation?.user._id === userId && (
              <UserInformation user={userInformation?.user} onClose={onClose} />
            )}

            {loading && !userInformation && (
              <Stack p="md">
                <Skeleton height={200} />
              </Stack>
            )}
          </Stack>
        </Modal>
      </Fragment>
    );
  },
);
