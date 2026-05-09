"use client";

import { FC, ReactNode, useMemo, useRef } from "react";

import { Group, Stack, StackProps, Text, ThemeIcon, Timeline, Tooltip } from "@mantine/core";
import { IconCashRegister, IconUserMinus, IconUserPlus } from "@tabler/icons-react";

import { useGraphqlList } from "@/components/list/use-graphql-list";
import { EventType, EventVariant } from "@/graphql/enums.graphql";
import { EventsQuery } from "@/graphql/types.graphql";
import { eventVariants } from "@/modules/events/event-constants";
import { useColor } from "@/modules/theme/use-color";
import { useColorScheme } from "@/modules/theme/use-color-scheme";
import {
  ModalUserInformation,
  ModalUserInformationRef,
} from "@/modules/users/modals/modal-user-information";
import { useWorkspaceMembers } from "@/modules/workspace-members/workspace-members-hooks";
import { DateTime } from "@joy-one/utils/date-time";
import { Trans } from "@lingui/react/macro";
import { Avatar } from "../../components/avatar";
import { ButtonViewMore } from "../../components/buttons/button-view-more";
import { Errored } from "../../components/errored";
import { DateFormat, RelativeTimeFormat } from "../../components/format/date-format";
import { EventFragment } from "./graphql/fragmentEvent.graphql";
import GetEventsDocument from "./graphql/getEvents.graphql";

export const EventItem: FC<{ event: EventFragment; openUser: (userId: string) => void }> = (
  props,
) => {
  const { event } = props;
  const isToday = DateTime.isSame(event.time, new Date(), "day");

  return (
    <Timeline.Item bullet={renderBullet(event)} title={<EventItemTitle event={event} />}>
      <Stack>
        <Group gap={5}>
          {!!props.event.user && (
            <Group
              gap={5}
              style={{ cursor: "pointer" }}
              onClick={() => {
                if (!props.event.user) return;
                props.openUser(props.event.user._id);
              }}
            >
              <Avatar user={props.event.user} size={18} hideOnlineStatus />

              <Text fz={10} c="gray" fw={500}>
                {props.event.user.name}
              </Text>
            </Group>
          )}

          <Text fz={10} c="gray">
            {isToday ? (
              <RelativeTimeFormat value={event.time} />
            ) : (
              <DateFormat value={event.time} />
            )}
          </Text>
        </Group>
      </Stack>
    </Timeline.Item>
  );
};

function renderBullet(ev: EventFragment) {
  const color = useColor();
  const colorScheme = useColorScheme();

  if (ev.type === EventType.CustomerAssignToUser) {
    return (
      <ThemeIcon size={23} radius={100} color="violet">
        <IconUserPlus strokeWidth={1.5} size={14} />
      </ThemeIcon>
    );
  }

  if (ev.type === EventType.CustomerUnassignUser) {
    return (
      <ThemeIcon size={23} radius={100} color="gray">
        <IconUserMinus strokeWidth={1.5} size={14} />
      </ThemeIcon>
    );
  }

  if (ev.type === EventType.ReceiptPaid) {
    return (
      <ThemeIcon size={23} radius={100} color="teal">
        <IconCashRegister strokeWidth={1.5} size={14} />
      </ThemeIcon>
    );
  }

  const eventVariant = eventVariants[ev.variant ?? EventVariant.Info];

  return (
    <Group
      justify="center"
      align="center"
      bg={colorScheme === "dark" ? undefined : `${eventVariant.color}.2`}
      w="100%"
      h="100%"
      style={{ borderRadius: "50%" }}
      flex={1}
    >
      <eventVariant.icon size={18} color={color(`${eventVariant.color}.6`)} />
    </Group>
  );
}

