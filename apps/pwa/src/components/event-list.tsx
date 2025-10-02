"use client";

import { FC, ReactNode } from "react";

import { getEvents } from "@/modules/events/event-service";
import { EventEntity, EventType, EventVariant } from "@/modules/events/event-types";
import { useList } from "@/components/list/use-list";
import { Badge, Group, Stack, StackProps, Text, ThemeIcon, Timeline, Tooltip } from "@mantine/core";
import {
  IconArrowRight,
  IconCashRegister,
  IconFlagFilled,
  IconUserMinus,
  IconUserPlus,
  IconX,
} from "@tabler/icons-react";

import { OnModalUserInformation } from "@/modules/users/modals/modal-user-information";
import { eventVariantColors, eventVariantIcons } from "@/modules/events/event-config";
import { t } from "@/modules/lang/lang-service";
import { getTaskPriorityColor, renderTaskStatusStyle } from "@/modules/tasks/tasks-service";
import { useWorkspaceMembers } from "@/modules/workspace-members/workspace-members-hooks";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import dayjs from "dayjs";
import { Avatar } from "./avatar";
import { ButtonViewMore } from "./buttons/button-view-more";
import { Errored } from "./errored";
import { useColor } from "@/modules/theme/use-color";
import { useColorScheme } from "@/modules/theme/use-color-scheme";

interface EventListProps {
  ref?: string;
  userId?: string;
  type?: EventType | EventType[];
  showTitle?: boolean;
  props?: StackProps;
  empty?: ReactNode;
  fetching?: ReactNode;
  id?: string;
  my?: number;
}

export const EventList: FC<EventListProps> = (props) => {
  const id =
    props.id ||
    `list-event-${JSON.stringify({ ref: props.ref, userId: props.userId, type: props.type })}`;

  const events = useList<EventEntity>({
    id: id,
    limit: 5,
    fetch: async (query) =>
      getEvents({ ...query, ref: props.ref, userId: props.userId, type: props.type }),
    events: {
      types: [
        EventType.LOANS_JUST_CREATED,
        EventType.LOANS_PENDING,
        EventType.LOANS_APPROVED,
        EventType.LOANS_REJECTED,
        EventType.LOANS_UPDATED,
        EventType.LOANS_SYNCED,
        EventType.LOANS_FULFILLED,
        EventType.LOANS_COMPLETED,
        EventType.LOANS_ARCHIVED,
        EventType.LOANS_LIQUIDATION,
        EventType.LOANS_REVERT_LIQUIDATION,
        EventType.LOANS_CHANGE_WORKSPACE_BRANCH,

        EventType.RECEIPT_NEW,
        EventType.RECEIPT_PAID,
        EventType.RECEIPT_UPDATED,
        EventType.RECEIPT_DISBURSEMENT,
        EventType.RECEIPT_ARCHIVED,
        EventType.RECEIPT_UNARCHIVED,
        EventType.RECEIPT_CHANGE_WORKSPACE_BRANCH,
      ],
      condition: (event) => {
        return (
          event.ref === props.ref || (event.relatedEntities || []).some((v) => v.id === props.ref)
        );
      },
    },
  });

  const my = typeof props.my === "number" ? props.my : 30;

  if (props.fetching && !events.isInitialized) return props.fetching;
  if (events.isEmpty) return props.empty || null;

  return (
    <Stack my={my} {...props.props}>
      {props.showTitle && <Text fz={16}>{t("timeline")}</Text>}

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

  return (
    <Timeline.Item bullet={renderBullet(event)} title={<EventItemTitle event={event} />}>
      <Stack>
        <Group gap={5}>
          {props.event.user && (
            <Group
              gap={5}
              style={{ cursor: "pointer" }}
              onClick={() => OnModalUserInformation(props.event.user!._id)}
            >
              <Avatar user={props.event.user} size={18} hideOnlineStatus />

              <Text fz={10} c="gray" fw={500}>
                {props.event.user?.name}
              </Text>
            </Group>
          )}

          <Text fz={10} c="gray">
            {dayjs(new Date(event.time * 1000)).fromNow()}
          </Text>
        </Group>
      </Stack>
    </Timeline.Item>
  );
};

function renderBullet(ev: EventEntity) {
  const color = useColor();
  const colorScheme = useColorScheme();

  if (ev.type === EventType.CUSTOMER_ASSIGN_TO_USER) {
    return (
      <ThemeIcon size={23} radius={100} color="violet">
        <IconUserPlus strokeWidth={1.5} size={14} />
      </ThemeIcon>
    );
  }

  if (ev.type === EventType.CUSTOMER_UNASSIGN_USER) {
    return (
      <ThemeIcon size={23} radius={100} color="gray">
        <IconUserMinus strokeWidth={1.5} size={14} />
      </ThemeIcon>
    );
  }

  if (ev.type === EventType.RECEIPT_PAID) {
    return (
      <ThemeIcon size={23} radius={100} color="teal">
        <IconCashRegister strokeWidth={1.5} size={14} />
      </ThemeIcon>
    );
  }

  const variantColor = eventVariantColors[ev.variant || EventVariant.INFO];
  const VariantIcon = eventVariantIcons[ev.variant || EventVariant.INFO];

  return (
    <Group
      justify="center"
      align="center"
      bg={colorScheme === "dark" ? undefined : `${variantColor}.2`}
      w="100%"
      h="100%"
      style={{ borderRadius: "50%" }}
      flex={1}
    >
      <VariantIcon size={18} color={color(`${variantColor}.6`)} />
    </Group>
  );
}

function EventItemTitle(props: { event: EventEntity }) {
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

  if (event.type === EventType.TASK_PRIORITY_UPDATED && event.data) {
    const toPriority = event.data.toPriority;
    const fromPriority = event.data.fromPriority;

    if (!toPriority)
      return (
        <Group gap={4}>
          <Text fz={14}>{t(`unset_priority`)}</Text>

          <ThemeIcon size={14} radius={100} color="dark" variant="transparent">
            <IconX strokeWidth={1.5} size={14} />
          </ThemeIcon>

          <Group gap={0} ml={-4}>
            <ThemeIcon color={getTaskPriorityColor(fromPriority)} variant="transparent">
              <IconFlagFilled size={16} />
            </ThemeIcon>
            <Text fz={14}>{t(`task_priority_${fromPriority}`)}</Text>
          </Group>
        </Group>
      );

    return (
      <Group gap={4}>
        <Text fz={14}>{t(`set_priority`)}</Text>

        <ThemeIcon size={14} radius={100} color="dark" variant="transparent">
          <IconArrowRight strokeWidth={1.5} size={14} />
        </ThemeIcon>

        <Group gap={0} ml={-4}>
          <ThemeIcon color={getTaskPriorityColor(toPriority)} variant="transparent">
            <IconFlagFilled size={16} />
          </ThemeIcon>
          <Text fz={14}>{t(`task_priority_${toPriority}`)}</Text>
        </Group>
      </Group>
    );
  }

  if (
    event.type === EventType.TASK_STATUS_UPDATED &&
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
        <Text fz={14}>{t(`status_changed`)}</Text>

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
    event.type === EventType.TASK_ASSIGNED &&
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
          <Text fz={14}>{t(`assigned_to`)}</Text>

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
          <Text fz={14}>{t(`unassigned_from`)}</Text>

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
        <Text fz={14}>{t(`task_assigned`)}</Text>
      </Group>
    );
  }

  return (
    <Group>
      <Text fz={14}>{t(`event_type_${props.event.type}`)}</Text>
    </Group>
  );
}
