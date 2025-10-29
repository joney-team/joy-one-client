"use client";

import { NumberFormat } from "@/components/format/number-format";
import { configs } from "@/configs/layout.config";
import { tasksEmitter, updateTasks } from "@/modules/tasks/tasks-service";
import { TaskHistory } from "@/modules/tasks/tasks-types";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { Trans } from "@lingui/react/macro";
import { Button, Group, Stack, Text } from "@mantine/core";
import { useForceUpdate } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { FC, PropsWithChildren, useEffect, useRef, useState } from "react";
import { v4 as uuid } from "uuid";
import { Context } from "./task-history-context";

const TaskHistoriesProvider: FC<PropsWithChildren> = (props) => {
  const workspace = useWorkspace();
  const forceUpdate = useForceUpdate();

  const [pointedHistoryId, setPointedHistoryId] = useState<string | null>(null);
  const histories = useRef<TaskHistory[]>([]);

  const switchHistory = (id: string, position: "prev" | "next") => {
    const _history = histories.current.find((v) => v.id === id);
    if (!_history) return;

    if (position === "prev" && _history.prevTasks) updateTasks(_history.prevTasks, false);
    if (position === "next" && _history.tasks) updateTasks(_history.tasks, false);
    setPointedHistoryId(id);
  };

  const onModalRedoArchive = (_history: TaskHistory) => {
    const id = notifications.show({
      id: "modal-undo-archive",
      position: "bottom-right",
      autoClose: 5000,
      message: (
        <Stack gap={5}>
          <Text fz={13}>
            <Trans>
              You have deleted <NumberFormat value={_history.tasks.length} /> tasks. Do you want to
              undo?
            </Trans>
          </Text>
          <Group>
            <Button
              color="dark"
              size="xs"
              onClick={() => {
                switchHistory(_history.id, "prev");
                notifications.hide(id);
              }}
            >
              <Trans>Undo</Trans>
            </Button>
          </Group>
        </Stack>
      ),
      color: "dark",
    });
  };

  useEffect(() => {
    const onHistory = (history: TaskHistory) => {
      let _histories: TaskHistory[] = [...histories.current];

      // Remove history from index of pointedHistoryId to the end
      if (pointedHistoryId) {
        const index = _histories.findIndex((v) => v.id === pointedHistoryId);
        if (index !== -1) _histories = _histories.slice(0, index);
      }

      if (_histories.length === 0 && history.prevTasks) {
        _histories.push({
          id: uuid(),
          type: "UPDATE",
          tasks: history.prevTasks,
          prevTasks: history.prevTasks,
        });
      }

      _histories.push(history);

      if (_histories.length > configs.maxHistoryOfTasks) {
        _histories = _histories.slice(0, configs.maxHistoryOfTasks);
      }

      histories.current = _histories;

      setPointedHistoryId(history.id);
      forceUpdate();

      if (history.type === "ARCHIVE") {
        onModalRedoArchive(history);
      }
    };

    tasksEmitter.addListener("history", onHistory);

    return () => {
      tasksEmitter.removeListener("history", onHistory);
    };
  }, [pointedHistoryId]);

  useEffect(() => {
    histories.current = [];
    forceUpdate();
  }, [workspace.userMember?.workspaceId]);

  return (
    <Context.Provider
      value={{
        pointedHistoryId,
        switchHistory,
        histories: histories.current,
      }}
    >
      {props.children}
    </Context.Provider>
  );
};

export default TaskHistoriesProvider;
