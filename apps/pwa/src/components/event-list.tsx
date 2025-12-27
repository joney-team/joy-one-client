"use client";

import { FC, ReactNode } from "react";

import { useList } from "@/components/list/use-list";
import { getEvents } from "@/modules/events/event-service";
import { EventEntity, EventVariant } from "@/modules/events/event-types";
import { Badge, Group, Stack, StackProps, Text, ThemeIcon, Timeline, Tooltip } from "@mantine/core";
import {
  IconArrowRight,
  IconCashRegister,
  IconFlagFilled,
  IconUserMinus,
  IconUserPlus,
  IconX,
} from "@tabler/icons-react";

import { eventTypes, eventVariants } from "@/modules/events/event-constants";
import { taskPriorities } from "@/modules/tasks/task-constants";
import { getTaskPriorityColor, renderTaskStatusStyle } from "@/modules/tasks/tasks-service";
import { TaskPriority } from "@/modules/tasks/tasks-types";
import { useColor } from "@/modules/theme/use-color";
import { useColorScheme } from "@/modules/theme/use-color-scheme";
import { ModalUserInformation } from "@/modules/users/modals/modal-user-information";
import { useWorkspaceMembers } from "@/modules/workspace-members/workspace-members-hooks";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { DateTime } from "@joy-one-client/utils/date-time";
import { Trans, useLingui } from "@lingui/react/macro";
import { Avatar } from "./avatar";
import { ButtonViewMore } from "./buttons/button-view-more";
import { Errored } from "./errored";
import { DateFormat, RelativeTimeFormat } from "./format/date-format";
import { EventType } from "@/graphql/enums.graphql";

interface EventListProps extends StackProps {
  ref?: string;
  userId?: string;
  type?: EventType | EventType[];
  showTitle?: boolean;
  empty?: ReactNode;
  fetching?: ReactNode;
}

export const EventList: FC<EventListProps> = ({
  ref,
  userId,
  type,
  showTitle,
  empty,
  fetching,
  ...rest
}) => {
  const id = rest.id || `list-event-${JSON.stringify({ ref: ref, userId: userId, type: type })}`;

  const events = useList<EventEntity>({
    id: id,
    limit: 5,
    fetch: async (query) => getEvents({ ...query, ref: ref, userId: userId, type: type }),
    isIgnoreEventActionType: true,
    events: {
      types: Object.values(EventType),
      condition: (event) => {
        return event.ref === ref || (event.relatedEntities || []).some((v) => v.id === ref);
      },
    },
  });

  const my = typeof rest.my === "number" ? rest.my : 30;

  if (fetching && !events.isInitialized) return fetching;
  if (events.isEmpty) return empty || null;

  return (
    <Stack my={my} {...rest}>
      {showTitle && (
        <Text fz={16}>
          <Trans>Timeline</Trans>
        </Text>
      )}

      <Errored error={events.error} visible={events.isHasError} />

      {events.data.length > 0 && (
        <Timeline
          active={1}
          bulletSize={25}
          lineWidth={1.5}
          styles={{ itemBullet: { padding: 0, border: 0 } }}
        >
          {events.data.map((event) => {
            return <EventItem key={event._id} event={event} />;
          })}
        </Timeline>
      )}

      {events.isAbleToLoadMore && (
        <Group justify="start" pl={45}>
          <ButtonViewMore onClick={events.loadMore} />
        </Group>
      )}
    </Stack>
  );
};

export const EventItem: FC<{ event: EventEntity }> = (props) => {
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

function renderBullet(ev: EventEntity) {
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

  const eventVariant = eventVariants[ev.variant || EventVariant.INFO];

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

function EventItemTitle(props: { event: EventEntity }) {
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

  if (event.type === EventType.TaskPriorityUpdated && event.data) {
    const toPriority = event.data.toPriority as TaskPriority;
    const fromPriority = event.data.fromPriority as TaskPriority;

    if (!toPriority && !fromPriority) return null;

    if (!toPriority)
      return (
        <Group gap={4}>
          <Text fz={14}>
            <Trans>Unset priority</Trans>
          </Text>

          <ThemeIcon size={14} radius={100} color="dark" variant="transparent">
            <IconX strokeWidth={1.5} size={14} />
          </ThemeIcon>

          <Group gap={0} ml={-4}>
            <ThemeIcon color={taskPriorities[fromPriority].color} variant="transparent">
              <IconFlagFilled size={16} />
            </ThemeIcon>
            <Text fz={14}>{taskPriorities[fromPriority].label()}</Text>
          </Group>
        </Group>
      );

    return (
      <Group gap={4}>
        <Text fz={14}>
          <Trans>Set priority</Trans>
        </Text>

        <ThemeIcon size={14} radius={100} color="dark" variant="transparent">
          <IconArrowRight strokeWidth={1.5} size={14} />
        </ThemeIcon>

        <Group gap={0} ml={-4}>
          <ThemeIcon color={getTaskPriorityColor(toPriority)} variant="transparent">
            <IconFlagFilled size={16} />
          </ThemeIcon>
          <Text fz={14}>{taskPriorities[toPriority].label()}</Text>
        </Group>
      </Group>
    );
  }

  if (
    event.type === EventType.TaskStatusUpdated &&
    event.data &&
    event.data.fromStatus &&
    event.data.toStatus
  ) {
    const fromStatusStyle = renderTaskStatusStyle(
      event.data.fromStatus,
      workspace.settings.taskStatuses
    );
    const toStatusStyle = renderTaskStatusStyle(
      event.data.toStatus,
      workspace.settings.taskStatuses
    );

    return (
      <Group gap={8}>
        <Text fz={14}>
          <Trans>Status updated</Trans>
        </Text>

        <Group gap={3}>
          <Badge variant="outline" color={fromStatusStyle.color} size="xs">
            {fromStatusStyle.name}
          </Badge>

          <ThemeIcon size={14} radius={100} color="dark" variant="transparent">
            <IconArrowRight strokeWidth={1.5} size={14} />
          </ThemeIcon>

          <Badge variant="outline" color={toStatusStyle.color} size="xs">
            {toStatusStyle.name}
          </Badge>
        </Group>
      </Group>
    );
  }

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
