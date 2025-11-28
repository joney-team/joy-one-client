"use client";

import { Renderer } from "@/components/renderer";
import { useLayout } from "@/layout/layout-context";
import { InputModalType, OnModalInput } from "@/modals/modal-input";
import { WorkspaceViewComponent } from "@/modules/workspace-settings/workspace-settings-types";
import { WorkspaceModuleSelector } from "@/modules/workspaces/components/workspace-module-selector";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { getDefaultWorkspaceView } from "@/modules/workspaces/workspace-view";
import { DndContext, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Trans } from "@lingui/react/macro";
import {
  ActionIcon,
  Badge,
  Card,
  Container,
  Divider,
  Group,
  Stack,
  Text,
  ThemeIcon,
  Tooltip,
} from "@mantine/core";
import { useDebouncedValue, useListState, UseListStateHandlers } from "@mantine/hooks";
import {
  IconLayout,
  IconLibraryPlus,
  IconMinus,
  IconPlus,
  IconRefresh,
  IconSeparator,
} from "@tabler/icons-react";
import { type FC, useEffect, useRef, useState } from "react";
import { v4 as uuid } from "uuid";

export const WorkspaceModuleSetup: FC = () => {
  const workspace = useWorkspace();
  const layout = useLayout();
  const [components, handleComponents] = useListState(
    workspace.view.menu ?? getDefaultWorkspaceView(workspace.type).menu ?? []
  );

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 10,
      },
    })
  );

  const onAddDivier = () => {
    OnModalInput({
      type: InputModalType.TEXT,
      title: <Trans>Divider</Trans>,
      label: <Trans>Name</Trans>,
      icon: IconSeparator,
      onDone: (v) => {
        handleComponents.append({ id: uuid(), moduleId: v, type: "DIVIDER", dividerName: v });
      },
    });
  };

  const isUpdateAble = useRef(false);
  const [debounced] = useDebouncedValue(components, 300);

  useEffect(() => {
    layout.setComponents({
      head: <Trans>Modules</Trans>,
    });

    setTimeout(() => (isUpdateAble.current = true), 200);
  }, []);

  useEffect(() => {
    if (isUpdateAble.current) {
      workspace.setView({ ...workspace.view, menu: debounced });
    }
  }, [debounced]);

  const onReset = async () => {
    isUpdateAble.current = false;
    const _view = await workspace.setView({ ...workspace.view, menu: null });
    handleComponents.setState(_view.menu || []);
    setTimeout(() => (isUpdateAble.current = true), 500);
  };

  return (
    <Container size={600} p={16}>
      <Stack gap={10}>
        <Group justify="space-between">
          <Group gap={10} flex={1}>
            <ThemeIcon variant="light">
              <IconLayout size={20} />
            </ThemeIcon>

            <Text fw={600}>
              <Trans>Navigator</Trans>
            </Text>
          </Group>

          <Group gap={3}>
            <Tooltip label={<Trans>Reset default</Trans>}>
              <ActionIcon variant="subtle" color="dark" onClick={onReset}>
                <IconRefresh strokeWidth={1.5} size={18} />
              </ActionIcon>
            </Tooltip>

            <Tooltip label={<Trans>Add divider</Trans>}>
              <ActionIcon variant="subtle" color="dark" onClick={onAddDivier}>
                <IconPlus strokeWidth={1.5} size={18} />
              </ActionIcon>
            </Tooltip>

            <WorkspaceModuleSelector
              restrictDisplay={["navigation"]}
              excludeIds={components
                .filter((v) => v.type === "MODULE" && !!v.moduleId)
                .map((v) => v.moduleId!!)}
              onSelect={(mo) => {
                handleComponents.append({ id: uuid(), moduleId: mo.id as any, type: "MODULE" });
              }}
              target={(ctx) => {
                return (
                  <Tooltip label={<Trans>Add modules</Trans>}>
                    <ActionIcon variant="subtle" color="dark" onClick={ctx.toggle}>
                      <IconLibraryPlus strokeWidth={1.5} size={18} />
                    </ActionIcon>
                  </Tooltip>
                );
              }}
            />
          </Group>
        </Group>

        <Card withBorder p={10}>
          <DndContext
            sensors={sensors}
            onDragEnd={(e) => {
              const { active, over } = e;
              if (!over || active.id === over?.id) return;
              let items = [...components];

              const oldIndex = items.findIndex((v) => v.id === active.id.toString());
              const newIndex = items.findIndex((v) => v.id === over?.id.toString());
              items = arrayMove(items, oldIndex, newIndex);
              handleComponents.setState(items);
            }}
          >
            <Stack gap={5}>
              <SortableContext
                items={components.map((v) => v.id)}
                strategy={verticalListSortingStrategy}
              >
                {components.map((cpn) => {
                  return (
                    <ComponentItem
                      key={cpn.id}
                      cpn={cpn}
                      components={components}
                      handler={handleComponents}
                    />
                  );
                })}
              </SortableContext>
            </Stack>
          </DndContext>
        </Card>
      </Stack>
    </Container>
  );
};

const ComponentItem: FC<{
  cpn: WorkspaceViewComponent;
  components: WorkspaceViewComponent[];
  handler: UseListStateHandlers<WorkspaceViewComponent>;
}> = (props) => {
  const workspace = useWorkspace();
  const { cpn } = props;
  const sortable = useSortable({ id: cpn.id, data: cpn });
  const [isHovered, setIsHovered] = useState(false);
  const workspaceModule = cpn.moduleId ? workspace.getAvailableModule(cpn.moduleId) : null;

  const style = {
    transform: CSS.Transform.toString(sortable.transform),
    transition: sortable.transition,
  };

  const onRemove = () => {
    props.handler.remove(props.components.findIndex((v) => v.id === cpn.id));
  };

  return (
    <Group
      px={8}
      py={cpn.type === "DIVIDER" ? 0 : 10}
      gap={5}
      onMouseOver={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        cursor: "pointer",
        borderRadius: 8,
        backgroundColor: isHovered ? "rgba(0,0,0,0.05)" : "transparent",
        ...style,
      }}
      ref={sortable.setNodeRef}
      {...sortable.attributes}
      {...sortable.listeners}
      wrap="nowrap"
    >
      <Group justify="space-between" w="100%">
        {!!workspaceModule ? (
          <Group align="center" flex={1}>
            <ThemeIcon color="dark" variant="transparent">
              <workspaceModule.icon size={26} strokeWidth={1.5} />
            </ThemeIcon>

            <Text>{workspaceModule.name}</Text>

            <Renderer visible={!!workspaceModule.isBeta}>
              <Badge color="orange" size="xs">
                Beta
              </Badge>
            </Renderer>
          </Group>
        ) : (
          <Divider w="100%" label={cpn.dividerName} labelPosition="left" tt="capitalize" py={10} />
        )}
      </Group>

      <ActionIcon variant="subtle" color="gray" onClick={onRemove} opacity={isHovered ? 1 : 0}>
        <IconMinus strokeWidth={1.5} />
      </ActionIcon>
    </Group>
  );
};
