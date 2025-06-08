import { type FC } from "react";
import { DndContext, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ActionIcon, Group, Menu, MenuDropdown, Stack, ThemeIcon } from "@mantine/core";
import { IconColumns3, IconDotsVertical, IconEye, IconEyeOff } from "@tabler/icons-react";
import { ListContext, Column } from "../types";
import { ActionButton } from "./action-button";
import { t } from "@/modules/lang/lang-service";

export const ColsSettings: FC<ListContext> = (ctx) => {
  if (ctx.viewState.view !== "table") return null;

  return (
    <Menu closeOnItemClick={false}>
      <Menu.Target>
        <Group>
          <ActionButton
            label="cols"
            icon={IconColumns3}
            quantity={ctx.columnSettings.filter((v) => v.isVisible).length}
            quantityColor="gray"
          />
        </Group>
      </Menu.Target>

      <MenuDropdown>
        <Columns {...ctx} />
      </MenuDropdown>
    </Menu>
  );
};

export function Columns<T = any>(ctx: ListContext<T>) {
  const { setViewState, viewState, columnSettings: cols } = ctx;

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
        let items = [...cols];

        const oldIndex = items.findIndex((v) => v.id === active.id.toString());
        const newIndex = items.findIndex((v) => v.id === over?.id.toString());
        items = arrayMove(items, oldIndex, newIndex);

        setViewState({
          ...viewState,
          columnSettings: items.map((v, i) => ({
            ...v,
            order: i,
          })),
        });
      }}
    >
      <Stack gap={0} align="stretch">
        <SortableContext items={cols} strategy={verticalListSortingStrategy}>
          {cols.map((columnSetting) => {
            const column = ctx.columns[columnSetting.id as keyof T];

            const isVisible = cols.some((v) => v.id === columnSetting.id && v.isVisible);
            const toggleVisible = () =>
              setViewState({
                ...viewState,
                columnSettings: cols.map((v) => (v.id === columnSetting.id ? { ...v, isVisible: !v.isVisible } : v)),
              });

            if (!column) return null;

            return (
              <ColumnItem
                key={columnSetting.id}
                columnKey={columnSetting.id}
                column={column}
                toggleVisible={toggleVisible}
                isVisible={isVisible}
              />
            );
          })}
        </SortableContext>
      </Stack>
    </DndContext>
  );
}

function ColumnItem<T = any>(props: {
  columnKey: string;
  column: Column<T, T[keyof T]>;
  toggleVisible: () => void;
  isVisible: boolean;
}) {
  const { columnKey, column, toggleVisible, isVisible } = props;

  const sortable = useSortable({ id: columnKey, data: { columnKey } });

  return (
    <Group
      justify="space-between"
      pl={0}
      pr={4.8}
      py={8}
      ref={sortable.setNodeRef}
      {...sortable.attributes}
      {...sortable.listeners}
      style={{
        cursor: "pointer",
        transform: CSS.Transform.toString(sortable.transform),
        transition: sortable.transition,
      }}
      wrap="nowrap"
    >
      <Group gap={3}>
        <ThemeIcon variant="subtle" size="sm" color="gray">
          <IconDotsVertical size={16} />
        </ThemeIcon>

        {t(column.name || columnKey)}
      </Group>

      <ActionIcon variant="subtle" size="sm" color="gray" onClick={toggleVisible}>
        {!isVisible ? <IconEyeOff strokeWidth={1.5} /> : <IconEye strokeWidth={1.5} />}
      </ActionIcon>
    </Group>
  );
}
