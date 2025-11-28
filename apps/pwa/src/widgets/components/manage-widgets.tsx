"use client";

import { ModalTitle } from "@/components/modal-title";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { Trans, useLingui } from "@lingui/react/macro";
import { ActionIcon, Card, Group, Modal, Stack, Text, TextInput, Tooltip } from "@mantine/core";
import { IconBox, IconMinus, IconPlus, IconPuzzle, IconSearch } from "@tabler/icons-react";
import { useState } from "react";
import { v4 as uuid } from "uuid";
import { Widget, WidgetModule, WidgetModules } from "../types";

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
  const { t } = useLingui();

  return (
    <Modal
      opened={props.opened}
      onClose={props.onClose}
      title={<ModalTitle title={<Trans>Manage widgets</Trans>} icon={IconPuzzle} />}
    >
      <Stack>
        <TextInput
          placeholder={t`Search`}
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
            search.length > 0 && !mod.config.name().toLowerCase().includes(search.toLowerCase());

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
                  <Text>{mod.config.name()}</Text>
                </Group>

                <Group>
                  {isSelected ? (
                    <Tooltip label={t`Remove widget`}>
                      <ActionIcon variant="light" color="gray">
                        <IconMinus size={16} />
                      </ActionIcon>
                    </Tooltip>
                  ) : (
                    <Tooltip label={t`Add widget`}>
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
