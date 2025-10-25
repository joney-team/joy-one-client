"use client";

import { tl, tMulti } from "@/modules/lang/lang-service";
import { createTask } from "@/modules/tasks/tasks-service";
import { onActionLoad } from "@/utils/actions";
import { ActionIcon, Group, Popover, TextInput } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { FC, PropsWithChildren, useState } from "react";

interface QuickCreateTaskInputProps {
  tagFolderId?: string;
  parentId?: string;
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

  const label = props.parentId ? tl("create_sub_task") : tMulti(["create"], ["task"]);

  return (
    <Popover shadow="md" opened={opened} onChange={setOpened}>
      <Popover.Target>{children}</Popover.Target>

      <Popover.Dropdown p={10}>
        <TextInput
          label={label}
          placeholder={tl("enter_task_name")}
          autoFocus
          onKeyUp={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              e.stopPropagation();
              const value = (e.target as any).value;
              onActionLoad({
                name: tMulti(["create"], ["task"]),
                process: () =>
                  createTask({
                    name: value,
                    tagFolderId: props.tagFolderId,
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
