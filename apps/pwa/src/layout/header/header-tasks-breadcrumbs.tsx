"use client";

import { TagType } from "@/graphql/enums.graphql";
import { useRouter } from "@/hooks/use-router";
import { type ModalTagFormRef } from "@/modules/tags/modals/modal-tag-form";
import { TaskTagFolderSelector } from "@/modules/tasks/components/task-tag-folder-selector";
import { useTaskFolders } from "@/modules/tasks/hooks/use-task-folders";
import { updateTaskPath } from "@/modules/tasks/tasks-route-helpers";
import { useColor } from "@/modules/theme/use-color";
import { nonLoading } from "@/utils/non-loading";
import { Trans } from "@lingui/react/macro";
import { ActionIcon, alpha, Card, Group, Menu, Text, Tooltip } from "@mantine/core";
import { useHover } from "@mantine/hooks";
import { IconDots, IconFolder, IconLogout2, IconPencil } from "@tabler/icons-react";
import dynamic from "next/dynamic";
import { FC, useRef } from "react";

const ModalTagForm = dynamic(
  () => import("@/modules/tags/modals/modal-tag-form").then((mod) => mod.ModalTagForm),
  {
    ssr: false,
    loading: nonLoading,
  },
);

export const WorkspaceHeaderTasksBreadcrumbs: FC = () => {
  const router = useRouter();
  const color = useColor();
  const hover = useHover();
  const { activatedFolder } = useTaskFolders();
  const modalTagFormRef = useRef<ModalTagFormRef>(null);

  const onExitFolder = () => {
    router.push(updateTaskPath({ slug: "d" }));
  };

  if (!router.pathname.startsWith("/tasks")) return null;

  return (
    <Group gap={8}>
      <TaskTagFolderSelector
        excludeIds={[activatedFolder?._id || ""]}
        onSelect={(tag) => {
          if (tag) router.push(updateTaskPath({ slug: tag.slug }));
          else onExitFolder();
        }}
        render={(ctx) => {
          return (
            <Group gap={0}>
              <Card
                px={3}
                py={1}
                withBorder={false}
                shadow="none"
                ref={hover.ref}
                className="clickable"
                bg={
                  hover.hovered
                    ? activatedFolder
                      ? alpha(activatedFolder?.color || "dark", 0.1)
                      : "gray.1"
                    : undefined
                }
                onClick={ctx.toggle}
              >
                <Group gap={0}>
                  <Tooltip label={<Trans>Select folder</Trans>} position="right">
                    <ActionIcon variant="transparent" color={activatedFolder?.color || "dark"}>
                      <IconFolder size={18} strokeWidth={2} />
                    </ActionIcon>
                  </Tooltip>

                  <Text fz={13} fw={500} pr={5}>
                    {activatedFolder?.name ?? <Trans>All tasks</Trans>}
                  </Text>
                </Group>
              </Card>

              {activatedFolder && (
                <Menu>
                  <Menu.Target>
                    <ActionIcon variant="subtle" color="gray">
                      <IconDots strokeWidth={1.5} size={16} />
                    </ActionIcon>
                  </Menu.Target>

                  <Menu.Dropdown>
                    <Menu.Item
                      leftSection={<IconPencil strokeWidth={2} size={18} />}
                      onClick={(e) => {
                        e.stopPropagation();
                        modalTagFormRef.current?.open({
                          tag: activatedFolder,
                          type: TagType.TaskFolder,
                        });
                      }}
                    >
                      <Text fz={14}>
                        <Trans>Edit folder</Trans>
                      </Text>
                    </Menu.Item>

                    <Menu.Item
                      leftSection={<IconLogout2 strokeWidth={2} size={18} color={color("gray")} />}
                      onClick={(e) => {
                        e.stopPropagation();
                        onExitFolder();
                      }}
                    >
                      <Text fz={14} c="gray">
                        <Trans>Exit</Trans>
                      </Text>
                    </Menu.Item>
                  </Menu.Dropdown>
                </Menu>
              )}
            </Group>
          );
        }}
      />

      <ModalTagForm ref={modalTagFormRef} />
    </Group>
  );
};
