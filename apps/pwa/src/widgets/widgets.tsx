"use client";

import { Stack } from "@mantine/core";
import { WidgetItem } from "./components/widget-item";
import type { Widget, WidgetsContext, WidgetsProps, WidgetStorage } from "./widgets-types";

import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

import styles from "./widgets.module.css";

import {
  ContextMenuDropdown,
  ContextMenuItem,
} from "@/components/context-menu/context-menu-components";
import { ContextMenuProvider } from "@/components/context-menu/context-menu-provider";
import { ContextMenuDropdownComponentProps } from "@/components/context-menu/context-menu-types";
import { Empty } from "@/components/empty";
import { useWorkspaceLayout } from "@/layout/hooks/use-workspace-layout";
import { useLayout } from "@/layout/layout-context";
import { isDiff } from "@/utils/object.utils";
import { getId } from "@joy-one-client/utils/base-data";
import { Trans } from "@lingui/react/macro";
import { useClickOutside, useLocalStorage } from "@mantine/hooks";
import { IconPencil, IconPlusMinus, IconRefresh, IconTrash } from "@tabler/icons-react";
import { Fragment, useMemo, useState } from "react";
import ReactGridLayout, { type LayoutItem } from "react-grid-layout";
import { ManageWidgets } from "./components/manage-widgets";

const gridLayoutConfig = {
  cols: 12,
  rowHeight: 12,
};

export function Widgets<ContextType = object, WidgetType = string>(
  props: WidgetsProps<ContextType, WidgetType>,
) {
  const [state, setState] = useLocalStorage<WidgetStorage>({
    key: `wids:v1:${props.id}`,
    defaultValue: {},
  });

  const layout = useLayout();
  const workspaceLayout = useWorkspaceLayout();
  const readonly = props.readonly || !props.onChange;

  const [isManageWidgetsOpened, setIsManageWidgetsOpened] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const isChangeLayoutAble = layout.view === "desktop" && !props.readonly && isEditMode;
  const ref = useClickOutside(() => setIsEditMode(false));

  const widgets = useMemo(() => {
    return props.widgets ?? props.defaultWidgets ?? [];
  }, [props.widgets, props.defaultWidgets]);

  const normalizeGridLayout = (layout: LayoutItem[]): LayoutItem[] => {
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
    const gridLayout: LayoutItem[] = [];

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

  const gridLayout: LayoutItem[] = useMemo(() => {
    const stateLayoutItems: LayoutItem[] = state.layout ?? autoGridLayout(widgets);
    return normalizeGridLayout(stateLayoutItems);
  }, [props.id, widgets, autoGridLayout]);

  const onChangeLayout = (layout: LayoutItem[]) => {
    const diff = isDiff(normalizeGridLayout(layout), normalizeGridLayout(gridLayout));
    if (!isChangeLayoutAble || !diff) return;
    setState((state) => ({ ...state, layout: normalizeGridLayout(layout) }));
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
      widgets.map((v) => (v.id === id ? { ...v, state: { ...v.state, [key]: value } } : v)),
    );
  };

  const resetDefault = () => {
    props.onChange?.(null);
    setState({});
  };

  const widgetsContext: WidgetsContext<ContextType, WidgetType> = {
    widgets,
    remove: onRemove,
    context: props.context || ({} as ContextType),
    getState,
    updateState,
  };

  const width = useMemo(() => {
    return Math.max(
      layout.view === "mobile"
        ? layout.width - 16 * 2
        : layout.width - workspaceLayout.navigationWidth - 16 * 2,
      100,
    );
  }, [layout.view, layout.width, workspaceLayout.navigationWidth]);

  const layoutItems = useMemo(() => {
    return layout.view === "mobile" ? gridLayout.map((v) => ({ ...v, w: 12 })) : gridLayout;
  }, [layout.view, gridLayout]);

  return (
    <Fragment>
      <ContextMenuProvider
        dropdown={(contextMenu: ContextMenuDropdownComponentProps) => {
          const menuId = contextMenu.data ? getId(contextMenu.data) : null;

          return (
            <ContextMenuDropdown onClickOutside={contextMenu.onClose}>
              <ContextMenuItem
                icon={IconPencil}
                label={
                  isEditMode ? (
                    <Trans>Turn off editing layout</Trans>
                  ) : (
                    <Trans>Resize widget layout</Trans>
                  )
                }
                onClick={() => {
                  contextMenu.onClose();
                  setIsEditMode(!isEditMode);
                }}
              />
              <ContextMenuItem
                icon={IconPlusMinus}
                label={<Trans>Plus or remove widgets</Trans>}
                onClick={() => {
                  contextMenu.onClose();
                  setIsManageWidgetsOpened(true);
                }}
              />
              <ContextMenuItem
                icon={IconRefresh}
                label={<Trans>Reset default</Trans>}
                onClick={() => {
                  contextMenu.onClose();
                  resetDefault();
                }}
              />

              {menuId && menuId !== "board" && (
                <ContextMenuItem
                  icon={IconTrash}
                  label={<Trans>Remove widget</Trans>}
                  onClick={() => {
                    contextMenu.onClose();
                    onRemove(menuId);
                  }}
                />
              )}
            </ContextMenuDropdown>
          );
        }}
      >
        {(context) => (
          <Stack
            ref={ref}
            id="Widgets"
            mih={300}
            w="100%"
            className={styles.Widgets}
            onContextMenu={(e) => {
              e.preventDefault();
              context.open({ event: e, data: { id: "board" } });
            }}
          >
            {widgets.length > 0 ? (
              <ReactGridLayout
                key={props.id}
                width={width}
                layout={layoutItems}
                gridConfig={{
                  rowHeight: gridLayoutConfig.rowHeight,
                  cols: gridLayoutConfig.cols,
                  containerPadding: [0, 0],
                  margin: [16, 16],
                }}
                onLayoutChange={(layoutChanged) => onChangeLayout([...layoutChanged])}
                dragConfig={{ enabled: isChangeLayoutAble }}
                dropConfig={{ enabled: isChangeLayoutAble }}
                resizeConfig={{
                  enabled: isChangeLayoutAble,
                  handles: ["s", "w", "e", "n", "sw", "nw", "se", "ne"],
                }}
              >
                {widgets.map((w) => {
                  const mod = props.modules[w.type as keyof typeof props.modules];
                  if (!mod) return null;

                  return (
                    <div
                      key={w.id}
                      style={{
                        width: "100%",
                        height: "100%",
                        overflow: "visible",
                      }}
                      onContextMenu={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        context.open({ event: e, data: w });
                      }}
                    >
                      <WidgetItem
                        key={w.id}
                        id={w.id}
                        ctx={props.context || ({} as any)}
                        config={mod.config}
                        component={mod.component}
                        widgetsContext={widgetsContext as WidgetsContext<ContextType, string>}
                      />
                    </div>
                  );
                })}
              </ReactGridLayout>
            ) : (
              <Empty
                hideBorder
                mih={150}
                message={
                  readonly ? (
                    <Trans>No widgets</Trans>
                  ) : (
                    <Trans>Click right mouse button to add Widgets</Trans>
                  )
                }
              />
            )}
          </Stack>
        )}
      </ContextMenuProvider>

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
