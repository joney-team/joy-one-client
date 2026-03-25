"use client";

import { ContentEditable } from "@/components/content-editable/content-editable";
import { ModalConfirm, ModalConfirmRef } from "@/modals/modal-confirm";
import { TagFragment } from "@/modules/tags/graphql/fragmentTag.graphql";
import REMOVE_TAG_MUTATION, {
  type RemoveTagMutation,
  type RemoveTagMutationVariables,
} from "@/modules/tags/graphql/mutationRemoveTag.graphql";
import GET_TAGS_QUERY from "@/modules/tags/graphql/queryTags.graphql";
import { useTaskFolders } from "@/modules/tasks/hooks/use-task-folders";
import { updateTaskPath } from "@/modules/tasks/tasks-route-helpers";
import { useColor } from "@/modules/theme/use-color";
import { useMutation } from "@apollo/client/react";
import { DndContext, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Trans } from "@lingui/react/macro";
import { ActionIcon, Group, Menu, Stack, Text } from "@mantine/core";
import { useDebouncedCallback } from "@mantine/hooks";
import {
  IconDots,
  IconDroplet,
  IconFolder,
  IconFolderOpen,
  IconPencil,
  IconTarget,
  IconTrash,
  IconX,
} from "@tabler/icons-react";
import { useParams, useRouter } from "next/navigation";
import { FC, Fragment, useEffect, useMemo, useRef, useState } from "react";

import { AppColorInput, useParsedAppColor } from "@/components/inputs/app-color-input";
import { TaskContextType } from "@/graphql/enums.graphql";
import { type ModalConfigureStatusesRef } from "@/modules/tasks/modals/modal-configure-statuses";
import { nonLoading } from "@/utils/non-loading";
import dynamic from "next/dynamic";
import styles from "./workspace-navigation-task-folders.module.css";

const ModalConfigureStatuses = dynamic(
  () =>
    import("@/modules/tasks/modals/modal-configure-statuses").then(
      (mod) => mod.ModalConfigureStatuses,
    ),
  {
    ssr: false,
    loading: nonLoading,
  },
);

