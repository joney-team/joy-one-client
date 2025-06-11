"use client";

import { Stack } from "@mantine/core";
import { WidgetItem } from "./components/widget-item";
import type { Widget, WidgetsContext, WidgetsProps, WidgetStorage } from "./types";

import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import "./widget.css";

import { ContextMenu } from "@/components/context-menu";
import { Empty } from "@/components/empty";
import { useLayout } from "@/layout/layout-context";
import { useColor } from "@/modules/theme/use-color";
import { t } from "@/modules/lang/lang-service";
import { isDiff } from "@/utils/object.utils";
import { IconPencil, IconPlusMinus, IconRefresh, IconTrash } from "@tabler/icons-react";
import { Fragment, useMemo, useState } from "react";
import GridLayout, { Layout } from "react-grid-layout";
import { ManageWidgets } from "./components/manage-widgets";
import { useWorkspaceLayout } from "@/layout/hooks/use-workspace-layout";

const gridLayoutConfig = {
  storageVersion: "1.0",
  cols: 12,
  rowHeight: 12,
};

function findWidgetIdElement(element: HTMLElement | null, maxDepth: number = 100): string | null {
  let depth = 0;

  while (element && depth < maxDepth) {
    const widgetId = element.getAttribute("widget-id");
    if (widgetId) {
      return widgetId;
    }
    element = element.parentElement;
    depth++;
  }

  return null;
}

const getWidgetStorageKey = (id: string) => `wids:${id}`;

const defaultStorage: WidgetStorage = {
  version: gridLayoutConfig.storageVersion,
};

const getWidgetStorage = (id: string): WidgetStorage => {
  try {
    const widgetStorageId = getWidgetStorageKey(id);
    const cached = localStorage.getItem(widgetStorageId);
    const parsed = cached ? JSON.parse(cached) : null;
    if (!parsed || parsed.version !== gridLayoutConfig.storageVersion) {
      return defaultStorage;
    }
    return parsed;
  } catch {
    return defaultStorage;
  }
};

const setWidgetStorage = (id: string, func: (storage: WidgetStorage) => WidgetStorage) => {
  const storage = getWidgetStorage(id);
  localStorage.setItem(getWidgetStorageKey(id), JSON.stringify(func(storage)));
};

