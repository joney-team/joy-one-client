import { Button } from "@/components/buttons/button";
import { Renderer } from "@/components/renderer";
import { useLayout } from "@/layout/layout-context";
import { OnTaskSatusesModal } from "@/modules/tasks/task-status-modal";
import { t } from "@/modules/lang/lang-service";
import { useTasks } from "@/modules/tasks/tasks-context";
import { DefaultTaskStatusId } from "@/modules/tasks/tasks-types";
import { WorkspacePermission } from "@/modules/workspace-roles/workspace-roles-types";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { Card, Group, ScrollArea, Space, Stack } from "@mantine/core";
import { useElementSize } from "@mantine/hooks";
import { IconPlus } from "@tabler/icons-react";
import { FC, PropsWithChildren, useEffect, useState } from "react";
import { TaskMenuActions } from "../../components/tasks-menu-actions";
import { BoardTaskGroupByStatuses } from "./board.task-group-by-statuses";
import { viewBoardConfig } from "./config";
import { TasksDndProvider } from "../../tasks-dnd-provider";

export const TasksBoardView: FC<PropsWithChildren> = (props) => {
  const workspace = useWorkspace();
  const layout = useLayout();
  const tasks = useTasks();

  const container = useElementSize();
  const [height, setHeight] = useState(0);

  const resize = () => {
    if (container.ref.current) {
      const rect = container.ref.current!.getBoundingClientRect();
      const vHeight = document.documentElement.clientHeight;
      const height = vHeight - rect.top - (layout.view === "mobile" ? (layout.isStandalone ? 80 : 65) : 20);
      setHeight(height);
    }
  };

  useEffect(() => {
    resize();
  }, [container.width, container.height]);

  const dynamicStatuses = workspace.settings.taskStatuses.filter((v) => !v.isDefault);

  return (
    <TasksDndProvider>
      {layout.view !== "mobile" ? (
        <Group p={16}>
          <TaskMenuActions />
        </Group>
      ) : (
        <Space h={16} />
      )}

      <Stack gap={0} flex={1} style={{ position: "relative" }} ref={container.ref} w="100%">
        <ScrollArea
          h={height}
          type="auto"
          scrollbarSize={layout.view === "desktop" ? 5 : 25}
          scrollbars="x"
          styles={{
            thumb: {
              backgroundColor: "#00000015",
            },
          }}
        >
          <Group
            wrap="nowrap"
            w="max-content"
            align="start"
            h={height - (layout.view !== "desktop" ? 16 : 0)}
            pr={16}
            pl={16}
          >
            <BoardTaskGroupByStatuses statusId={DefaultTaskStatusId.TODO} />

            {dynamicStatuses.map((status) => (
              <BoardTaskGroupByStatuses key={status.id} statusId={status.id} />
            ))}

            <Renderer visible={workspace.hasPermission(WorkspacePermission.WORKSPACE_SETTINGS)}>
              <Card
                w={viewBoardConfig.colWidth}
                withBorder
                shadow="none"
                p={10}
                style={{
                  background: "transparent",
                  border: "1px dashed rgba(0, 0, 0, 0.1)",
                }}
              >
                <Group>
                  <Button
                    variant="light"
                    color="gray"
                    size="xs"
                    leftIcon={IconPlus}
                    iconSize={16}
                    fz={12}
                    onClick={() => OnTaskSatusesModal()}
                  >
                    {`${t("add")} ${t("status")}`}
                  </Button>
                </Group>
              </Card>
            </Renderer>

            {tasks.state.showClosed && <BoardTaskGroupByStatuses statusId={DefaultTaskStatusId.CLOSED} />}
          </Group>
        </ScrollArea>
      </Stack>
      {props.children}
    </TasksDndProvider>
  );
};
