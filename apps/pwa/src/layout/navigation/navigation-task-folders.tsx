"use client";

import { OnModalTagForm } from "@/modules/tags/modals/modal-tag-form";
import { useTags } from "@/modules/tags/tags-context";
import { TagEntity, TagType } from "@/modules/tags/tags-types";
import { useTaskFolders } from "@/modules/tasks/hooks/use-task-folders";
import { getTasks } from "@/modules/tasks/tasks-service";
import { useColor } from "@/modules/theme/use-color";
import { onActionLoad, onArchive } from "@/utils/actions";
import { onError } from "@/utils/exceptions.utils";
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
import { ActionIcon, em, Group, Menu, rgba, Stack, Text } from "@mantine/core";
import { IconDots, IconFolder, IconFolderOpen, IconPencil, IconTrash } from "@tabler/icons-react";
import { useParams } from "next/navigation";
import { FC, useState } from "react";

export const WorkspaceNavigationTaskFolders: FC = () => {
  const tags = useTags();
  const taskFolderTags = tags.list
    .filter((v) => v.type === TagType.TASK_FOLDER)
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 10,
      },
    })
  );

  return (
    <DndContext
      sensors={sensors}
      onDragEnd={(e) => {
        const { active, over } = e;
        if (!over || active.id === over?.id) return;
        let items = [...taskFolderTags];

        const oldIndex = items.findIndex((v) => v._id === active.id.toString());
        const newIndex = items.findIndex((v) => v._id === over?.id.toString());
        items = arrayMove(items, oldIndex, newIndex);

        tags.reorder(items.map((v, i) => ({ _id: v._id, order: i }))).catch(onError);
      }}
    >
      <Stack w="100%" py={5} px={10} pl={16}>
        <Stack gap={5}>
          <SortableContext
            items={taskFolderTags.map((v) => v._id)}
            strategy={verticalListSortingStrategy}
          >
            {taskFolderTags.map((tag) => {
              return <TaskFolderNavigationItem key={tag._id} tag={tag} />;
            })}
          </SortableContext>
        </Stack>
      </Stack>
    </DndContext>
  );
};

const TaskFolderNavigationItem: FC<{ tag: TagEntity; overlay?: boolean }> = (props) => {
  const params = useParams();
  const tags = useTags();
  const taskFolders = useTaskFolders();

  const color = useColor();

  const { tag } = props;
  const [isHovered, setIsHovered] = useState(false);
  const isActive = params.slug === tag.slug;

  const sortable = useSortable({ id: tag._id, data: { tag: props.tag } });

  const style = {
    transform: CSS.Transform.toString(sortable.transform),
    transition: sortable.transition,
  };

  const onRemoveTag = () => {
    onActionLoad({
      name: <Trans>Remove folder</Trans>,
      icon: IconTrash,
      isShowCompleted: false,
      process: async () => {
        const relatedTasks = await getTasks({ tagFolderId: tag._id, limit: 1 });
        onArchive({
          name: <Trans>Folder</Trans>,
          icon: IconFolder,
          children:
            relatedTasks.count > 0
              ? `${t`Are you sure you want to continue?`} ${t`${relatedTasks.count} related work will be moved to the default folder`}`
              : undefined,
          process: () => tags.remove(tag._id),
        });
      },
    });
  };

  return (
    <Stack gap={0}>
      <Group
        p={10}
        gap={5}
        onMouseOver={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          cursor: "pointer",
          backgroundColor:
            isActive || isHovered ? rgba(tag.color || color("dark.2"), 0.1) : "transparent",
          borderRadius: 8,
          ...style,
        }}
        ref={sortable.setNodeRef}
        {...sortable.attributes}
        {...sortable.listeners}
        onClick={() => taskFolders.openFolder(tag)}
        wrap="nowrap"
      >
        <Group gap={5} flex={1} wrap="nowrap">
          <ActionIcon color={tag.color || "dark"} variant="subtle" size="sm">
            {isActive ? <IconFolderOpen size={18} /> : <IconFolder size={18} />}
          </ActionIcon>

          <Text maw={100} fz={em(13)} truncate="end">
            {tag.name}
          </Text>
        </Group>

        <Group gap={5} justify="end">
          <Menu>
            <Menu.Target>
              <ActionIcon variant="subtle" color="gray" size="sm">
                <IconDots strokeWidth={1.5} size={16} />
              </ActionIcon>
            </Menu.Target>

            <Menu.Dropdown>
              <Menu.Item
                leftSection={<IconPencil strokeWidth={1.5} size={16} />}
                onClick={(e) => {
                  e.stopPropagation();
                  OnModalTagForm({ tag, type: TagType.TASK_FOLDER });
                }}
              >
                <Text>
                  <Trans>Edit</Trans>
                </Text>
              </Menu.Item>

              <Menu.Item
                leftSection={<IconTrash strokeWidth={1.5} size={16} />}
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveTag();
                }}
              >
                <Text>
                  <Trans>Remove</Trans>
                </Text>
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>
      </Group>
    </Stack>
  );
};