const TaskFolderNavigationItem: FC<{
  tag: TagFragment;
  onOpen: () => void;
}> = ({ tag, onOpen }) => {
  const router = useRouter();
  const params = useParams();
  const color = useColor();
  const isActive = params.slug === tag.slug;
  const activeColor = useParsedAppColor(tag.color);
  const modalConfirmRef = useRef<ModalConfirmRef>(null);
  const modalConfigureStatusesRef = useRef<ModalConfigureStatusesRef>(null);

  const { bulkUpdateTags } = useTaskFolders();

  const [isRenaming, setIsRenaming] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);

  const sortable = useSortable({ id: tag._id, data: { tag } });

  const style = {
    transform: CSS.Transform.toString(sortable.transform),
    transition: sortable.transition,
  };

  const [removeTag] = useMutation<RemoveTagMutation, RemoveTagMutationVariables>(
    REMOVE_TAG_MUTATION,
    {
      refetchQueries: [GET_TAGS_QUERY],
    },
  );

  const onRemoveTag = () => {
    modalConfirmRef.current?.open({
      icon: IconTrash,
      color: "red",
      content: (
        <Stack gap={5}>
          <Text>
            <Trans>
              Remove <strong>{tag.name}</strong> folder
            </Trans>
          </Text>

          <Text fz={14} c="dimmed">
            <Trans>All tasks in this folder will be archived.</Trans>
          </Text>
        </Stack>
      ),
      onConfirm: async () => {
        await removeTag({ variables: { id: tag._id } });
        return router.push(updateTaskPath({ slug: "d" }));
      },
    });
  };

  const onUpdateName = useDebouncedCallback(async (value: string) => {
    await bulkUpdateTags([{ _id: tag._id, name: value.trim() }]);
  }, 500);

  const Icon = useMemo(() => {
    return isActive ? IconFolderOpen : IconFolder;
  }, [isActive]);

  useEffect(() => {
    sortable.node.current?.style.setProperty(
      "--active-color",
      activeColor ?? "var(--mantine-color-dimmed)",
    );
  }, [activeColor]);

  const menuActions = useMemo(() => {
    if (isColorPickerOpen) {
      return (
        <Stack p={8} gap={8}>
          <Group gap={5} miw={0}>
            <Text fz={12} flex={1} truncate>
              <Trans>Select color</Trans>
            </Text>
            <ActionIcon
              onClick={() => setIsColorPickerOpen(false)}
              variant="subtle"
              size="sm"
              color="gray"
            >
              <IconX size={16} strokeWidth={1.5} />
            </ActionIcon>
          </Group>
          <AppColorInput
            color={tag.color}
            onChange={(color) => {
              bulkUpdateTags([{ _id: tag._id, color }]);
            }}
          />
        </Stack>
      );
    }

    return (
      <Fragment>
        <Menu.Item
          fz={14}
          pl={6}
          leftSection={<IconPencil strokeWidth={1.5} size={16} />}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsMenuOpen(false);
            setIsRenaming(true);
          }}
        >
          <Trans>Rename</Trans>
        </Menu.Item>

        <Menu.Item
          fz={14}
          pl={6}
          leftSection={<IconDroplet strokeWidth={1.5} size={16} />}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsColorPickerOpen(true);
          }}
        >
          <Trans>Color</Trans>
        </Menu.Item>

        <Menu.Item
          fz={14}
          pl={6}
          leftSection={<IconTarget strokeWidth={1.5} size={16} />}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            modalConfigureStatusesRef.current?.open({
              contextType: TaskContextType.Folder,
              contextId: tag._id,
            });
            setIsMenuOpen(false);
          }}
        >
          <Trans>Task statuses</Trans>
        </Menu.Item>

        <Menu.Item
          fz={14}
          pl={6}
          c="gray"
          leftSection={<IconTrash color={color("gray")} strokeWidth={1.5} size={16} />}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsMenuOpen(false);
            onRemoveTag();
          }}
        >
          <Trans>Remove</Trans>
        </Menu.Item>
      </Fragment>
    );
  }, [isColorPickerOpen, tag]);

  return (
    <Fragment>
      <Group
        px={10}
        py={6}
        gap={5}
        className={styles.TaskFolderNavigationItem}
        data-activated={isActive || isMenuOpen}
        style={style}
        ref={sortable.setNodeRef}
        {...sortable.attributes}
        {...sortable.listeners}
        onClick={onOpen}
        wrap="nowrap"
        miw={0}
      >
        <Group gap={5} flex={1} wrap="nowrap" miw={0}>
          <ActionIcon color={tag.color || "dark"} variant="subtle" size="sm">
            <Icon size={18} />
          </ActionIcon>

          <ContentEditable
            fz={13}
            fw={500}
            autoFocus
            disabled={!isRenaming}
            value={tag.name}
            onChange={(value) => {
              if (!value || typeof value !== "string") return;
              onUpdateName(value);
            }}
            onBlur={(value) => {
              onUpdateName(value);
              setIsRenaming(false);
            }}
            onDoubleClick={() => setIsRenaming(true)}
          />
        </Group>

        <Group gap={5} justify="end">
          <Menu
            opened={isMenuOpen}
            closeOnItemClick={false}
            onOpen={() => {
              setIsMenuOpen(true);
              setIsColorPickerOpen(false);
            }}
            onClose={() => setIsMenuOpen(false)}
          >
            <Menu.Target>
              <ActionIcon
                className={styles.ActionsMenu}
                variant="subtle"
                color="dark"
                size="xs"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsMenuOpen(true);
                }}
              >
                <IconDots strokeWidth={1.5} size={12} />
              </ActionIcon>
            </Menu.Target>

            <Menu.Dropdown>{menuActions}</Menu.Dropdown>
          </Menu>
        </Group>
      </Group>

      <ModalConfirm ref={modalConfirmRef} />
      <ModalConfigureStatuses ref={modalConfigureStatusesRef} />
    </Fragment>
  );
};

export const WorkspaceNavigationTaskFolders: FC = () => {
  const { folders, openFolder, bulkUpdateTags } = useTaskFolders();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 10,
      },
    }),
  );

  return (
    <DndContext
      sensors={sensors}
      onDragEnd={(e) => {
        const { active, over } = e;
        if (!over || active.id === over?.id) return;
        const items = [...folders];
        const oldIndex = items.findIndex((v) => v._id === active.id.toString());
        const newIndex = items.findIndex((v) => v._id === over?.id.toString());
        bulkUpdateTags(
          arrayMove(items, oldIndex, newIndex).map((v, i) => ({ _id: v._id, order: i + 1 })),
        );
      }}
    >
      <Stack w="100%" py={5} px={10} pl={16} miw={0}>
        <Stack gap={5} miw={0}>
          <SortableContext items={folders.map((v) => v._id)} strategy={verticalListSortingStrategy}>
            {folders.map((tag) => {
              return (
                <TaskFolderNavigationItem key={tag._id} tag={tag} onOpen={() => openFolder(tag)} />
              );
            })}
          </SortableContext>
        </Stack>
      </Stack>
    </DndContext>
  );
};
