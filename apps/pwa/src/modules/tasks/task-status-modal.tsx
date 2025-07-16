"use client";

import { Button } from "@/components/buttons/button";
import { ContentEditable } from "@/components/content-editable/content-editable";
import { ModalTitle } from "@/components/modal-title";
import { Renderer } from "@/components/renderer";
import { TaskStatusIcon } from "@/modules/tasks/components/task-status-options";
import { onArchive } from "@/utils/actions";
import { num, t } from "@/modules/lang/lang-service";
import { getTasks, renderTaskStatus, bulkUpdateTasks } from "@/modules/tasks/tasks-service";
import { DefaultTaskStatusId, TaskStatus } from "@/modules/tasks/tasks-types";
import { setWorkspaceSettings } from "@/modules/workspace-settings/workspace-settings-service";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { onError } from "@/utils/exceptions.utils";
import { DndContext, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  ActionIcon,
  Card,
  Divider,
  em,
  Group,
  Menu,
  Space,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { useDebouncedCallback } from "@mantine/hooks";
import { modals } from "@mantine/modals";
import {
  IconCheck,
  IconGripVertical,
  IconPlus,
  IconSettings,
  IconTrash,
  IconX,
} from "@tabler/icons-react";
import { FC, Fragment, PropsWithChildren, useState } from "react";
import { v4 as uuid } from "uuid";

export interface TaskSatusesModalProps {
  statusId?: string;
}

export const TaskSatusesModal: FC<TaskSatusesModalProps> = (props) => {
  const workspace = useWorkspace();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  return (
    <Stack gap={10}>
      <Divider label={t("pending_statuses_group")} labelPosition="left" />
      <StatusCard status={workspace.settings.taskStatuses[0]} disabledOrder />

      <DndContext
        sensors={sensors}
        onDragEnd={(e) => {
          const { active, over } = e;
          if (!over || active.id === over?.id) return;
          let items = [...workspace.settings.taskStatuses];

          const oldIndex = items.findIndex((v) => v.id === active.id.toString());
          const newIndex = items.findIndex((v) => v.id === over?.id.toString());

          items = arrayMove(items, oldIndex, newIndex).map((v, order) => ({ ...v, order }));

          workspace.updateSettings({ ...workspace.settings, taskStatuses: items });
        }}
      >
        <SortableContext
          items={workspace.settings.taskStatuses.map((v) => v.id)}
          strategy={verticalListSortingStrategy}
        >
          {workspace.settings.taskStatuses
            .filter((v) => !Object.values<string>(DefaultTaskStatusId).includes(v.id))
            .map((status) => (
              <StatusCard key={status.id} status={status} />
            ))}
        </SortableContext>
      </DndContext>

      <CreateStatusForm />

      <Space />

      <Divider label={t("completed_statuses_group")} labelPosition="left" />

      <StatusCard
        status={workspace.settings.taskStatuses[workspace.settings.taskStatuses.length - 1]}
        disabledOrder
      />
    </Stack>
  );
};

export const CreateStatusForm: FC = () => {
  const workspace = useWorkspace();

  const [color, setColor] = useState<string>();
  const [isActivated, setIsActivated] = useState(false);
  const [name, setName] = useState<string>("");

  const onSubmit = async (_name = name) => {
    if (!_name) return;

    try {
      const taskStatuses = [
        ...workspace.settings.taskStatuses,
        {
          id: uuid(),
          name: _name,
          color,
          order: workspace.settings.taskStatuses.length - 2,
        },
      ];

      await setWorkspaceSettings({ ...workspace.settings, taskStatuses });
      setIsActivated(false);
    } catch (error) {
      onError(error);
    }
  };

  return (
    <Card p={8} withBorder shadow="none" style={{ borderStyle: "dashed", overflow: "visible" }}>
      <Group gap={5}>
        <ActionIcon variant="transparent" color="gray" opacity={0} style={{ cursor: "default" }}>
          <IconGripVertical size={16} strokeWidth={1.2} />
        </ActionIcon>

        <ColorInput color={color} onChange={setColor}>
          {isActivated ? (
            <TaskStatusIcon id="new" color={color} />
          ) : (
            <ActionIcon size={18} radius={100} color="gray" variant="transparent">
              <IconPlus size={18} strokeWidth={1.5} />
            </ActionIcon>
          )}
        </ColorInput>

        <Space />

        {isActivated ? (
          <ContentEditable
            fz={16}
            fw={400}
            autoFocus
            value={name}
            onChange={(v) => setName(v)}
            placeholder={t("enter_name")}
          />
        ) : (
          <Title fz={em(15)} fw={400} flex={1} onClick={() => setIsActivated(true)} c="gray">
            {t("add_entity", { entity: t("status").toLowerCase() })}
          </Title>
        )}

        {isActivated && (
          <Fragment>
            {!!name && (
              <Button
                h={28}
                size="xs"
                rightSection={<IconCheck size={13} strokeWidth={3} style={{ marginLeft: -5 }} />}
                fz={em(14)}
                onClick={() => onSubmit()}
              >
                {t("save")}
              </Button>
            )}

            <ActionIcon
              variant="subtle"
              color="gray"
              onClick={() => {
                setIsActivated(false);
                setName("");
              }}
            >
              <IconX size={16} strokeWidth={1.5} />
            </ActionIcon>
          </Fragment>
        )}
      </Group>
    </Card>
  );
};

export const StatusCard: FC<{
  status: TaskStatus;
  draggingStatus?: TaskStatus;
  disabledOrder?: boolean;
  overlay?: boolean;
}> = (props) => {
  const workspace = useWorkspace();
  const styled = renderTaskStatus(props.status.id, workspace.settings.taskStatuses);
  const isDefaultStatus = Object.values<string>(DefaultTaskStatusId).includes(props.status.id);

  const onChangeName = useDebouncedCallback(async (value?: string | null) => {
    const taskStatuses = workspace.settings.taskStatuses.map((v) =>
      v.id === props.status.id ? { ...v, name: value } : v
    );
    await setWorkspaceSettings({ ...workspace.settings, taskStatuses });
  }, 1000);

  const onRemove = async () => {
    const taskStatuses = workspace.settings.taskStatuses.filter((v) => v.id !== props.status.id);
    const relatedTasks = await getTasks({ status: props.status.id }).then((res) => res.data);
    const statusStyle = renderTaskStatus(DefaultTaskStatusId.TODO, workspace.settings.taskStatuses);

    onArchive({
      name: t("task_status"),
      children: (
        <Stack gap={8}>
          <Text>
            {t("task_status_remove_confirm")} <strong>{styled.name}</strong>?
          </Text>
          <Text>
            <strong>{num(relatedTasks.length)}</strong> {t("task_status_remove_confirm_desc")}{" "}
            <strong>{statusStyle.name}</strong>
          </Text>
        </Stack>
      ),
      process: async () => {
        await setWorkspaceSettings({ ...workspace.settings, taskStatuses }),
          await bulkUpdateTasks(
            relatedTasks.map((t) => {
              return {
                ...t,
                status: DefaultTaskStatusId.TODO,
              };
            })
          );
      },
    });
  };

  const onChangeColor = async (color?: string) => {
    const taskStatuses = workspace.settings.taskStatuses.map((v) =>
      v.id === props.status.id ? { ...v, color } : v
    );
    await setWorkspaceSettings({ ...workspace.settings, taskStatuses });
  };

  const sortable = useSortable({ id: props.status.id });

  const style = {
    transform: CSS.Transform.toString(sortable.transform),
    transition: sortable.transition,
  };

  return (
    <Card
      withBorder
      p={8}
      shadow="none"
      ref={sortable.setNodeRef}
      {...sortable.attributes}
      {...sortable.listeners}
      style={style}
    >
      <Group gap={5}>
        <ActionIcon
          variant="transparent"
          color="gray"
          style={{ cursor: isDefaultStatus ? "default" : "grab", outline: "none" }}
          opacity={isDefaultStatus ? 0 : 1}
        >
          <IconGripVertical size={16} strokeWidth={1.2} />
        </ActionIcon>

        <ColorInput color={props.status.color || styled.color} onChange={onChangeColor}>
          <TaskStatusIcon id={props.status.id} color={props.status.color} />
        </ColorInput>

        <Space />

        <ContentEditable value={styled.name} fz={16} fw={400} onChange={onChangeName} />

        <Group justify="end">
          <Renderer visible={!isDefaultStatus}>
            <ActionIcon onClick={onRemove} variant="subtle" color="gray">
              <IconTrash strokeWidth={1.5} size={16} />
            </ActionIcon>
          </Renderer>
        </Group>
      </Group>
    </Card>
  );
};

export const ColorInput: FC<
  PropsWithChildren<{
    color?: string | null;
    onChange: (color?: string) => void;
    ref?: any;
  }>
> = (props) => {
  const [opened, setOpened] = useState(false);

  return (
    <Menu opened={opened} onChange={setOpened}>
      <Menu.Target>
        <Group>{props.children}</Group>
      </Menu.Target>

      <Menu.Dropdown maw="100%" w={225}>
        <Stack gap={10} p={10} ref={props.ref}>
          <Group justify="space-between">
            <Text fz={em(13)} fw={500} c="gray">
              {t("select_color")}
            </Text>

            <ActionIcon onClick={() => setOpened(false)} variant="subtle" size="sm" color="gray">
              <IconX size={18} strokeWidth={1.5} />
            </ActionIcon>
          </Group>
          <Group>
            {[
              "pink",
              "grape",
              "violet",
              "indigo",
              "blue",
              "cyan",
              "teal",
              "green",
              "lime",
              "yellow",
              "orange",
              "gray",
              "dark",
            ].map((color) => {
              return (
                <TaskStatusIcon
                  id="new"
                  key={color}
                  color={color}
                  onClick={(e) => {
                    e.preventDefault();
                    props.onChange(color);
                  }}
                  size={26}
                />
              );
            })}
          </Group>
        </Stack>
      </Menu.Dropdown>
    </Menu>
  );
};

export const OnTaskSatusesModal = (props?: TaskSatusesModalProps) =>
  modals.open({
    modalId: "TaskSatusesModal",
    title: <ModalTitle title={t("task_statuses")} icon={IconSettings} />,
    children: <TaskSatusesModal {...props} />,
  });
