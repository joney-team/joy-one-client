"use client";

import { DateFormat } from "@/components/format/date-format";
import { useWorkspaceLayout } from "@/layout/hooks/use-workspace-layout";
import { useLayout } from "@/layout/layout-context";
import { getClientLocale } from "@/modules/lang/lang-service";
import { AppLocale } from "@/modules/lang/lang-types";
import { OnModalTagForm } from "@/modules/tags/modals/modal-tag-form";
import { TagType } from "@/modules/tags/tags-types";
import { QuickCreateTaskInput } from "@/modules/tasks/components/quick-create-task-input";
import { useColor } from "@/modules/theme/use-color";
import { DateTime } from "@joy-one-client/utils/date-time";
import { Trans } from "@lingui/react/macro";
import {
  ActionIcon,
  em,
  getThemeColor,
  Group,
  rgba,
  Stack,
  Text,
  Tooltip,
  useMantineTheme,
} from "@mantine/core";
import { useForceUpdate } from "@mantine/hooks";
import {
  IconCalendarDown,
  IconDroplet,
  IconDropletFilled,
  IconFolderPlus,
  IconHourglassHigh,
  IconHourglassOff,
  IconPlus,
} from "@tabler/icons-react";
import { FC, Fragment, PropsWithChildren, useEffect } from "react";
import { ganttConfig } from "./gantt-tasks-config";
import { useGantt } from "./gantt-tasks-context";
import { getWeeksFromRange } from "./gantt-tasks-utils";

export const SidebarHead: FC = () => {
  const forceUpdate = useForceUpdate();
  const gantt = useGantt();
  const workspaceLayout = useWorkspaceLayout();

  useEffect(() => {
    setTimeout(forceUpdate, 100);
  }, [gantt.state.dividerPosition]);

  return (
    <Group
      px={8}
      justify="space-between"
      bg="var(--mantine-color-body)"
      h="100%"
      style={{
        position: "sticky",
        top: 0,
        left: 0,
        zIndex: 10,
        maxWidth: gantt.sidebarRef.current?.getBoundingClientRect().width,
        transition: "max-width 0.3s ease-in-out",
        minHeight: ganttConfig.headHeight,
        maxHeight: ganttConfig.headHeight,
        borderBottom: `1px solid ${workspaceLayout.dividerColor}`,
      }}
    >
      <Text fz={em(13)}>
        <Trans>Name</Trans>
      </Text>

      <Group gap={5}>
        <Tooltip
          label={
            gantt.state.isHideEstimateTime ? (
              <Trans>Show estimate time</Trans>
            ) : (
              <Trans>Hide estimate time</Trans>
            )
          }
        >
          <ActionIcon
            variant="subtle"
            size="sm"
            color={gantt.state.isHideEstimateTime ? "gray" : "gray"}
            onClick={() => {
              gantt.setState({
                ...gantt.state,
                isHideEstimateTime: !gantt.state.isHideEstimateTime,
              });
            }}
          >
            {gantt.state.isHideEstimateTime ? (
              <IconHourglassOff size={16} />
            ) : (
              <IconHourglassHigh size={16} />
            )}
          </ActionIcon>
        </Tooltip>

        <Tooltip label={<Trans>Show task color by status</Trans>}>
          <ActionIcon
            variant="subtle"
            size="sm"
            color={gantt.state.displayTaskStatusColor ? "primary" : "gray"}
            onClick={() => {
              gantt.toggleSisplayTaskStatusColor();
            }}
          >
            {gantt.state.displayTaskStatusColor ? (
              <IconDropletFilled size={16} />
            ) : (
              <IconDroplet size={16} />
            )}
          </ActionIcon>
        </Tooltip>

        <Tooltip label={<Trans>Scroll to today</Trans>}>
          <ActionIcon
            variant="subtle"
            size="sm"
            color="gray"
            onClick={() => {
              gantt.scrollToDate({ date: new Date(), behavior: "smooth" });
            }}
          >
            <IconCalendarDown size={16} />
          </ActionIcon>
        </Tooltip>

        <Tooltip label={<Trans>Create folder</Trans>}>
          <ActionIcon
            variant="subtle"
            size="sm"
            color="gray"
            onClick={() => OnModalTagForm({ type: TagType.TASK_FOLDER })}
          >
            <IconFolderPlus size={16} />
          </ActionIcon>
        </Tooltip>

        <Tooltip label={<Trans>Create task</Trans>}>
          <QuickCreateTaskInput>
            <ActionIcon component="div" variant="subtle" size="sm" color="gray">
              <IconPlus size={16} />
            </ActionIcon>
          </QuickCreateTaskInput>
        </Tooltip>
      </Group>
    </Group>
  );
};

