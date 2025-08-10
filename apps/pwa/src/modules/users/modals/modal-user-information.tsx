"use client";

import { Avatar } from "@/components/avatar";
import { ButtonViewMore } from "@/components/buttons/button-view-more";
import { Empty } from "@/components/empty";
import { Errored } from "@/components/errored";
import { EventList } from "@/components/event-list";
import { useAuth } from "@/modules/auth/auth-context";
import { getBookings } from "@/modules/bookings/booking-service";
import { BookingEntity } from "@/modules/bookings/booking-types";
import { BookingCard } from "@/modules/bookings/components/booking-card";
import { EventType } from "@/modules/events/event-types";
import { renderDate, renderFromNow, t } from "@/modules/lang/lang-service";
import { useColor } from "@/modules/theme/use-color";
import { UserWorkspaceSettings } from "@/modules/users/components/user-workspace-settings-form";
import { getUserPublicInformation } from "@/modules/users/users-service";
import { UserPublicInformation } from "@/modules/users/users-types";
import { useWorkspaceMembers } from "@/modules/workspace-members/workspace-members-hooks";
import { getUserMemberRoleLabel } from "@/modules/workspace-members/workspace-members-service";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { onError } from "@/utils/exceptions.utils";
import { getAvatarInitials } from "@/utils/string.utils";
import { useFetch } from "@/utils/use-fetch.util";
import { UseList, useList } from "@/components/list/use-list";
import {
  ActionIcon,
  Anchor,
  Badge,
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
import { useDisclosure } from "@mantine/hooks";
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
import { FC, ReactNode, useRef, useState } from "react";

export let OnModalUserInformation: (userId: string) => void = () => {};

export const ModalUserInformation: FC = () => {
  const [opened, { open, close }] = useDisclosure(false);
  const userId = useRef<string | null>(null);

  const userInformation = useFetch({
    autoFetch: false,
    fetch: async () => {
      if (!userId.current) throw Error("Unaccessable");
      return getUserPublicInformation(userId.current!).catch((error) => {
        onError(error);
        close();
      });
    },
    events: {
      types: [
        EventType.WORKSPACE_MEMBER_UPDATED,
        EventType.WORKSPACE_MEMBER_LEAVED,
        EventType.WORKSPACE_MEMBER_TRANSFER_OWNER,
      ],
      condition: () => !!userId.current,
    },
  });

  const onClose = () => {
    userInformation.reset();
    close();
  };

  OnModalUserInformation = async (id) => {
    userId.current = id;
    userInformation.fetch();
    open();
  };

  return (
    <Modal opened={opened} onClose={onClose} withCloseButton={false} size="xl" zIndex={300}>
      <Stack>
        {!!userInformation.data && userInformation.data._id === userId.current && (
          <UserInformation user={userInformation.data} onClose={onClose} />
        )}

        {userInformation.isFetching && (
          <Stack p={16}>
            <Skeleton height={200} />
          </Stack>
        )}
      </Stack>
    </Modal>
  );
};

const UserInformation: FC<{ user: UserPublicInformation; onClose: () => void }> = (props) => {
  const { user } = props;
  const [tab, setTab] = useState<string>("activity");

  const workspace = useWorkspace();
  const auth = useAuth();
  const mutualWorkspace = user.mutualWorkspaces.find(
    (w) => w._id === workspace.userMember.workspaceId
  );
  const isOnline = workspace.isUserOnline(user._id);
  const isMe = auth.user?._id === user._id;

  const [userMemberInfos] = useWorkspaceMembers([user._id]);
  const member = userMemberInfos.find((v) => v.userId === user._id);

  const bookings = useList({
    id: `user-bookings-${user._id}`,
    fetch: () => getBookings({ assigneeUserIds: [user._id] }),
  });

  const githubProvider = user.providers?.find((p) => p.providerId === "github.com");

  return (
    <Stack p={5} gap={30}>
      <Group align="start">
        <Avatar
          onlineIndicatorProps={{ size: 15, offset: 12 }}
          color={mutualWorkspace?.memberColor || mutualWorkspace?.color || user.color}
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
                  {isOnline ? t("online") : t("offline")}
                </Badge>
              </Group>

              {!!user.lastSignInAt && !isOnline && (
                <Text c="gray" fz={10}>
                  {t("lastSignInAt")} {renderFromNow(user.lastSignInAt)}
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
                label="display_name"
                value={member?.memberDisplayName}
                icon={IconUser}
              />
            )}

            {!!mutualWorkspace && member && (
              <ShortInfoSession
                label="member_role"
                value={getUserMemberRoleLabel(member)}
                icon={IconAccessible}
              />
            )}

            <ShortInfoSession
              label="email"
              value={user.email}
              icon={IconMail}
              href={`mailto:${user.email}`}
            />

            {!!user.phone && (
              <ShortInfoSession
                label="phone"
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
                label="birthday"
                value={renderDate(user.birthday)}
                icon={IconCake}
              />
            )}
          </SimpleGrid>
        </Stack>
      </Group>

      <Tabs value={tab} onChange={(t) => setTab(t || "activity")}>
        <Tabs.List>
          <Tabs.Tab value="activity" fz={14} fw={500} h={30} px={16 * 2}>
            {t("activity")}
          </Tabs.Tab>

          {!isMe && (
            <Tabs.Tab value="mutual_workspaces" fz={14} fw={500} h={30} px={16 * 2}>
              {t("mutual_workspaces")}

              <Text component="span" ml={3} fz={14} c="gray">
                ({user.mutualWorkspaces.length})
              </Text>
            </Tabs.Tab>
          )}

          <Tabs.Tab value="bookings" fz={14} fw={500} h={30} px={16 * 2}>
            {t("bookings")}

            <Text component="span" ml={3} fz={14} c="gray">
              ({bookings.count})
            </Text>
          </Tabs.Tab>

          {!!member && (
            <Tabs.Tab value="workspace-settings" fz={14} fw={500} h={30} px={16 * 2}>
              {t("workspace-settings")}
            </Tabs.Tab>
          )}
        </Tabs.List>

        <Tabs.Panel value="activity" pt={16}>
          <UserActivity user={user} />
        </Tabs.Panel>

        <Tabs.Panel value="mutual_workspaces" pt={16}>
          <UserMutualWorkspaces user={user} />
        </Tabs.Panel>

        <Tabs.Panel value="bookings" pt={16}>
          <UserBookings user={user} bookings={bookings} />
        </Tabs.Panel>

        {!!member && (
          <Tabs.Panel value="workspace-settings" pt={16}>
            <UserWorkspaceSettings userId={user._id} onClose={props.onClose} removeable />
          </Tabs.Panel>
        )}
      </Tabs>
    </Stack>
  );
};

const UserMutualWorkspaces: FC<{ user: UserPublicInformation }> = (props) => {
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
                  {getUserMemberRoleLabel(data)}
                </Text>
              </Stack>
            </Group>
          </Card>
        );
      })}
    </Group>
  );
};

