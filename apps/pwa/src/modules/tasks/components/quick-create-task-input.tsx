"use client";

import { createTask } from "@/modules/tasks/tasks-service";
import { onActionLoad } from "@/utils/actions";
import { t } from "@lingui/core/macro";
import { ActionIcon, Group, Popover, TextInput } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { FC, PropsWithChildren, useState } from "react";

interface QuickCreateTaskInputProps {
  folderId?: string | null;
  parentId?: string | null;
}

export const QuickCreateTaskInput: FC<PropsWithChildren<QuickCreateTaskInputProps>> = (props) => {
  const [opened, setOpened] = useState(false);

  const children = props.children ? (
    <Group onClick={() => setOpened((s) => !s)}>{props.children}</Group>
  ) : (
    <ActionIcon onClick={() => setOpened((s) => !s)}>
      <IconPlus size={16} strokeWidth={1.5} />
    </ActionIcon>
  );

  const label = props.parentId ? t`Create subtask` : t`Create task`;

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
                name: t`Create task`,
                process: () =>
                  createTask({
                    name: value,
                    folderId: props.folderId,
                    parentId: props.parentId,
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
