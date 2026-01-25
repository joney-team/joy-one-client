"use client";

import { FC, ReactNode, useCallback, useMemo } from "react";

import { Group, Stack, StackProps, Text, ThemeIcon, Timeline, Tooltip } from "@mantine/core";
import { IconCashRegister, IconUserMinus, IconUserPlus } from "@tabler/icons-react";

import { EventType, EventVariant } from "@/graphql/enums.graphql";
import { eventTypes, eventVariants } from "@/modules/events/event-constants";
import { useColor } from "@/modules/theme/use-color";
import { useColorScheme } from "@/modules/theme/use-color-scheme";
import { ModalUserInformation } from "@/modules/users/modals/modal-user-information";
import { useWorkspaceMembers } from "@/modules/workspace-members/workspace-members-hooks";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { useQuery } from "@apollo/client/react";
import { DateTime } from "@joy-one-client/utils/date-time";
import { Trans, useLingui } from "@lingui/react/macro";
import { Avatar } from "../../components/avatar";
import { ButtonViewMore } from "../../components/buttons/button-view-more";
import { Errored } from "../../components/errored";
import { DateFormat, RelativeTimeFormat } from "../../components/format/date-format";
import EVENTS_QUERY, {
  type EventsQuery,
  type EventsQueryVariables,
} from "./graphql/queryEvents.graphql";

interface EventListProps extends StackProps {
  ref?: string;
  userId?: string;
  type?: EventType;
  showTitle?: boolean;
  empty?: ReactNode;
  fetching?: ReactNode;
}

type Event = EventsQuery["events"]["results"][number];

export const EventsList: FC<EventListProps> = ({
  ref,
  userId,
  type,
  showTitle,
  empty,
  fetching,
  ...rest
}) => {
  const variables = useMemo<EventsQueryVariables>(() => {
    return {
      offset: 0,
      ref,
      userId,
      type,
      limit: 100,
    };
  }, [ref, userId]);

  const { data, loading, error, fetchMore } = useQuery<EventsQuery, EventsQueryVariables>(
    EVENTS_QUERY,
    {
      variables,
      fetchPolicy: "cache-and-network",
    }
  );

  const isAbleToFetchMore = useMemo(() => {
    return data && data.events.total > 0 && data.events.results.length < data.events.total;
  }, [data]);

  const onFetchMore = useCallback(async () => {
    if (!isAbleToFetchMore) return;
    await fetchMore({
      variables: {
        ...variables,
        offset: data?.events.results.length || 0,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) return prev;
        return {
          ...prev,
          events: {
            ...prev.events,
            data: [...prev.events.results, ...fetchMoreResult.events.results],
          },
        };
      },
    });
  }, [fetchMore, isAbleToFetchMore, variables, data]);

  const my = typeof rest.my === "number" ? rest.my : 30;

  if (fetching && loading && !error && !data) return fetching;
  if (!data || data.events.total === 0) return empty || null;

  return (
    <Stack my={my} {...rest}>
      {showTitle && (
        <Text fz={16}>
          <Trans>Timeline</Trans>
        </Text>
      )}

      {error && <Errored error={error} />}

      {data.events.results.length > 0 && (
        <Timeline
          active={1}
          bulletSize={25}
          lineWidth={1.5}
          styles={{ itemBullet: { padding: 0, border: 0 } }}
        >
          {data.events.results.map((event) => {
            return <EventItem key={event._id} event={event} />;
          })}
        </Timeline>
      )}

      {isAbleToFetchMore && (
        <Group justify="start" pl={45}>
          <ButtonViewMore onClick={onFetchMore} />
        </Group>
      )}
    </Stack>
  );
};

export const EventItem: FC<{ event: Event }> = (props) => {
  const { event } = props;
  const isToday = DateTime.isSame(event.time, new Date(), "day");

  return (
    <Timeline.Item bullet={renderBullet(event)} title={<EventItemTitle event={event} />}>
      <Stack>
        <Group gap={5}>
          {props.event.user && (
            <ModalUserInformation>
              {(modal) => (
                <Group
                  gap={5}
                  style={{ cursor: "pointer" }}
                  onClick={() => modal.open(props.event.user!._id)}
                >
                  <Avatar user={props.event.user} size={18} hideOnlineStatus />

                  <Text fz={10} c="gray" fw={500}>
                    {props.event.user?.name}
                  </Text>
                </Group>
              )}
            </ModalUserInformation>
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

function renderBullet(ev: Event) {
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

function EventItemTitle(props: { event: Event }) {
  const { t } = useLingui();
  const { event } = props;
  const workspace = useWorkspace();

  const workspaceMembersIds = [
    ...new Set(
      [
        event.userId,
        ...(event.data?.fromAssigneeUserIds || []),
        ...(event.data?.toAssigneeUserIds || []),
      ].filter(Boolean) as string[]
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
      (id: string) => !fromAssigneeUserIds.includes(id)
    );
    const removedAssigneeUserIds = fromAssigneeUserIds.filter(
      (id: string) => !toAssigneeUserIds.includes(id)
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
      <Text fz={14}>
        {eventTypes[props.event.type]?.name
          ? t(eventTypes[props.event.type]!.name)
          : props.event.type}
      </Text>
    </Group>
  );
}
