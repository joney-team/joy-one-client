import { ProgressCircle } from "@/components/progress-circle";
import { TaskStatusOptions } from "@/modules/tasks/components/task-status-options";
import { bulkUpdateTasks, getTaskEntity, renderTaskStatus } from "@/modules/tasks/tasks-service";
import { TaskEntity } from "@/modules/tasks/tasks-types";
import { useColor } from "@/modules/theme/use-color";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { Group } from "@mantine/core";
import { type FC } from "react";

export interface ListTaskStatusProps {
  task: Pick<TaskEntity, "_id" | "status">;
}

export const ListTaskStatus: FC<ListTaskStatusProps> = (props) => {
  const workspace = useWorkspace();
  const status = renderTaskStatus(props.task.status, workspace.settings.taskStatuses);
  const color = useColor();

  return (
    <TaskStatusOptions
      target={
        <Group>
          <ProgressCircle percent={status.progress * 100} color={color(status.color)} />
        </Group>
      }
      task={props.task}
      onSelect={(status) => {
        const taskEntity = getTaskEntity(props.task._id);
        if (!taskEntity) return;

        bulkUpdateTasks([{ ...taskEntity, status }]);
      }}
    />
  );
};