function EventItemTitle(props: { event: EventFragment }) {
  const { event } = props;

  const workspaceMembersIds = [
    ...new Set(
      [
        event.userId,
        ...(event.data?.fromAssigneeUserIds || []),
        ...(event.data?.toAssigneeUserIds || []),
      ].filter(Boolean) as string[],
    ),
  ];

  const [wokspaceMembers] = useWorkspaceMembers(workspaceMembersIds);

  if (
    event.type === EventType.TaskAssigned &&
    event.data &&
    event.data.fromAssigneeUserIds &&
    event.data.toAssigneeUserIds
  ) {
    const fromAssigneeUserIds = event.data.fromAssigneeUserIds;
    const toAssigneeUserIds = event.data.toAssigneeUserIds;

    const newAssigneeUserIds = toAssigneeUserIds.filter(
      (id: string) => !fromAssigneeUserIds.includes(id),
    );
    const removedAssigneeUserIds = fromAssigneeUserIds.filter(
      (id: string) => !toAssigneeUserIds.includes(id),
    );

    if (newAssigneeUserIds.length > 0) {
      return (
        <Group gap={8}>
          <Text fz={14}>
            <Trans>Assigned to</Trans>
          </Text>

          {newAssigneeUserIds.map((userId: string) => {
            const workspaceMembers = wokspaceMembers.find((m) => m.userId === userId);
            if (!workspaceMembers) return null;
            return (
              <Tooltip label={workspaceMembers.name} key={userId}>
                <Avatar user={workspaceMembers} size={22} />
              </Tooltip>
            );
          })}
        </Group>
      );
    }

    if (removedAssigneeUserIds.length > 0) {
      return (
        <Group gap={8}>
          <Text fz={14}>
            <Trans>Unassigned from</Trans>
          </Text>

          {removedAssigneeUserIds.map((userId: string) => {
            const userInfo = wokspaceMembers.find((m) => m.userId === userId);
            if (!userInfo) return null;
            return (
              <Tooltip label={userInfo.name} key={userId}>
                <Avatar user={userInfo} size={22} />
              </Tooltip>
            );
          })}
        </Group>
      );
    }

    return (
      <Group>
        <Text fz={14}>
          <Trans>Task assigned</Trans>
        </Text>
      </Group>
    );
  }

  return (
    <Group>
      <Text fz="sm">{event.typeName ?? props.event.type}</Text>
    </Group>
  );
}

interface EventListProps extends Omit<StackProps, "ref"> {
  ref?: string;
  userId?: string;
  type?: EventType;
  showTitle?: boolean;
  empty?: ReactNode;
  fetching?: ReactNode;
}

export const EventsList: FC<EventListProps> = ({
  ref,
  userId,
  type,
  showTitle,
  empty,
  fetching,
  ...rest
}) => {
  const modalUserInformationRef = useRef<ModalUserInformationRef>(null);

  const params = useMemo<EventsQuery>(() => {
    return {
      ref,
      userId,
      type,
    };
  }, [ref, userId]);

  const events = useGraphqlList<EventFragment>({
    query: GetEventsDocument,
    params,
  });

  const my = typeof rest.my === "number" ? rest.my : 30;

  if (!events.isInitialized) return fetching;
  if (events.isEmpty) return empty || null;

  return (
    <Stack my={my} {...rest}>
      {showTitle && (
        <Text fz={16}>
          <Trans>Timeline</Trans>
        </Text>
      )}

      {events.isHasError && <Errored error={events.error} />}

      {events.isHasData && (
        <Timeline
          active={1}
          bulletSize={25}
          lineWidth={1.5}
          styles={{ itemBullet: { padding: 0, border: 0 } }}
        >
          {events.data.map((event) => {
            return (
              <EventItem
                key={event._id}
                event={event}
                openUser={(userId) => modalUserInformationRef.current?.open(userId)}
              />
            );
          })}
        </Timeline>
      )}

      {events.isAbleToLoadMore && (
        <Group justify="start" pl={45}>
          <ButtonViewMore onClick={events.loadMore} />
        </Group>
      )}

      <ModalUserInformation ref={modalUserInformationRef} />
    </Stack>
  );
};
