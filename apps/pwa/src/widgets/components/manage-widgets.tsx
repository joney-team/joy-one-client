"use client";

import { ModalTitle } from "@/components/modal-title";
import { t, tMulti } from "@/modules/lang/lang-service";
import { ActionIcon, Card, Group, Modal, Stack, Text, TextInput, Tooltip } from "@mantine/core";
import { IconBox, IconMinus, IconPlus, IconPuzzle, IconSearch } from "@tabler/icons-react";
import { useState } from "react";
import { v4 as uuid } from "uuid";
import { Widget, WidgetModule, WidgetModules } from "../types";
import { useWorkspace } from "@/modules/workspaces/workspace-context";

interface ManageWidgetsProps<WidgetContextType = any, WidgetType = string> {
  widgets: Widget<WidgetType>[];
  modules: WidgetModules<WidgetContextType, WidgetType>;
  onChange: (widgets: Widget<WidgetType>[]) => void;
  opened: boolean;
  onClose: () => void;
}

export function ManageWidgets<WidgetContextType = any, WidgetType = string>(
  props: ManageWidgetsProps<WidgetContextType, WidgetType>
) {
  const workspace = useWorkspace();
  const [search, setSearch] = useState("");

  return (
    <Modal
      opened={props.opened}
      onClose={props.onClose}
      title={<ModalTitle title="manage-widgets" icon={IconPuzzle} />}
    >
      <Stack>
        <TextInput
          placeholder={t("search")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          leftSection={<IconSearch size={16} />}
          styles={{
            input: {
              borderRadius: 50,
            },
          }}
        />

        {Object.entries<WidgetModule<WidgetContextType>>(props.modules).map(([key, mod]) => {
          const Icon = mod.config.icon || IconBox;
          const isSelected = props.widgets.some((v) => v.type === key);

          const isHideByWorkspaceType =
            mod.config.workspaceTypes && !mod.config.workspaceTypes.includes(workspace.type);
          const isHideBySearch =
            search.length > 0 && !t(mod.config.name).toLowerCase().includes(search.toLowerCase());

          if (isHideByWorkspaceType || isHideBySearch) return null;

          const onClick = () => {
            if (isSelected) {
              props.onChange(props.widgets.filter((v) => v.type !== (key as WidgetType)));
            } else {
              props.onChange([...props.widgets, { type: key as WidgetType, id: uuid() }]);
            }
          };

          return (
            <Card
              key={key}
              withBorder
              shadow="none"
              radius="md"
              className="clickable"
              onClick={onClick}
            >
              <Group justify="space-between">
                <Group gap={10}>
                  <Icon strokeWidth={1.5} />
                  <Text>{t(mod.config.name)}</Text>
                </Group>

                <Group>
                  {isSelected ? (
                    <Tooltip label={tMulti(["remove"], ["widget"])}>
                      <ActionIcon variant="light" color="gray">
                        <IconMinus size={16} />
                      </ActionIcon>
                    </Tooltip>
                  ) : (
                    <Tooltip label={tMulti(["add"], ["widget"])}>
                      <ActionIcon>
                        <IconPlus size={16} />
                      </ActionIcon>
                    </Tooltip>
                  )}
                </Group>
              </Group>
            </Card>
          );
        })}
      </Stack>
    </Modal>
  );
}
