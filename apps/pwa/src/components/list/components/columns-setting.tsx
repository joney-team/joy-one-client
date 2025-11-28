"use client";

import { useColor } from "@/modules/theme/use-color";
import { DndContext, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Trans } from "@lingui/react/macro";
import { ActionIcon, Group, Menu, MenuDropdown, Stack, ThemeIcon, Tooltip } from "@mantine/core";
import {
  IconColumns3,
  IconDotsVertical,
  IconEye,
  IconEyeOff,
  IconLayoutSidebarLeftCollapse,
  IconLayoutSidebarLeftCollapseFilled,
  IconLayoutSidebarRightCollapse,
  IconLayoutSidebarRightCollapseFilled,
} from "@tabler/icons-react";
import { type FC } from "react";
import { useListContext } from "../list-context";
import { ColumnState, TableColumn } from "../types";
import { ActionButton } from "./action-button";

export const ColsSettings: FC = () => {
  const ctx = useListContext();

  if (ctx.viewState.view !== "table") return null;

  return (
    <Menu closeOnItemClick={false}>
      <Menu.Target>
        <Group>
          <ActionButton
            label={<Trans>Columns</Trans>}
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
            return (
              <ColumnItem
                key={column.columnKey}
                column={column}
                onChange={(state) => changeColumnState(column.columnKey, state)}
              />
            );
          })}
        </SortableContext>
      </Stack>
    </DndContext>
  );
}

function ColumnItem<T = any>({
  column,
  onChange,
}: {
  column: TableColumn<T>;
  onChange: (state: Partial<ColumnState>) => void;
}) {
  const color = useColor();
  const sortable = useSortable({ id: column.columnKey, data: { columnKey: column.columnKey } });

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
      <Group gap={3} flex={1}>
        <ThemeIcon variant="subtle" size="sm" color="gray" style={{ cursor: "move" }}>
          <IconDotsVertical size={16} />
        </ThemeIcon>

        {column.name}
      </Group>

      <Group gap={5}>
        <Tooltip
          label={
            column.pinned === "left" ? <Trans>Click to unpin</Trans> : <Trans>Pin to left</Trans>
          }
        >
          <ActionIcon
            variant="subtle"
            size="sm"
            color={column.pinned === "left" ? color("primary") : "gray"}
            onClick={() => onChange({ pinned: column.pinned === "left" ? null : "left" })}
          >
            {column.pinned === "left" ? (
              <IconLayoutSidebarLeftCollapseFilled strokeWidth={1.5} />
            ) : (
              <IconLayoutSidebarLeftCollapse strokeWidth={1.5} />
            )}
          </ActionIcon>
        </Tooltip>

        <Tooltip
          label={
            column.pinned === "right" ? <Trans>Click to unpin</Trans> : <Trans>Pin to right</Trans>
          }
        >
          <ActionIcon
            variant="subtle"
            size="sm"
            color={column.pinned === "right" ? color("primary") : "gray"}
            onClick={() => onChange({ pinned: column.pinned === "right" ? null : "right" })}
          >
            {column.pinned === "right" ? (
              <IconLayoutSidebarRightCollapseFilled strokeWidth={1.5} />
            ) : (
              <IconLayoutSidebarRightCollapse strokeWidth={1.5} />
            )}
          </ActionIcon>
        </Tooltip>

        <Tooltip
          label={column.isVisible ? <Trans>Click to hide</Trans> : <Trans>Click to show</Trans>}
        >
          <ActionIcon
            variant="subtle"
            size="sm"
            color={column.isVisible ? "dark" : "gray"}
            onClick={() => onChange({ isHidden: !column.isVisible })}
          >
            {!column.isVisible ? <IconEyeOff strokeWidth={1.5} /> : <IconEye strokeWidth={1.5} />}
          </ActionIcon>
        </Tooltip>
      </Group>
    </Group>
  );
}
