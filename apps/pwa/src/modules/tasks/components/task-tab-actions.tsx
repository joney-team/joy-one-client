"use client";

import { Avatar } from "@/components/avatar";
import { Button } from "@/components/buttons/button";
import { WithClearable } from "@/components/with-clearable/with-clearable";
import { type ModalCreateTaskRef } from "@/modules/tasks/modals/modal-create-task";
import GetWorkspaceMembersDocument from "@/modules/workspace-members/graphql/getWorkspaceMembers.graphql";
import { nonLoading } from "@/utils/non-loading";
import { useQuery } from "@apollo/client/react";
import { Trans, useLingui } from "@lingui/react/macro";
import { Group } from "@mantine/core";
import { IconChecks, IconEdit, IconFlag, IconFlagFilled, IconUsers } from "@tabler/icons-react";
import dynamic from "next/dynamic";
import { useEffect, useRef, type FC } from "react";
import { useFolderStatuses } from "../hooks/use-task-statuses";
import { taskPriorities } from "../tasks-constants";
import { useTasks } from "../tasks-context";
import { useTaskMenu } from "./task-menu/task-menu";
import { TaskMenuAction } from "./task-menu/task-menu-types";

const ModalCreateTask = dynamic(
  () => import("@/modules/tasks/modals/modal-create-task").then((mod) => mod.ModalCreateTask),
  {
    ssr: false,
    loading: nonLoading,
  },
);

export const TaskTabActions: FC = () => {
  const { t } = useLingui();
  const { activatedFolder, setState, state } = useTasks();
  const modalCreateTaskRef = useRef<ModalCreateTaskRef>(null);
  const { statuses } = useFolderStatuses(activatedFolder?._id);

  const workspaceMembers = useQuery(GetWorkspaceMembersDocument, {
    skip: !state.variables?.assigneeUserIds || state.variables?.assigneeUserIds.length === 0,
    variables: {
      userId: state.variables?.assigneeUserIds ?? [],
    },
  });

  const menuTask = useTaskMenu({
    task: {
      _id: "filter-tasks",
      statuses: [...statuses.inprogress, ...statuses.closed],
      assigneeUsers: workspaceMembers.data?.list?.results,
    },
    options: {
      offset: {
        y: 5,
      },
    },
    groupVariables: null,
    updateTask: async (e) => {
      if ("priority" in e) {
        setState((s) => ({ ...s, variables: { ...s.variables, priority: e.priority } }));
      }

      if ("assigneeUsers" in e) {
        setState((s) => {
          return {
            ...s,
            variables: {
              ...s.variables,
              assigneeUserIds:
                e.assigneeUsers && e.assigneeUsers.length > 0
                  ? e.assigneeUsers?.map((user) => user.userId)
                  : null,
            },
          };
        });
      }

      if ("priority" in e) {
        setState((s) => ({ ...s, variables: { ...s.variables, priority: e.priority } }));
      }
    },
  });

  useEffect(() => {
    return () => {
      menuTask.close();
    };
  }, []);

  return (
    <Group justify="end" wrap="nowrap" flex={1} px="md" gap={5}>
      <WithClearable
        enabled={!!state.variables?.assigneeUserIds && state.variables?.assigneeUserIds.length > 0}
        onClear={() =>
          setState((s) => ({ ...s, variables: { ...s.variables, assigneeUserIds: null } }))
        }
      >
        <Button
          variant="outline"
          color={(state.variables?.assigneeUserIds ?? []).length > 0 ? "primary" : "gray"}
          h={28}
          px={8}
          component="div"
          leftIcon={IconUsers}
          onClick={(e) => {
            menuTask.open({ action: TaskMenuAction.CHANGE_ASSIGNEE, target: e.currentTarget });
          }}
        >
          {workspaceMembers.data?.list && workspaceMembers.data.list.results.length > 0 ? (
            <Group gap={3}>
              {workspaceMembers.data.list.results.map((member) => (
                <Avatar key={member._id} user={member} size={20} />
              ))}
            </Group>
          ) : (
            <Trans>Assignees</Trans>
          )}
        </Button>
      </WithClearable>

      <WithClearable
        enabled={!!state.variables?.priority}
        onClear={() => setState((s) => ({ ...s, variables: { ...s.variables, priority: null } }))}
      >
        <Button
          variant="outline"
          color={
            state.variables?.priority ? taskPriorities[state.variables.priority]?.color : "gray"
          }
          h={28}
          px={8}
          leftIcon={state.variables?.priority ? IconFlagFilled : IconFlag}
          component="div"
          onClick={(e) => {
            menuTask.open({ action: TaskMenuAction.CHANGE_PRIORITY, target: e.currentTarget });
          }}
        >
          {state.variables?.priority ? (
            t(taskPriorities[state.variables.priority]?.label)
          ) : (
            <Trans>Priority</Trans>
          )}
        </Button>
      </WithClearable>

      <Button
        variant="outline"
        color={state.showClosed ? "primary" : "gray"}
        h={28}
        px={8}
        component="div"
        leftIcon={IconChecks}
        onClick={() => setState((s) => ({ ...s, showClosed: !Boolean(s.showClosed) }))}
      >
        {state.showClosed ? <Trans>Hide closed</Trans> : <Trans>Show closed</Trans>}
      </Button>

      <Button
        h={28}
        component="div"
        onClick={() => modalCreateTaskRef.current?.open({ initial: { folder: activatedFolder } })}
        leftIcon={IconEdit}
      >
        <Trans>Create task</Trans>
      </Button>

      <ModalCreateTask ref={modalCreateTaskRef} />
    </Group>
  );
};
