"use client";

import { Button } from "@/components/buttons/button";
import { ContentEditable } from "@/components/content-editable/content-editable";
import { AppColorInput } from "@/components/inputs/app-color-input";
import { Modal } from "@/components/modal/modal";
import { GetTaskStatusesMode, TaskContextType } from "@/graphql/enums.graphql";
import { TaskStatus } from "@/graphql/types.graphql";
import { useColor } from "@/modules/theme/use-color";
import { onError } from "@/utils/exceptions.utils";
import { useApolloClient, useMutation } from "@apollo/client/react";
import { DndContext, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { ActionIcon, Card, Center, Group, Menu, Skeleton, Space, Stack, Text } from "@mantine/core";
import { useDebouncedCallback } from "@mantine/hooks";
import {
  IconAdjustments,
  IconBox,
  IconGripVertical,
  IconPlus,
  IconSettings,
  IconTrash,
  IconX,
} from "@tabler/icons-react";
import {
  FC,
  forwardRef,
  Fragment,
  ReactNode,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";
import { v4 as uuid } from "uuid";
import { TaskStatusIcon } from "../components/task-status-icon";
import UPDATE_TASK_STATUSES_MUTATION, {
  type UpdateTaskStatusesMutation,
  type UpdateTaskStatusesMutationVariables,
} from "../graphql/mutationUpdateTaskStatuses.graphql";
import TASK_STATUS_QUERY, {
  type TaskStatusesQuery,
  type TaskStatusesQueryVariables,
} from "../graphql/queryTaskStatuses.graphql";
import { normalizeTaskStatuses } from "../task-constants";
import { DefaultTaskStatusId } from "../tasks-types";

export interface ModalConfigureStatusesArgs {
  contextType: TaskContextType | null;
  contextId: string | null;
  autoCreation?: boolean;
}

export interface ModalConfigureStatusesRef {
  open: (args: ModalConfigureStatusesArgs) => void;
  close: () => void;
}

const StatusCard: FC<{
  status: Partial<TaskStatus> & { id: string };
  draggingStatus?: TaskStatus;
  overlay?: boolean;
  onUpdateStatus: (status: Partial<TaskStatus>) => void;
  onRemoveStatus?: () => void;
  readonly?: boolean;
}> = (props) => {
  const isCreateNew = !props.status.name && !props.status.color;
  const [openedColorMenu, setOpenedColorMenu] = useState(isCreateNew);

  const isDefaultStatus =
    !!props.status.id && Object.values<string>(DefaultTaskStatusId).includes(props.status.id);

  const onChangeName = useDebouncedCallback(async (value?: string | null) => {
    props.onUpdateStatus({ ...props.status, name: value ?? "" });
  }, 500);

  const sortDisabled = isDefaultStatus && props.readonly === true;

  const sortable = useSortable({
    id: props.status.id,
    disabled: sortDisabled,
  });

  return (
    <Card
      withBorder
      px={8}
      py={5}
      shadow={props.readonly ? "none" : "sm"}
      ref={sortable.setNodeRef}
      {...sortable.attributes}
      {...sortable.listeners}
      bg={props.readonly ? "var(--mantine-color-default-hover)" : undefined}
      style={{
        transform: CSS.Transform.toString(sortable.transform),
        transition: sortable.transition,
        cursor: props.readonly ? "not-allowed" : undefined,
      }}
    >
      <Group gap={3}>
        <ActionIcon
          variant="transparent"
          color="gray"
          style={{
            cursor: sortDisabled ? "not-allowed" : "grab",
            outline: "none",
          }}
          opacity={isDefaultStatus ? 0.5 : 1}
        >
          <IconGripVertical size={16} strokeWidth={1.2} />
        </ActionIcon>

        <Menu opened={openedColorMenu} onChange={setOpenedColorMenu} offset={{ mainAxis: 10 }}>
          <Menu.Target>
            <Group>
              <TaskStatusIcon
                id={props.status.id}
                color={props.status.color ?? "gray"}
                progress={props.status.progress ?? 0}
              />
            </Group>
          </Menu.Target>

          <Menu.Dropdown maw="100%" w={225}>
            <Stack p={8} gap={8}>
              <Group gap={5} miw={0}>
                <Text fz={12} flex={1} truncate>
                  <Trans>Select color</Trans>
                </Text>
                <ActionIcon
                  onClick={() => setOpenedColorMenu(false)}
                  variant="subtle"
                  size="sm"
                  color="gray"
                >
                  <IconX size={16} strokeWidth={1.5} />
                </ActionIcon>
              </Group>
              <AppColorInput
                color={props.status.color}
                onChange={(color) => {
                  props.onUpdateStatus({ ...props.status, color });
                }}
              />
            </Stack>
          </Menu.Dropdown>
        </Menu>

        <Space />

        <ContentEditable
          value={props.status.name ?? ""}
          fz={16}
          fw={400}
          onChange={onChangeName}
          autoFocus={isCreateNew}
          placeholder={t`Enter status name`}
          disabled={props.readonly}
        />

        {props.onRemoveStatus && !isDefaultStatus && (
          <Group justify="end">
            <ActionIcon
              disabled={props.readonly}
              onClick={props.onRemoveStatus}
              variant="subtle"
              color="gray"
              size="sm"
            >
              <IconTrash strokeWidth={1.5} size={14} />
            </ActionIcon>
          </Group>
        )}
      </Group>
    </Card>
  );
};

const ModalConfigureStatusesContent: FC<ModalConfigureStatusesArgs & { close: () => void }> = (
  props
) => {
  const client = useApolloClient();
  const color = useColor();
  const [taskStatusesData, setTaskStatusesData] = useState<TaskStatusesQuery["taskStatuses"]>();
  const [statuses, setStatuses] = useState<TaskStatus[]>([]);

  const [updateTaskStatuses] = useMutation<
    UpdateTaskStatusesMutation,
    UpdateTaskStatusesMutationVariables
  >(UPDATE_TASK_STATUSES_MUTATION);

  const fetchData = async () => {
    try {
      const taskStatusesData = await client.query<TaskStatusesQuery, TaskStatusesQueryVariables>({
        query: TASK_STATUS_QUERY,
        variables: {
          contextType: props.contextType,
          contextId: props.contextId,
          mode: GetTaskStatusesMode.Edit,
        },
        fetchPolicy: "network-only",
      });

      if (!taskStatusesData.data) throw Error("Failed to fetch task statuses");

      setTaskStatusesData(taskStatusesData.data.taskStatuses);
      setStatuses(normalizeTaskStatuses(taskStatusesData.data.taskStatuses.statuses));
    } catch (error) {
      onError(error);
      props.close();
    }
  };

  useEffect(() => {
    fetchData();
  }, [props.contextType, props.contextId]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  const onAddProgress = (taskStatuses = statuses) => {
    const closedIndex = taskStatuses.findIndex((v) => v.id === DefaultTaskStatusId.CLOSED);
    if (closedIndex === -1 || closedIndex === 0) return;

    const newStatus: TaskStatus = {
      __typename: "TaskStatus",
      id: uuid(),
      name: "",
      color: "",
      progress: 0,
      contextId: props.contextId,
      contextType: props.contextType,
      order: (taskStatuses[closedIndex].order + taskStatuses[closedIndex - 1].order) / 2,
    };
    setStatuses([...taskStatuses, newStatus].sort((a, b) => a.order - b.order));
  };

  useEffect(() => {
    if (
      props.autoCreation &&
      taskStatusesData &&
      statuses.length > 0 &&
      statuses.every((v) => !!v.name)
    ) {
      if (taskStatusesData.isInherited === true) {
        const inheritedStatuses = normalizeTaskStatuses(taskStatusesData.workspaceStatuses);
        setStatuses(inheritedStatuses);
        setTaskStatusesData({ ...taskStatusesData, isInherited: false });
        onAddProgress(inheritedStatuses);
      } else {
        onAddProgress(statuses);
      }
    }
  }, [props.autoCreation, statuses, taskStatusesData]);

  const onApplyChanges = async () => {
    if (!taskStatusesData) return;

    try {
      await updateTaskStatuses({
        variables: {
          contextType: props.contextType,
          contextId: props.contextId,
          isInherited: taskStatusesData.isInherited,
          statuses: statuses
            .filter((v) => v.name && v.name.length > 0)
            .map((v, index) => ({
              id: v.id,
              name: v.name,
              color: v.color,
              order: index,
            })),
        },
        refetchQueries: [TASK_STATUS_QUERY],
        awaitRefetchQueries: true,
      });
      props.close();
    } catch (error) {
      onError(error);
    }
  };

  if (!taskStatusesData) return <Skeleton miw="100%" h={300} />;

  const pointedStatuses = taskStatusesData.isInherited
    ? taskStatusesData.workspaceStatuses
    : statuses;

  return (
    <Stack gap={8} miw={0} w="100%" style={{ overflow: "visible" }}>
      {props.contextId && props.contextType && (
        <Group gap={5}>
          <Button
            color={color(!taskStatusesData.isInherited ? "gray" : "primary")}
            variant="outline"
            size="compact-sm"
            leftIcon={IconBox}
            onClick={() => {
              setTaskStatusesData({ ...taskStatusesData, isInherited: true });
            }}
          >
            <Trans>Inherit from workspace</Trans>
          </Button>

          <Button
            color={color(taskStatusesData.isInherited ? "gray" : "primary")}
            variant="outline"
            size="compact-sm"
            leftIcon={IconAdjustments}
            onClick={() => {
              setTaskStatusesData({ ...taskStatusesData, isInherited: false });
            }}
          >
            <Trans>Custom statuses</Trans>
          </Button>
        </Group>
      )}

      <Group>
        <Text fz={12} fw={500} flex={1} c="gray">
          <Trans>In progress</Trans>
        </Text>
        <ActionIcon variant="subtle" color="gray" size="sm" onClick={() => onAddProgress(statuses)}>
          <IconPlus size={16} strokeWidth={1.5} />
        </ActionIcon>
      </Group>

      {pointedStatuses
        .filter((v) => v.id === DefaultTaskStatusId.TODO)
        .map((status) => (
          <StatusCard
            key={status.id}
            status={status}
            onUpdateStatus={(status) => {
              setStatuses(statuses.map((v) => (v.id === status.id ? { ...v, ...status } : v)));
            }}
            readonly={taskStatusesData.isInherited}
          />
        ))}

      <DndContext
        sensors={sensors}
        onDragEnd={(e) => {
          const { active, over } = e;
          if (!over || active.id === over?.id) return;
          let items = [...statuses];

          const oldIndex = items.findIndex((v) => v.id === active.id.toString());
          const newIndex = items.findIndex((v) => v.id === over?.id.toString());

          items = arrayMove(items, oldIndex, newIndex).map((v, order) => ({ ...v, order }));

          setStatuses(items);
        }}
      >
        <SortableContext items={statuses} strategy={verticalListSortingStrategy}>
          {pointedStatuses
            .filter((v) => !Object.values<string>(DefaultTaskStatusId).includes(v.id))
            .map((status) => (
              <StatusCard
                key={status.id}
                status={status}
                onUpdateStatus={(status) => {
                  setStatuses(statuses.map((v) => (v.id === status.id ? { ...v, ...status } : v)));
                }}
                onRemoveStatus={() => {
                  setStatuses(statuses.filter((v) => v.id !== status.id));
                }}
                readonly={taskStatusesData.isInherited}
              />
            ))}
        </SortableContext>
      </DndContext>

      <Text mt={12} fz={12} fw={500} flex={1} c="gray">
        <Trans>Closed</Trans>
      </Text>

      {pointedStatuses
        .filter((v) => v.id === DefaultTaskStatusId.CLOSED)
        .map((status) => (
          <StatusCard
            key={status.id}
            status={status}
            onUpdateStatus={(status) => {
              setStatuses(statuses.map((v) => (v.id === status.id ? { ...v, ...status } : v)));
            }}
            readonly={taskStatusesData.isInherited}
          />
        ))}

      <Center mt={12}>
        <Button onClick={onApplyChanges}>
          <Trans>Apply changes</Trans>
        </Button>
      </Center>
    </Stack>
  );
};

export const ModalConfigureStatuses = forwardRef<
  ModalConfigureStatusesRef,
  {
    children?: (modal: ModalConfigureStatusesRef) => ReactNode;
  }
>((props, ref) => {
  const [args, setArgs] = useState<ModalConfigureStatusesArgs | null>(null);

  useImperativeHandle(ref, () => ({
    open: async (a) => {
      setArgs(a);
    },
    close: () => {
      setArgs(null);
    },
  }));

  return (
    <Fragment>
      {typeof props.children === "function"
        ? props.children({
            open: (a) => {
              setArgs(a);
            },
            close: () => {
              setArgs(null);
            },
          })
        : null}

      <Modal
        opened={!!args}
        onClose={() => setArgs(null)}
        name={<Trans>Configure statuses</Trans>}
        closeOnEscape={false}
        icon={IconSettings}
        styles={{
          body: {
            overflow: "visible",
          },
          content: {
            overflow: "visible",
          },
        }}
      >
        {args && <ModalConfigureStatusesContent {...args} close={() => setArgs(null)} />}
      </Modal>
    </Fragment>
  );
});
