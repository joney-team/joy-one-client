import { useColor } from "@/modules/theme/use-color";
import { formatDuration } from "@/components/inputs/estimate-time-input";
import { num, t } from "@/modules/lang/lang-service";
import { useTask } from "@/modules/tasks/hooks/use-task";
import { getTaskProgress, renderTaskStatusStyle } from "@/modules/tasks/tasks-service";
import { DefaultTaskStatusId } from "@/modules/tasks/tasks-types";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { DateTimeUtils } from "@/utils/dateTime.utils";
import {
  ActionIcon,
  alpha,
  Box,
  em,
  getThemeColor,
  Group,
  Text,
  ThemeIcon,
  Tooltip,
  useMantineTheme,
} from "@mantine/core";
import { useMouse } from "@mantine/hooks";
import { IconGripVertical, IconHourglassHigh } from "@tabler/icons-react";
import dayjs from "dayjs";
import { FC, useEffect, useRef, useState } from "react";
import { ganttConfig } from "./gantt.config";
import { useGantt } from "./gantt.context";
import { useGanttTaskState } from "./gantt.hooks";
import { getRangeOfTasks } from "./gantt.utils";

interface GanttTaskRowBodyProps {
  id: string;
  index?: number;
}

export const GanttTaskRowBody: FC<GanttTaskRowBodyProps> = (props) => {
  const [task, ctx] = useTask(props.id);

  const workspace = useWorkspace();
  const theme = useMantineTheme();
  const gantt = useGantt();
  const state = useGanttTaskState(task);
  const mouse = useMouse();
  const color = useColor();

  const [isResizing, setIsResizing] = useState<"left" | "right" | undefined>(undefined);
  const [isDueDateHovered, setIsDueDateHovered] = useState(false);
  const [isMoving, setIsMoving] = useState(false);
  const [isEstimating, setIsEstimating] = useState(false);
  const [startEstimateAt, setStartEstimateAt] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const mouseX = useRef(0);

  const taskStatusStyled = renderTaskStatusStyle(task?.status, workspace?.settings?.taskStatuses);
  const selectorPosition = mouse.x - 25;

  useEffect(() => {
    mouseX.current = mouse.x - 25;
  }, [mouse.x]);

  const captureResize = () => {
    if (!isResizing) return;
    try {
      const selectedDate = gantt.dates[Math.floor(mouse.x / gantt.state.columnSize)];
      const rangeDate = DateTimeUtils.getStartEndOfDay(selectedDate);

      if (isResizing === "left") {
        ctx.onUpdate({
          ...task,
          startDate: DateTimeUtils.timeToSeconds(rangeDate.start),
        });
      }

      if (isResizing === "right") {
        ctx.onUpdate({
          ...task,
          dueDate: DateTimeUtils.timeToSeconds(rangeDate.end),
        });
      }
    } catch (error) {
      console.error(error);
    }

    setIsResizing(undefined);
  };

  const selectDueDate = (offset = 0) => {
    const x = (mouseX.current || 0) + offset;

    if (!gantt.contentBodyRef.current) return;
    const dateWidth = gantt.state.columnSize;

    const selectedDate = gantt.dates[Math.floor(x / dateWidth)];
    if (!selectedDate) return;
    const rangeDate = DateTimeUtils.getStartEndOfDay(selectedDate);

    const startDateInSecs = DateTimeUtils.timeToSeconds(rangeDate.start);
    const dueDateInSecs = DateTimeUtils.timeToSeconds(rangeDate.end);

    let startDate = task.startDate;
    let dueDate = task.dueDate;

    if (!task.startDate && !task.startDate) {
      startDate = startDateInSecs;
      dueDate = dueDateInSecs;
    } else if (task.startDate && task.dueDate) {
      const bwt = task.dueDate! - task.startDate!;
      startDate = dueDateInSecs - bwt;
      dueDate = dueDateInSecs;
    } else if (task.startDate) {
      if (task.startDate >= dueDateInSecs) {
        startDate = startDateInSecs;
        dueDate = dueDateInSecs;
      } else {
        dueDate = dueDateInSecs;
      }
    } else if (task.dueDate) {
      startDate = startDateInSecs;
      dueDate = dueDateInSecs;
    }

    ctx.onUpdate({ ...task, startDate, dueDate });
  };

  const onMoving = (distance = 0) => {
    setIsMoving(true);

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };

    const onMoveUp = () => {
      selectDueDate(distance);
      close();
    };

    const close = () => {
      setIsMoving(false);
      setStartEstimateAt(0);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("mouseup", onMoveUp);
    };

    window.addEventListener("keydown", onKeyDown, true);
    window.addEventListener("mouseup", onMoveUp);
  };

  const onStartEstimate = () => {
    const start = mouseX.current;
    setIsEstimating(true);
    setStartEstimateAt(start);

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };

    const onMoveUp = () => {
      setIsEstimating(false);
      const _start = Math.min(start, mouseX.current);
      const _end = Math.max(start, mouseX.current);

      const from = Math.floor(_start / gantt.state.columnSize);
      const to = Math.floor(_end / gantt.state.columnSize);

      let startDate = new Date(gantt.dates[from]);
      startDate.setHours(0, 0, 0, 0);

      let dueDate = new Date(gantt.dates[to]);
      dueDate.setHours(23, 59, 59, 999);

      ctx.onUpdate({
        ...task,
        startDate: DateTimeUtils.timeToSeconds(startDate),
        dueDate: DateTimeUtils.timeToSeconds(dueDate),
      });

      close();
    };

    const close = () => {
      setIsEstimating(false);
      setStartEstimateAt(0);
      window.removeEventListener("mouseup", onMoveUp);
      window.removeEventListener("keydown", onKeyDown);
    };

    window.addEventListener("mouseup", onMoveUp);
    window.addEventListener("keydown", onKeyDown);
  };

  if (!task) return null;

  return (
    <>
      <Group
        ref={mouse.ref}
        gap={0}
        w="100%"
        bg={isHovered ? `rgba(0,0,0,0.02)` : "transparent"}
        style={{
          position: "relative",
          maxHeight: ganttConfig.rowHeight,
          minHeight: ganttConfig.rowHeight,
        }}
        onMouseOver={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        py={10}
        onMouseUp={() => captureResize()}
      >
        {isHovered &&
          !isDueDateHovered &&
          !isResizing &&
          !state.isOutSideBody &&
          !isMoving &&
          gantt.scrollDirection !== "vertical" && (
            <>
              {(function () {
                if (!isEstimating) return null;
                const width = Math.abs(mouse.x - startEstimateAt);

                return (
                  <Box
                    w={width}
                    h="calc(100% - 30px)"
                    style={{
                      position: "absolute",
                      background: `${theme.colors["primary"][3]}`,
                      borderRadius: 20,
                      top: "50%",
                      transform: "translateY(-50%)",
                      left: mouse.x > startEstimateAt ? startEstimateAt : mouse.x,
                    }}
                  />
                );
              })()}

              <Tooltip
                tt="capitalize"
                label={t("dnd")}
                opened
                position={props.index === 0 ? "bottom" : "top"}
                openDelay={500}
                disabled={gantt.scrollDirection === "horizontal" || gantt.isScrolling}
              >
                <Box
                  w={30}
                  h="calc(100% - 18px)"
                  style={{
                    position: "absolute",
                    border: `2px solid ${theme.colors["primary"][5]}`,
                    borderRadius: 20,
                    top: "50%",
                    transform: "translateY(-50%) translateX(8px)",
                    left: selectorPosition,
                    cursor: "pointer",
                  }}
                  onMouseDown={onStartEstimate}
                  opacity={gantt.isScrolling ? 0 : 1}
                />
              </Tooltip>
            </>
          )}

        {/* Render sub task estimation */}
        {(function () {
          const isHasSubTasks = ctx.subTasks.length > 0;
          if (isHasSubTasks && !task.startDate && !task.dueDate && !isEstimating) {
            const progress = getTaskProgress(ctx.subTasks, gantt.statuses);

            const rangeDate = getRangeOfTasks(ctx.subTasks);
            const startIndex = gantt.dates.findIndex((v) => dayjs(v).isSame(rangeDate.startDate, "day"));
            const endIndex = gantt.dates.findIndex((v) => dayjs(v).isSame(rangeDate.dueDate, "day"));
            const left = startIndex * gantt.state.columnSize;

            const _width =
              startIndex === endIndex ? gantt.state.columnSize : (endIndex - startIndex + 1) * gantt.state.columnSize;

            const _color = color(progress.status.color || "gray");

            return (
              <Box
                w={_width}
                bg={alpha(_color, 0.5)}
                h="5px"
                style={{
                  position: "absolute",
                  borderRadius: 20,
                  top: "50%",
                  transform: "translateY(-50%)",
                  left,
                }}
              >
                <Text
                  fz={em(8)}
                  fw={600}
                  style={{
                    position: "absolute",
                    top: "-13px",
                    left: 5,
                  }}
                  c="gray"
                  w="max-content"
                >
                  {`${num(progress.percent, { roundPrecision: 1 })}%`} - {task.name}
                </Text>

                <Box
                  style={{ position: "relative", width: "100%", height: "100%", borderRadius: 100, overflow: "hidden" }}
                >
                  <Box w={`${progress.percent}%`} h="100%" style={{ position: "absolute", top: 0, left: 0 }} />
                </Box>
              </Box>
            );
          }

          return null;
        })()}

        {/* Render Estimation */}
        {(function () {
          if (!task.startDate || !task.dueDate || isEstimating) return null;

          const startIndex = gantt.dates.findIndex((v) => dayjs(v).isSame(new Date(task.startDate! * 1000), "day"));
          const endIndex = gantt.dates.findIndex((v) => dayjs(v).isSame(new Date(task.dueDate! * 1000), "day"));

          const left = startIndex * gantt.state.columnSize;
          const right = Math.abs((gantt.dates.length - endIndex - 1) * gantt.state.columnSize);

          const _width =
            startIndex === endIndex ? gantt.state.columnSize : (endIndex - startIndex + 1) * gantt.state.columnSize;

          const width =
            isResizing === "right"
              ? mouse.x - left
              : isResizing === "left"
              ? mouse.ref.current!.offsetWidth - right - mouse.x
              : _width;

          const bgColor = color(
            task.status === DefaultTaskStatusId.CLOSED || gantt.state.displayTaskStatusColor
              ? taskStatusStyled.color
              : "primary.2"
          );

          return (
            <>
              {/* <Box
              bg="pink"
              w={10}
              h={10}
              style={{
                position: 'absolute',
                borderRadius: 20,
                top: '50%',
                transform: 'translate(-5px, -50%)',
                left: mouse.x,
                zIndex: 10,
              }}
            /> */}

              {/* <Box
              bg="green"
              w={30}
              h={30}
              style={{
                position: 'absolute',
                borderRadius: 20,
                top: '50%',
                transform: 'translate(15px, -50%)',
                right: right,
                zIndex: 10,
              }}
              fz={8}
              fw={600}
            /> */}

              {/* <Box
              bg="blue"
              w={10}
              h={10}
              style={{
                position: 'absolute',
                borderRadius: 20,
                top: '50%',
                transform: 'translate(-5px, -50%)',
                left: left,
                zIndex: 10,
              }}
            /> */}

              <Box
                w={width}
                h="calc(100% - 18px)"
                style={{
                  position: "absolute",
                  borderRadius: 20,
                  top: "50%",
                  backgroundColor: alpha(getThemeColor(bgColor, theme), 0.6),
                  transform: "translateY(-50%)",
                  ...(isMoving
                    ? {
                        left: selectorPosition - width / 4,
                      }
                    : {
                        left: isResizing === "right" || !isResizing ? left : undefined,
                        right: isResizing === "left" ? right : undefined,
                      }),
                }}
                onMouseOver={() => setIsDueDateHovered(true)}
                onMouseLeave={() => setIsDueDateHovered(false)}
              >
                {(isDueDateHovered || !!isResizing) && (
                  <Group w="100%" h="100%" align="center" wrap="nowrap" gap={0}>
                    <ActionIcon
                      color="white"
                      variant="transparent"
                      opacity={0.8}
                      style={{ cursor: "w-resize" }}
                      onMouseDown={() => setIsResizing("left")}
                    >
                      <IconGripVertical color="white" size={16} />
                    </ActionIcon>

                    <Group
                      h="100%"
                      flex={1}
                      style={{ cursor: isMoving ? "grabbing" : "grab" }}
                      onMouseDown={() => {
                        const totalWidth = gantt.dates.length * gantt.state.columnSize;
                        const distanceFromPointerToRight = totalWidth - mouse.x - right;
                        onMoving(distanceFromPointerToRight);
                      }}
                    />

                    <ActionIcon
                      color="white"
                      variant="transparent"
                      opacity={0.8}
                      style={{ cursor: "e-resize" }}
                      onMouseDown={() => setIsResizing("right")}
                    >
                      <IconGripVertical color="white" size={16} />
                    </ActionIcon>
                  </Group>
                )}
              </Box>

              {!isHovered && !isMoving && !isResizing && (
                <Box
                  style={{
                    position: "absolute",
                    borderRadius: 20,
                    top: "50%",
                    transform: "translateY(-50%)",
                    left: left + width + 10,
                  }}
                  c="gray"
                >
                  <Text fz={em(12)} fw={500}>
                    {task.name}
                  </Text>
                </Box>
              )}
            </>
          );
        })()}

        {/* Render estimate time */}
        {(function () {
          if (!!gantt.state.isHideEstimateTime) return null;

          const totalSubTasksTime = ctx.subTasks.reduce((acc, task) => acc + (task.estimatedTime || 0), 0);
          const totalEstimateTime = (task.estimatedTime || 0) + totalSubTasksTime;
          if (totalEstimateTime === 0) return null;

          return (
            <Group px={8} pos="sticky" top={0} left={0}>
              <Group gap={0} bg="#e9ecefa6" px={3} style={{ borderRadius: 100 }}>
                <ThemeIcon variant="transparent" color="gray" size="xs">
                  <IconHourglassHigh size={11} />
                </ThemeIcon>

                <Text fz={10} fw={600} c="gray" pr={5}>
                  {(function () {
                    if (totalSubTasksTime > 0) {
                      if ((task.estimatedTime || 0) === 0) {
                        return `${formatDuration(totalSubTasksTime)}`;
                      }

                      return `${formatDuration(task.estimatedTime || 0)} + ${formatDuration(
                        totalSubTasksTime
                      )} = ${formatDuration(totalEstimateTime)}`;
                    }
                    return formatDuration(task.estimatedTime || 0);
                  })()}
                </Text>
              </Group>
            </Group>
          );
        })()}
      </Group>

      {state.isShowSubTasks && ctx.subTasks.length > 0 && (
        <>
          {ctx.subTasks
            .sort((a, b) => a.order - b.order)
            .map((task) => (
              <GanttTaskRowBody key={task._id} id={task._id} />
            ))}
        </>
      )}
    </>
  );
};
