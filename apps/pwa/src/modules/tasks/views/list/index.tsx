"use client";

import { tl } from "@/modules/lang/lang-service";
import { useTasks } from "@/modules/tasks/tasks-context";
import { DefaultTaskStatusId } from "@/modules/tasks/tasks-types";
import { Box, Card, em, Stack, Title } from "@mantine/core";
import { FC, Fragment, memo, PropsWithChildren } from "react";
import { TaskMenuActions } from "../../components/tasks-menu-actions";
import { ListTaskGroupByFolder } from "./list.task-group-by-folder";
import { ListTaskGroupByStatuses } from "./list.task-group-by-statuses";
import { TasksDndProvider } from "../../tasks-dnd-provider";

export const TasksListView: FC<PropsWithChildren> = memo((props) => {
  const { state, tagFolder, statuses, tagFolders } = useTasks();

  return (
    <TasksDndProvider>
      <Stack p={16}>
        <TaskMenuActions />

        {(function () {
          if (tagFolder) {
            return (
              <Fragment>
                <ListTaskGroupByStatuses
                  key={tagFolder._id}
                  status={DefaultTaskStatusId.TODO}
                  tagFolderId={tagFolder._id}
                />

                {statuses
                  .filter((v) => !v.isDefault)
                  .map((status) => (
                    <ListTaskGroupByStatuses
                      key={tagFolder._id + status.id}
                      status={status.id}
                      hideWhenEmpty
                      tagFolderId={tagFolder._id}
                    />
                  ))}

                {state.showClosed && (
                  <ListTaskGroupByStatuses
                    key={tagFolder?._id + DefaultTaskStatusId.CLOSED}
                    status={DefaultTaskStatusId.CLOSED}
                    showEmptyMsg
                    tagFolderId={tagFolder?._id}
                  />
                )}
              </Fragment>
            );
          }

          if (tagFolders.length === 0) {
            return <ListTaskGroupByFolder pure />;
          }

          return (
            <Fragment>
              <Card withBorder shadow="none" style={{ position: "relative" }}>
                <Box
                  w={2}
                  h="100%"
                  bg="dark"
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                  }}
                />
                <Stack gap={16}>
                  <Title fz={em(15)} fw={600}>
                    {tl("general_tasks")}
                  </Title>
                  <ListTaskGroupByFolder pure />
                </Stack>
              </Card>

              {tagFolders.map((tagFolder) => (
                <ListTaskGroupByFolder key={tagFolder._id} tagFolder={tagFolder} />
              ))}
            </Fragment>
          );
        })()}

        {props.children}
      </Stack>
    </TasksDndProvider>
  );
});