export const BodyHead: FC = () => {
  const gantt = useGantt();
  const layout = useLayout();
  const workspaceLayout = useWorkspaceLayout();
  const weeks = getWeeksFromRange(
    gantt.state.fromDate,
    gantt.state.toDate,
    getClientLocale() === AppLocale.VI
  );

  return (
    <Stack
      w="max-content"
      bg="var(--mantine-color-body)"
      gap={0}
      style={{
        gap: 0,
        position: "sticky",
        top: 0,
        left: 0,
        zIndex: 10,
        minHeight: ganttConfig.headHeight,
        maxHeight: ganttConfig.headHeight,
        borderBottom: `1px solid ${workspaceLayout.dividerColor}`,
      }}
    >
      <Group
        flex={1}
        gap={0}
        w="max-content"
        wrap="nowrap"
        style={{ borderBottom: `1px solid ${workspaceLayout.dividerColor}` }}
      >
        {weeks.map((week, index) => {
          const first = index === 0;

          return (
            <Group
              key={index}
              w={`${gantt.state.columnSize * week.dates.length}px`}
              maw={`${gantt.state.columnSize * week.dates.length}px`}
              style={{
                borderLeft: first ? undefined : `1px solid ${workspaceLayout.dividerColor}`,
              }}
              h="100%"
              justify="center"
              px={10}
              gap={5}
              wrap="nowrap"
            >
              {week.dates.length > 4 && (
                <Text tt="capitalize" ta="center" fz={em(9)} fw={700}>
                  {(function () {
                    const isSameMonth = DateTime.isSame(week.from, week.to, "month");
                    if (isSameMonth) {
                      return (
                        <Fragment>
                          <DateFormat value={week.from} type="custom" format={{ day: "2-digit" }} />
                          {" - "}
                          <DateFormat
                            value={week.to}
                            type="custom"
                            format={{ day: "2-digit", month: "long" }}
                          />
                        </Fragment>
                      );
                    }

                    return (
                      <Fragment>
                        <DateFormat
                          value={week.from}
                          type="custom"
                          format={{ day: "2-digit", month: "short" }}
                        />
                        {" - "}
                        <DateFormat
                          value={week.to}
                          type="custom"
                          format={{ day: "2-digit", month: "short" }}
                        />
                      </Fragment>
                    );
                  })()}
                </Text>
              )}

              <Text tt="capitalize" ta="center" fz={em(10)} fw={700}>
                <DateFormat value={week.from} type="custom" format={{ year: "numeric" }} />
              </Text>
            </Group>
          );
        })}
      </Group>

      <Group flex={1} gap={0} w="max-content" wrap="nowrap">
        {gantt.dates.map((date, index) => {
          const first = index === 0;

          return (
            <Group
              key={index}
              w={gantt.state.columnSize}
              style={{
                borderLeft: first ? undefined : `1px solid ${workspaceLayout.dividerColor}`,
              }}
              h="100%"
              justify="center"
            >
              <Text ta="center" fz={em(10)}>
                <DateFormat
                  value={date}
                  type="custom"
                  format={{ weekday: "narrow", day: "2-digit", month: "2-digit" }}
                />
              </Text>
            </Group>
          );
        })}
      </Group>
    </Stack>
  );
};

export const GridColumns: FC = () => {
  const gantt = useGantt();
  const layout = useLayout();
  const theme = useMantineTheme();
  const workspaceLayout = useWorkspaceLayout();
  const color = useColor();

  return (
    <Group
      className="GanttBodyGridColumns"
      w="max-content"
      h="100%"
      gap={0}
      style={{
        position: "absolute",
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
      }}
    >
      {gantt.dates.map((date, index) => {
        const id = `column-${new Date(date).getTime()}`;
        const first = index === 0;
        const isToday = DateTime.isSame(date, new Date(), "day");
        const day = DateTime.normalizeDate(date).getDay();
        const isWeekend = day === 0 || day === 6;

        return (
          <Stack
            id={id}
            key={index}
            style={{
              width: gantt.state.columnSize,
              borderLeft: first
                ? undefined
                : `${isToday ? 2 : 1}px solid ${
                    isToday
                      ? getThemeColor(color("primary.3"), theme)
                      : workspaceLayout.dividerColor
                  }`,
              position: "relative",
            }}
            h="100%"
            justify="start"
            bg={isWeekend ? "var(--mantine-color-default-hover)" : undefined}
          />
        );
      })}
    </Group>
  );
};

export const SidebarRowSticky: FC<PropsWithChildren & { visible?: boolean }> = (props) => {
  return (
    <Group
      gap={3}
      pr={8}
      pl={35}
      opacity={typeof props.visible === "boolean" ? (props.visible ? 1 : 0) : 1}
      style={{
        position: "sticky",
        top: 0,
        right: 0,
        background: `linear-gradient(to right, ${rgba("var(--mantine-color-body)", 0)}, ${rgba(
          "var(--mantine-color-body)",
          1
        )}, ${rgba("var(--mantine-color-body)", 1)}, ${rgba(
          "var(--mantine-color-body)",
          1
        )}, ${rgba("var(--mantine-color-body)", 1)}, ${rgba("var(--mantine-color-body)", 1)})`,
      }}
    >
      {props.children}
    </Group>
  );
};
