"use client";

import { onActionLoad } from "@/utils/actions";
import { useMutation } from "@apollo/client/react";
import { Trans, useLingui } from "@lingui/react/macro";
import { ActionIcon, Group, Popover, TextInput } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { FC, PropsWithChildren, useState } from "react";
import CREATE_TASK_MUTATION from "../graphql/mutationCreateTask.graphql";

interface QuickCreateTaskInputProps {
  folderId?: string | null;
  parentId?: string | null;
}

export const QuickCreateTaskInput: FC<PropsWithChildren<QuickCreateTaskInputProps>> = (props) => {
  const [opened, setOpened] = useState(false);
  const { t } = useLingui();

  const [createTask] = useMutation(CREATE_TASK_MUTATION);

  const children = props.children ? (
    <Group onClick={() => setOpened((s) => !s)}>{props.children}</Group>
  ) : (
    <ActionIcon onClick={() => setOpened((s) => !s)}>
      <IconPlus size={16} strokeWidth={1.5} />
    </ActionIcon>
  );

  const label = props.parentId ? <Trans>Create subtask</Trans> : <Trans>Create task</Trans>;

  return (
    <Popover shadow="md" opened={opened} onChange={setOpened}>
      <Popover.Target>{children}</Popover.Target>

      <Popover.Dropdown p={10}>
        <TextInput
          label={label}
          placeholder={t`Enter task name`}
          autoFocus
          onKeyUp={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              e.stopPropagation();
              const value = (e.target as any).value;
              onActionLoad({
                name: <Trans>Create task</Trans>,
                process: () =>
                  createTask({
                    variables: {
                      input: {
                        name: value,
                        folderId: props.folderId,
                        parentId: props.parentId,
                      },
                    },
                  }),
              });
              setOpened(false);
            }
          }}
        />
      </Popover.Dropdown>
    </Popover>
  );
};