const UserActivity: FC<{ user: UserPublicInformation }> = (props) => {
  const { user } = props;

  return (
    <Stack>
      <EventList
        my={10}
        ref={user._id}
        empty={<Empty />}
        id={`user-activity-${user._id}`}
        fetching={<Skeleton height={50} />}
      />
    </Stack>
  );
};

const UserBookings: FC<{
  user: UserPublicInformation;
  bookings: UseList<BookingEntity>;
}> = (props) => {
  const { bookings } = props;

  return (
    <Stack>
      <Empty visible={bookings.isEmpty} hideBorder />
      <Errored error={bookings.error} visible={bookings.isHasError} />

      {bookings.isHasData && (
        <Stack>
          {bookings.data.map((b) => {
            return <BookingCard key={b._id} booking={b} withBorder />;
          })}
        </Stack>
      )}

      {bookings.isFetching && <Skeleton height={50} />}

      <ButtonViewMore
        onClick={() => bookings.fetch()}
        size="compact-xs"
        fz={10}
        iconSpacing={-12}
        iconSize={12}
        visible={bookings.isAbleToLoadMore}
      />
    </Stack>
  );
};

const ShortInfoSession: FC<{
  label: string;
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
        {t(label)}
      </Text>
      {render(
        <Group gap={5} wrap="nowrap">
          {props.icon && <props.icon size={16} color={color("gray")} />}
          <Text fz={14} c="gray" truncate="end">
            {value}
          </Text>
        </Group>
      )}
    </Stack>
  );
};
