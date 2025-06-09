import { ContentEditable } from "@/components/content-editable/content-editable";
import { TaskTagFolderSelector } from "@/components/selector/task-tag-folder-selector";
import { useRouter } from "@/hooks/use-router";
import { t } from "@/modules/lang/lang-service";
import { OnModalTagForm } from "@/modules/tags/modals/modal-tag-form";
import { useTags } from "@/modules/tags/tags-context";
import { onRemoveTaskTagFolder } from "@/modules/tags/tags-service";
import { TagType } from "@/modules/tags/tags-types";
import { useTaskFolders } from "@/modules/tasks/hooks/use-task-folders";
import { capitalize } from "@/utils/string.utils";
import { ActionIcon, alpha, Card, Group, Menu, Text, Tooltip } from "@mantine/core";
import { useDebouncedCallback, useHover } from "@mantine/hooks";
import { IconDots, IconFolder, IconLogout2, IconPencil, IconTrash } from "@tabler/icons-react";
import { FC } from "react";

export const WorkspaceHeaderTasksBreadcrumbs: FC = () => {
  const router = useRouter();
  const tagFolders = useTaskFolders();
  const hover = useHover();
  const tags = useTags();

  const onChangeTaskFolderName = useDebouncedCallback((name: string) => {
    if (!tagFolders.tagFolder) return;
    tags.update(tagFolders.tagFolder._id, { ...tagFolders.tagFolder, name });
  }, 500);

  if (!router.pathname.startsWith("/tasks")) return null;

  return (
    <Group gap={8}>
      <TaskTagFolderSelector
        excludeIds={[tagFolders.tagFolder?._id || ""]}
        onSelect={(tag) => {
          if (tag) tagFolders.openFolder(tag);
          else tagFolders.exitFolder();
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
                    ? tagFolders.tagFolder
                      ? alpha(tagFolders.tagFolder?.color || "dark", 0.1)
                      : "gray.1"
                    : undefined
                }
              >
                <Group gap={0}>
                  <Tooltip label={capitalize(`${t("select")} ${t("folder")}`)} position="right">
                    <ActionIcon
                      variant="subtle"
                      color={tagFolders.tagFolder?.color || "dark"}
                      onClick={ctx.toggle}
                      style={{ cursor: "pointer" }}
                    >
                      <IconFolder size={18} strokeWidth={2} />
                    </ActionIcon>
                  </Tooltip>

                  {!!tagFolders.tagFolder ? (
                    <Group pr={8}>
                      <ContentEditable
                        fz={13}
                        fw={500}
                        value={tagFolders.tagFolder.name}
                        onChange={(value) => {
                          if (!value || typeof value !== "string") return;
                          onChangeTaskFolderName(value);
                        }}
                      />
                    </Group>
                  ) : (
                    <Text fz={13} fw={500} pr={5} style={{ cursor: "default" }}>
                      {capitalize(`${t("all")} ${t("tasks")}`)}
                    </Text>
                  )}
                </Group>
              </Card>

              {tagFolders.tagFolder && (
                <>
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
                          tagFolders.exitFolder();
                        }}
                      >
                        <Text fz={14}>{t("exit")}</Text>
                      </Menu.Item>

                      <Menu.Item
                        leftSection={<IconPencil strokeWidth={2} size={18} />}
                        onClick={(e) => {
                          e.stopPropagation();
                          OnModalTagForm({ tag: tagFolders.tagFolder!, type: TagType.TASK_FOLDER });
                        }}
                      >
                        <Text fz={14}>{t("edit")}</Text>
                      </Menu.Item>

                      <Menu.Item
                        leftSection={<IconTrash strokeWidth={2} size={18} />}
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemoveTaskTagFolder(tagFolders.tagFolder!, () => {
                            tagFolders.exitFolder();
                          });
                        }}
                      >
                        <Text fz={14}>{t("remove")}</Text>
                      </Menu.Item>
                    </Menu.Dropdown>
                  </Menu>
                </>
              )}
            </Group>
          );
        }}
      />
    </Group>
  );
};
