"use client";

import { ContentEditable } from "@/components/content-editable/content-editable";
import { emitInternalEvent, InternalEvent } from "@/hooks/use-internal-event";
import { AppEntity } from "@/types";
import { useLingui } from "@lingui/react/macro";
import { Skeleton, Stack } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDebouncedCallback } from "@mantine/hooks";
import dynamic from "next/dynamic";
import { FC } from "react";
import { TaskDataFragment } from "../../graphql/fragmentTask.graphql";
import { useUpdateTasks } from "../../hooks/use-update-tasks";

const Editor = dynamic(() => import("@/components/editor/editor").then((mod) => mod.Editor), {
  ssr: false,
  loading: () => <Skeleton miw="100%" h={58.8} />,
});

export interface TaskDetailFormProps {
  task: TaskDataFragment;
  onClose?: () => void;
}

export const TaskDetailForm: FC<TaskDetailFormProps> = ({ task }) => {
  const { t } = useLingui();
  const { updateTasks } = useUpdateTasks();

  const onValuesChange = useDebouncedCallback(
    async (values: Pick<TaskDataFragment, "name" | "description">) => {
      if (!values.name) return;

      const isDiff = JSON.stringify(task) !== JSON.stringify(values);
      if (!isDiff) return;

      await updateTasks({
        _id: task._id,
        name: values.name,
        description: values.description,
      });

      emitInternalEvent(InternalEvent.REFETCH_TASKS);
    },
    500
  );

  const form = useForm<Pick<TaskDataFragment, "name" | "description">>({
    initialValues: {
      name: task.name,
      description: task.description ?? "",
    },
    onValuesChange: (val) => onValuesChange(val),
  });

  return (
    <Stack gap={30} w="100%" pt="md">
      <ContentEditable
        fz={25}
        fw={500}
        placeholder={t`Enter task name`}
        value={form.values.name}
        onChange={(value) => form.setFieldValue("name", value)}
      />

      <Editor
        value={form.values.description}
        onChangeHTML={(v) => {
          form.setFieldValue("description", v ?? "");
        }}
        delay={300}
        placeholder={t`Task description`}
        uploadFileOptions={{
          maxWidthOrHeight: 1500,
          refs: [`${AppEntity.TASKS}:${task._id}`],
        }}
      />
    </Stack>
  );
};
