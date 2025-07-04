"use client";

import { useLayout } from "@/layout/layout-context";
import { api } from "@/modules/apis";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { shiftSelect } from "@joy-one-client/utils/array";
import { Badge, Card, Center, Group, Loader, SimpleGrid, Stack, Text } from "@mantine/core";
import { useForceUpdate } from "@mantine/hooks";
import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { Empty } from "../empty";
import { Errored } from "../errored";
import { Renderer } from "../renderer";
import { WayPoint } from "../way-point";
import { ColsSettings } from "./components/columns-setting";
import { CreateButton } from "./components/create-button";
import { ExportButton } from "./components/export-button";
import { ListFilterModes } from "./components/filter-modes";
import { ToggleView } from "./components/toggle-view";
import { Filter, FilterBar } from "./filters";
import { ListContext, ListProps, ListViewState } from "./types";
import { getListDataId } from "./utils";
import { useList } from "@/utils/use-list.util";
import { useEventsListener } from "@/modules/events/event-service";
import { num, t } from "@/modules/lang/lang-service";
import { BulkActions } from "./components/bulk-actions";
import ListTable from "./table/table";
import { Sort } from "./sort/sort";

export function List<T = any>(props: ListProps<T>) {
  const forceUpdate = useForceUpdate();
  const layout = useLayout();
  const workspace = useWorkspace();

  const [isInitialized, setIsInitialized] = useState(false);
  const listViewId = `vs_${props.id}_v1`;

  const [isSelectAll, setIsSelectAll] = useState(false);
  const [_selectedIds, setSelectedIds] = useState<string[]>([]);

  const defaultViewState: ListViewState = {
    view: layout.view === "desktop" ? "table" : props.card ? "grid" : "table",
    columnSettings: [],
    isFilterVisible: false,
    activatedModes: [],
  };

  const initialViewState = useRef<ListViewState>(defaultViewState);
  const viewStateRef = useRef<ListViewState>(defaultViewState);

  const list = useList<T>({
    id: props.id,
    limit: props.limit,
    isSkip: !isInitialized,
    fetch: (p, controller) => {
      let params = { ...p };

      // Add activated modes to params
      props.filterModes?.forEach((mode) => {
        if (viewStateRef.current.activatedModes?.includes(mode.param) && !mode.disabled) {
          const includeParams = mode.params();
          params = { ...params, ...includeParams };
        }
      });

      if ("fetch" in props) {
        return props.fetch(params, controller);
      }

      return api.get(props.route, {
        params: { ...props.params, ...params },
        signal: controller?.signal,
      });
    },
  });

  const getInitialViewState = () => {
    try {
      const viewStateCached = localStorage.getItem(listViewId);
      if (!viewStateCached) return defaultViewState;

      const parsed = JSON.parse(viewStateCached);
      return parsed;
    } catch (error) {
      return defaultViewState;
    }
  };

  const spacing = 10;
  const isViewStateChanged =
    JSON.stringify(initialViewState.current) !== JSON.stringify(viewStateRef.current);

  const onSaveViewState = () => {
    if (!isViewStateChanged) return;
    initialViewState.current = viewStateRef.current;
    localStorage.setItem(listViewId, JSON.stringify(viewStateRef.current));
    forceUpdate();
  };

  const setViewState = (viewState: ListViewState) => {
    viewStateRef.current = viewState;
    forceUpdate();
  };

  const toggleActivatedMode = (mode: string) => {
    let activatedModes = viewStateRef.current.activatedModes || [];
    const isActivated = activatedModes.includes(mode);

    if (isActivated) {
      activatedModes = activatedModes.filter((v) => v !== mode);
    } else {
      activatedModes = [...activatedModes, mode];
    }

    viewStateRef.current.activatedModes = activatedModes;
    forceUpdate();
    list.fetch(true, { isSilient: false });
  };

  useEffect(() => {
    if (isInitialized && isViewStateChanged) {
      localStorage.setItem(listViewId, JSON.stringify(viewStateRef.current));
    }
  }, [isInitialized, listViewId, isViewStateChanged, viewStateRef.current]);

  const selectedIds = useMemo(() => {
    if (isSelectAll) return list.data.map((v) => getListDataId(v));
    return list.data
      .filter((v) => _selectedIds.includes(getListDataId(v)))
      .map((v) => getListDataId(v));
  }, [_selectedIds, list.data, isSelectAll]);

  const availableMultipleSelectActions = useMemo(() => {
    return (props.multipleSelectActions || []).filter(
      (v) =>
        (!v.available ||
          v.available(list.data.filter((i) => selectedIds.includes(getListDataId(i))))) &&
        (!v.permission || workspace.hasPermission(v.permission))
    );
  }, [props.multipleSelectActions, list.data, selectedIds, workspace.hasPermission]);

  const ctx: ListContext<T> = {
    viewState: viewStateRef.current,
    setViewState,
    list,
    ...props,
    spacing,
    isViewStateChanged,
    onSaveViewState,
    toggleActivatedMode,
    columnSettings: Object.keys(props.columns)
      .filter((v) => !props.columns[v as keyof T]?.disabled)
      .map((v, i) => {
        const columnSetting = viewStateRef.current.columnSettings?.find((s) => s.id === v);
        const column = props.columns[v as keyof T];

        return {
          id: v,
          name: column?.name || v,
          order: columnSetting ? columnSetting.order : i,
          isVisible: columnSetting ? columnSetting.isVisible : !column?.isDefaultHide,
        };
      })
      .sort((a, b) => a.order - b.order),
    selectedIds,
    isShowMultipleSelectActions: availableMultipleSelectActions.length > 0,
    availableMultipleSelectActions,
    select: (id, isShiftKey) => {
      if (isShiftKey) {
        const output = shiftSelect(
          list.data.map((v) => getListDataId(v)),
          id,
          selectedIds,
          selectedIds[selectedIds.length - 1]
        );
        setSelectedIds(output);
      } else {
        setSelectedIds([...selectedIds, id]);
      }
    },
    unselect: (id) => setSelectedIds(selectedIds.filter((v) => v !== id)),
    selectAll: () => setIsSelectAll(true),
    unselectAll: () => {
      setSelectedIds([]);
      setIsSelectAll(false);
    },
  };

  useEffect(() => {
    const _initialViewState = getInitialViewState();
    initialViewState.current = { ..._initialViewState };
    viewStateRef.current = { ..._initialViewState };
    setIsInitialized(true);
  }, [props.id]);

  useEventsListener(
    props.events || [],
    () => {
      if (list.isInitialized) {
        list.fetch(true, { isSilient: true });
      }
    },
    [props.id, list.isInitialized, list.query]
  );

  if (!isInitialized) return null;

  const ListCard = props.card;

  return (
    <Stack>
      <Card shadow="xs" p={0} w="100%">
        <Stack>
          <Stack gap={0} w="100%">
            <Group p={spacing} gap={spacing} justify="space-between">
              <Group
                pl={spacing * 0.5}
                justify={layout.view === "mobile" ? "space-between" : "start"}
                w={layout.view === "mobile" ? "100%" : "unset"}
              >
                <Group gap={spacing * 0.8} align="center">
                  {props.icon && (
                    <props.icon size={22} color="var(--mantine-color-bright)" strokeWidth={1.5} />
                  )}
                  <Text fw={500} fz={14} c="var(--mantine-color-bright)">
                    {t(props.name || "list")}
                  </Text>

                  {list.count > 0 && (
                    <Badge variant="light" color="dark" size="xs">
                      {num(list.count)}
                    </Badge>
                  )}
                </Group>

                <Renderer views={["mobile"]}>
                  <Group gap={5}>
                    <ListFilterModes {...ctx} />
                    <Filter {...ctx} />
                    <Sort {...ctx} />
                    <ExportButton {...ctx} />
                    <CreateButton {...ctx} />
                  </Group>
                </Renderer>
              </Group>

              <Renderer views={["desktop", "tablet"]}>
                <Group gap={8} justify="end">
                  <ListFilterModes {...ctx} />
                  <Filter {...ctx} />
                  <Sort {...ctx} />
                  <ColsSettings {...ctx} />
                  <ExportButton {...ctx} />
                  <ToggleView {...ctx} />
                  <CreateButton {...ctx} />
                </Group>
              </Renderer>
            </Group>

            <FilterBar {...ctx} />

            {viewStateRef.current.view === "table" && (
              <Stack
                style={{
                  maxWidth: "100%",
                  overflowX: "auto",
                }}
              >
                <ListTable {...ctx} />
              </Stack>
            )}
          </Stack>

          <Renderer visible={viewStateRef.current.view === "grid" && list.isEmpty}>
            <Stack w="100%" p={spacing}>
              {props.components?.empty ? <props.components.empty /> : <Empty hideBorder />}
            </Stack>
          </Renderer>
        </Stack>
      </Card>

      {viewStateRef.current.view === "grid" && ListCard && (
        <Fragment>
          <SimpleGrid cols={{ md: 3 }}>
            {list.data.map((item) => {
              return <ListCard key={getListDataId(item)} data={item} />;
            })}
          </SimpleGrid>

          {list.isFetching && (
            <Center p={spacing}>
              <Loader size="sm" type="dots" color="gray" />
            </Center>
          )}

          {list.isHasError && (
            <Center p={spacing}>
              <Errored error={list.error} />
            </Center>
          )}
        </Fragment>
      )}

      <WayPoint
        enabled={list.isAbleToLoadMore}
        offset={300}
        onReached={() => list.fetch(false, {})}
      />

      <BulkActions {...ctx} />
    </Stack>
  );
}
