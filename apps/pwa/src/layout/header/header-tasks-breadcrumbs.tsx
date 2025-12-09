"use client";

import { ContentEditable } from "@/components/content-editable/content-editable";
import { useRouter } from "@/hooks/use-router";
import { ModalTagForm } from "@/modules/tags/modals/modal-tag-form";
import { onRemoveTaskTagFolder } from "@/modules/tags/tags-service";
import { TagType } from "@/modules/tags/tags-types";
import { TaskTagFolderSelector } from "@/modules/tasks/components/task-tag-folder-selector";
import { useTaskFolders } from "@/modules/tasks/hooks/use-task-folders";
import { Trans } from "@lingui/react/macro";
import { ActionIcon, alpha, Card, Group, Menu, Text, Tooltip } from "@mantine/core";
import { useDebouncedCallback, useHover } from "@mantine/hooks";
import { IconDots, IconFolder, IconLogout2, IconPencil, IconTrash } from "@tabler/icons-react";
import { FC } from "react";

export const WorkspaceHeaderTasksBreadcrumbs: FC = () => {
  const router = useRouter();
  const tagFolders = useTaskFolders();
  const hover = useHover();

  const onChangeTaskFolderName = useDebouncedCallback((name: string) => {
    if (!tagFolders.activatedFolder) return;
    // TODO:
    // tags.update(tagFolders.activatedFolder._id, { ...tagFolders.activatedFolder, name });
  }, 500);

  const onExitFolder = () => {
    // TODO:
    // tagFolders.exitFolder();
  };

  if (!router.pathname.startsWith("/tasks")) return null;

  return (
    <Group gap={8}>
      <TaskTagFolderSelector
        excludeIds={[tagFolders.activatedFolder?._id || ""]}
        onSelect={(tag) => {
          // TODO:
          // if (tag) tagFolders.openFolder(tag);
          // else tagFolders.exitFolder();
        }}
        render={(ctx) => {
          return (
            <Group gap={0}>
              <Card
                p={3}
                withBorder={false}
                shadow="none"
                ref={hover.ref}
                bg={
                  hover.hovered
                    ? tagFolders.activatedFolder
                      ? alpha(tagFolders.activatedFolder?.color || "dark", 0.1)
                      : "gray.1"
                    : undefined
                }
              >
                <Group gap={0}>
                  <Tooltip label={<Trans>Select folder</Trans>} position="right">
                    <ActionIcon
                      variant="subtle"
                      color={tagFolders.activatedFolder?.color || "dark"}
                      onClick={ctx.toggle}
                      style={{ cursor: "pointer" }}
                    >
                      <IconFolder size={18} strokeWidth={2} />
                    </ActionIcon>
                  </Tooltip>

                  {!!tagFolders.activatedFolder ? (
                    <Group pr={8}>
                      <ContentEditable
                        fz={13}
                        fw={500}
                        value={tagFolders.activatedFolder.name}
                        onChange={(value) => {
                          if (!value || typeof value !== "string") return;
                          onChangeTaskFolderName(value);
                        }}
                      />
                    </Group>
                  ) : (
                    <Text fz={13} fw={500} pr={5} style={{ cursor: "default" }}>
                      <Trans>All tasks</Trans>
                    </Text>
                  )}
                </Group>
              </Card>

              {tagFolders.activatedFolder && (
                <Menu>
                  <Menu.Target>
                    <ActionIcon variant="subtle" color="dark">
                      <IconDots strokeWidth={1.5} size={16} />
                    </ActionIcon>
                  </Menu.Target>

                  <Menu.Dropdown>
                    <Menu.Item
                      leftSection={<IconLogout2 strokeWidth={2} size={18} />}
                      onClick={(e) => {
                        e.stopPropagation();
                        onExitFolder();
                      }}
                    >
                      <Text fz={14}>
                        <Trans>Exit</Trans>
                      </Text>
                    </Menu.Item>

                    <ModalTagForm>
                      {(modalTagForm) => (
                        <Menu.Item
                          leftSection={<IconPencil strokeWidth={2} size={18} />}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!tagFolders.activatedFolder) return;

                            modalTagForm.open({
                              tag: tagFolders.activatedFolder,
                              type: TagType.TASK_FOLDER,
                            });
                          }}
                        >
                          <Text fz={14}>
                            <Trans>Edit</Trans>
                          </Text>
                        </Menu.Item>
                      )}
                    </ModalTagForm>

                    {/* TODO: */}
                    {/* <Menu.Item
                      leftSection={<IconTrash strokeWidth={2} size={18} />}
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveTaskTagFolder(tagFolders.activatedFolder!, () => {
                          tagFolders.exitFolder();
                        });
                      }}
                    >
                      <Text fz={14}>
                        <Trans>Remove</Trans>
                      </Text>
                    </Menu.Item> */}
                  </Menu.Dropdown>
                </Menu>
              )}
            </Group>
          );
        }}
      />
    </Group>
  );
};
