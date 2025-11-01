"use client";

import { DndContext, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { t } from "@lingui/core/macro";
import { ActionIcon, Group, Menu, MenuDropdown, Stack, ThemeIcon } from "@mantine/core";
import { IconColumns3, IconDotsVertical, IconEye, IconEyeOff } from "@tabler/icons-react";
import { type FC } from "react";
import { useListContext } from "../list-context";
import { Column } from "../types";
import { ActionButton } from "./action-button";

export const ColsSettings: FC = () => {
  const ctx = useListContext();

  if (ctx.viewState.view !== "table") return null;

  return (
    <Menu closeOnItemClick={false}>
      <Menu.Target>
        <Group>
          <ActionButton
            label={t`Columns`}
            icon={IconColumns3}
            quantity={Object.values(ctx.columns).filter((v) => v.isVisible).length}
            quantityColor="gray"
          />
        </Group>
      </Menu.Target>

      <MenuDropdown>
        <Columns />
      </MenuDropdown>
    </Menu>
  );
};

export function Columns() {
  const { setViewState, columns, viewState, changeColumnState } = useListContext();

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

        const oldIndex = columns.findIndex((v) => v.columnKey === active.id.toString());
        const newIndex = columns.findIndex((v) => v.columnKey === over?.id.toString());
        const items = arrayMove([...columns], oldIndex, newIndex);

        setViewState({
          ...viewState,
          columns: items.reduce((acc, column, i) => {
            return {
              ...acc,
              [column.columnKey]: { ...acc[column.columnKey], order: i },
            };
          }, viewState.columns),
        });
      }}
    >
      <Stack gap={0} align="stretch">
        <SortableContext
          items={columns.map((v) => v.columnKey)}
          strategy={verticalListSortingStrategy}
        >
          {columns.map((column) => {
            const toggleVisible = () => {
              changeColumnState(column.columnKey, { isHidden: !!column.isVisible });
            };

            if (!column) return null;

            return (
              <ColumnItem
                key={column.columnKey}
                columnKey={column.columnKey}
                column={column}
                toggleVisible={toggleVisible}
                isVisible={column.isVisible}
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

        {column.name || columnKey}
      </Group>

      <ActionIcon variant="subtle" size="sm" color="gray" onClick={toggleVisible}>
        {!isVisible ? <IconEyeOff strokeWidth={1.5} /> : <IconEye strokeWidth={1.5} />}
      </ActionIcon>
    </Group>
  );
}