export function Widgets<ContextType = object, WidgetType = string>(
  props: WidgetsProps<ContextType, WidgetType>
) {
  const { id } = props;
  const layout = useLayout();
  const workspaceLayout = useWorkspaceLayout();
  const readonly = props.readonly || !props.onChange;

  const color = useColor();
  const [version, setVersion] = useState(0);
  const [isManageWidgetsOpened, setIsManageWidgetsOpened] = useState(false);
  const [pointedWidgetId, setPointedWidgetId] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const isChangeLayoutAble = layout.view === "desktop" && !props.readonly && isEditMode;

  const widgets = useMemo(() => {
    return props.widgets ?? props.defaultWidgets ?? [];
  }, [props.widgets, props.defaultWidgets]);

  const normalizeGridLayout = (layout: Layout[]): Layout[] => {
    return layout
      .map((v) => ({
        i: v.i,
        x: v.x,
        y: v.y,
        w: v.w,
        h: v.h,
        minH: v.minH,
        minW: v.minW,
      }))
      .filter((v) => widgets.some((w) => w.id === v.i));
  };

  const autoGridLayout = (widgets: Widget<WidgetType>[]) => {
    const gridLayout: Layout[] = [];

    for (let i = 0; i < widgets.length; i++) {
      let x = 0,
        y = 0;

      const widget = widgets[i];
      const widgetConfig = (props.modules as any)[widget.type]?.config;
      const widgetLayoutConfig = widgetConfig?.layout ?? {};
      const widgetLayout = {
        w: widgetLayoutConfig?.initW ?? 4,
        h: widgetLayoutConfig?.initH ?? 3,
      };

      const lastGrid = gridLayout[gridLayout.length - 1];
      const isXOverflow =
        !!lastGrid && lastGrid.x + lastGrid.w + widgetLayout.w > gridLayoutConfig.cols;

      if (isXOverflow) {
        x = 0;
      } else {
        x = lastGrid ? lastGrid.x + lastGrid.w : 0;
      }

      // Calculate y based on previous layouts
      if (isXOverflow) {
        // If x overflows, find highest y + h from previous layouts
        y = gridLayout.reduce((maxY, grid) => {
          return Math.max(maxY, grid.y + grid.h);
        }, 0);
      } else {
        // Otherwise use same y as previous layout
        y = lastGrid ? lastGrid.y : 0;
      }

      gridLayout.push({
        i: widget.id,
        x: x,
        y: y,
        w: widgetLayoutConfig?.initW ?? 4,
        h: widgetLayoutConfig?.initH ?? 3,
        minH: widgetLayoutConfig?.minH,
        minW: widgetLayoutConfig?.minW,
        maxH: widgetLayoutConfig?.maxH,
        maxW: widgetLayoutConfig?.maxW,
      });
    }

    return gridLayout;
  };

  const gridLayout: Layout[] = useMemo(() => {
    let layout: Layout[] = autoGridLayout(widgets);

    try {
      const storage = getWidgetStorage(id);
      if (storage.layout) layout = storage.layout;
    } catch {}

    return normalizeGridLayout(layout);
  }, [props.id, widgets, autoGridLayout, version]);

  const onChangeLayout = (layout: Layout[]) => {
    const diff = isDiff(normalizeGridLayout(layout), normalizeGridLayout(gridLayout));
    if (!isChangeLayoutAble || !diff) return;
    setWidgetStorage(id, (storage) => ({
      ...storage,
      layout: normalizeGridLayout(layout),
    }));
  };

  const onRemove = (id: string) => {
    props.onChange?.(widgets.filter((v) => v.id !== id));
  };

  const getState = (id: string, key: string) => {
    const w = widgets.find((v) => v.id === id);
    const mo = w ? (props.modules as any)[w.type] : null;
    if (!w || !mo) return undefined;
    if (w.state && typeof w.state[key] !== "undefined") return w.state[key];
    if (mo.config.defaultState && typeof mo.config.defaultState[key] !== "undefined")
      return mo.config.defaultState[key];
    return undefined;
  };

  const updateState = (id: string, key: string, value: any) => {
    props.onChange?.(
      widgets.map((v) => (v.id === id ? { ...v, state: { ...v.state, [key]: value } } : v))
    );
  };

  const resetDefault = () => {
    props.onChange?.(null);
    setWidgetStorage(id, () => defaultStorage);
    setVersion(version + 1);
  };

  const widgetsContext: WidgetsContext<ContextType, WidgetType> = {
    widgets,
    remove: onRemove,
    context: props.context || ({} as ContextType),
    getState,
    updateState,
  };

  const width =
    layout.view === "mobile"
      ? layout.width - 16 * 2
      : layout.width - workspaceLayout.navigationWidth - 16 * 2;

  return (
    <Fragment>
      <ContextMenu
        disabled={readonly}
        position="bottom-start"
        onOpen={(e) => {
          if (readonly) return;
          const widgetId = findWidgetIdElement(e.target as HTMLElement);
          const widget = widgets.find((v) => v.id === widgetId);
          setPointedWidgetId(widget?.id ?? null);
        }}
        onClose={() => setPointedWidgetId(null)}
      >
        <ContextMenu.Target>
          <Stack mih={300} style={{ width: "100%" }}>
            {widgets.length > 0 ? (
              <GridLayout
                key={version}
                width={width}
                layout={
                  layout.view === "mobile" ? gridLayout.map((v) => ({ ...v, w: 12 })) : gridLayout
                }
                rowHeight={gridLayoutConfig.rowHeight}
                cols={gridLayoutConfig.cols}
                containerPadding={[0, 0]}
                margin={[16, 16]}
                onLayoutChange={onChangeLayout}
                isDraggable={isChangeLayoutAble}
                isResizable={isChangeLayoutAble}
                resizeHandles={["s", "w", "e", "n", "sw", "nw", "se", "ne"]}
              >
                {widgets.map((w) => {
                  const isPointed = pointedWidgetId === w.id;
                  const mod = (props.modules as any)[w.type];
                  if (!mod) return null;

                  return (
                    <Stack
                      key={w.id}
                      style={{
                        width: "100%",
                        height: "100%",
                        overflow: "visible",
                        borderRadius: "var(--mantine-radius-md)",
                        border: `1px solid ${isPointed ? color("primary.4") : "transparent"}`,
                      }}
                    >
                      <WidgetItem
                        key={w.id}
                        id={w.id}
                        ctx={props.context || ({} as any)}
                        config={mod.config}
                        component={mod.component}
                        widgetsContext={widgetsContext}
                      />
                    </Stack>
                  );
                })}
              </GridLayout>
            ) : (
              <Empty hideBorder mih={150} message={readonly ? "no_widgets" : "no_widgets_cta"} />
            )}
          </Stack>
        </ContextMenu.Target>

        <ContextMenu.Dropdown>
          <ContextMenu.Item
            fz={14}
            leftSection={<IconPencil size={16} />}
            onClick={() => setIsEditMode(!isEditMode)}
          >
            {t(isEditMode ? "disable" : "enable")} {t("resize_widget_layout").toLowerCase()}
          </ContextMenu.Item>

          <ContextMenu.Item
            fz={14}
            leftSection={<IconPlusMinus size={16} />}
            onClick={() => setIsManageWidgetsOpened(true)}
          >
            {t("manage-widgets")}
          </ContextMenu.Item>

          <ContextMenu.Item fz={14} leftSection={<IconRefresh size={16} />} onClick={resetDefault}>
            {t("reset_default")}
          </ContextMenu.Item>

          {pointedWidgetId && (
            <ContextMenu.Item
              color="red"
              fz={14}
              leftSection={<IconTrash size={16} />}
              onClick={() => onRemove(pointedWidgetId)}
            >
              {t("remove")} Widget
            </ContextMenu.Item>
          )}
        </ContextMenu.Dropdown>
      </ContextMenu>

      {!readonly && (
        <ManageWidgets
          widgets={widgets}
          modules={props.modules}
          onChange={props.onChange!}
          opened={isManageWidgetsOpened}
          onClose={() => setIsManageWidgetsOpened(false)}
        />
      )}
    </Fragment>
  );
}
