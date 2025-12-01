import { TaskEntity } from "@/modules/tasks/tasks-types";
import { useGantt } from "./gantt-tasks-context";
import { GanttTaskState } from "./gantt-tasks-types";

export const useGanttTaskState = (task: TaskEntity): GanttTaskState => {
  const gantt = useGantt();
  const state = (gantt.tasksState || {})[task?._id] || {};
  return {
    hovered: state && state.hovered,
    isShowSubTasks:
      state && typeof state.isShowSubTasks === "boolean" ? state.isShowSubTasks : true,
    isOutSideBody: state && typeof state.isOutSideBody === "boolean" ? state.isOutSideBody : false,
  };
};
