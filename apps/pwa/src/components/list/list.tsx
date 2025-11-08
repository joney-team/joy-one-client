"use client";

import { useList } from "@/components/list/use-list";
import { useLayout } from "@/layout/layout-context";
import { api } from "@/modules/apis";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { shiftSelect } from "@joy-one-client/utils/array";
import { Trans } from "@lingui/react/macro";
import {
  ActionIcon,
  Badge,
  Card,
  Center,
  Group,
  Loader,
  SimpleGrid,
  Stack,
  Text,
} from "@mantine/core";
import { IconRefresh } from "@tabler/icons-react";
import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { Empty } from "../empty";
import { Errored } from "../errored";
import { NumberFormat } from "../format/number-format";
import { WayPoint } from "../way-point";
import { BulkActions } from "./components/bulk-actions";
import { ColsSettings } from "./components/columns-setting";
import { CreateButton } from "./components/create-button";
import { ExportButton } from "./components/export-button";
import { ListFilterModes } from "./components/filter-modes";
import { ResetDefaultButton } from "./components/reset-default-button";
import { ToggleView } from "./components/toggle-view";
import { Filter, FilterBar } from "./filters";
import { Context } from "./list-context";
import { Sort } from "./sort/sort";
import ListTable from "./table/table";
import {
  BaseData,
  Column,
  ColumnState,
  ListContext,
  ListProps,
  ListViewState,
  TableColumn,
} from "./types";
import { cleanObject, getListDataId } from "./utils";

export function List<T extends BaseData>(props: ListProps<T>) {
  const [version, setVersion] = useState(0);
  const forceUpdate = () => setVersion((s) => s + 1);

  const layout = useLayout();
  const workspace = useWorkspace();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const listViewId = `vs_${props.id}_v2`;

  const [isSelectAll, setIsSelectAll] = useState(false);
  const [_selectedIds, setSelectedIds] = useState<string[]>([]);

  const defaultViewState: ListViewState = useMemo(
    () => ({
      view: layout.view === "desktop" ? "table" : props.card ? "grid" : "table",
      columns: {},
      activatedModes: [],
      isFilterVisible: false,
    }),
    [layout.view, props.card]
  );

  const viewStateRef = useRef<ListViewState>(defaultViewState);

  const stateParams: Record<string, any> = useMemo(() => {
    let params = { ...props.fixedParams };

    // Add activated modes to params
    props.filterModes?.forEach((mode) => {
      if (viewStateRef.current.activatedModes?.includes(mode.param) && !mode.disabled) {
        const includeParams = mode.params();
        params = { ...params, ...includeParams };
      }
    });

    return {
      ...props.fixedParams,
      ...params,
    };
  }, [props.fixedParams, props.filterModes, viewStateRef.current.activatedModes]);

  const list = useList<T>({
    id: props.id,
    limit: props.limit,
    isSkip: !isInitialized,
    params: stateParams,
    events: props.events,
    fetch: (fetchParams, controller) => {
      return api.get(props.route, {
        params: fetchParams,
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

  const setViewState = (viewState: ListViewState) => {
    viewStateRef.current = viewState;
    localStorage.setItem(listViewId, JSON.stringify(viewStateRef.current));
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
  };

  const refreshList = () => {
    setIsRefreshing(true);
    list.fetch(true, { isSilient: true }).finally(() => {
      setIsRefreshing(false);
    });
  };

  const resetDefault = () => {
    viewStateRef.current = defaultViewState;
    localStorage.removeItem(listViewId);
    list.removeAllParams({ isSilient: true });
    forceUpdate();
  };

  const selectedIds = useMemo(() => {
    if (isSelectAll) return list.data.map((v) => getListDataId(v));
    return list.data
      .filter((v) => _selectedIds.includes(getListDataId(v)))
      .map((v) => getListDataId(v));
  }, [_selectedIds, list.data, isSelectAll]);

  const availableMultipleSelectActions = useMemo(() => {
    return (props.bulkActions || []).filter(
      (v) =>
        (!v.available ||
          v.available(list.data.filter((i) => selectedIds.includes(getListDataId(i))))) &&
        (!v.permission || workspace.hasPermission(v.permission))
    );
  }, [props.bulkActions, list.data, selectedIds, workspace.hasPermission]);

  const columns = useMemo(() => {
    return Object.entries(props.columns)
      .reduce<TableColumn[]>((acc, [columnKey, columnValue], columnIndex) => {
        const state = viewStateRef.current.columns?.[columnKey] ?? {};
        const column = columnValue as Column<T>;
        if (!column) return acc;

        const defaultWidth = column.defaultWidth ?? column.minWidth ?? 120;
        const minWidth = column.minWidth ?? 100;

        return [
          ...acc,
          {
            ...column,
            columnKey,
            width: state.width ?? defaultWidth,
            minWidth,
            defaultWidth,
            isVisible: typeof state.isHidden === "boolean" ? state.isHidden : !column.defaultHidden,
            order: state.order ?? columnIndex,
            resizable: column.resizable ?? true,
            name: column.name ?? columnKey,
            pinned: state.pinned ?? column.defaultPinned ?? null,
          },
        ];
      }, [])
      .sort((a, b) => a.order - b.order);
  }, [props.columns, version, isInitialized]);

  const context: ListContext<T> = {
    ...props,
    resetDefault,
    actions: props.actions || [],
    viewState: viewStateRef.current,
    setViewState,
    list,
    spacing,
    toggleActivatedMode,
    columns,
    selectedIds,
    isBulkActionsActivated: availableMultipleSelectActions.length > 0,
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
    changeColumnState: (columnKey: string, state: Partial<ColumnState>) => {
      setViewState({
        ...viewStateRef.current,
        columns: {
          ...viewStateRef.current.columns,
          [columnKey]: cleanObject({
            ...viewStateRef.current.columns[columnKey],
            ...state,
          }),
        },
      });
    },
  };

  useEffect(() => {
    const _initialViewState = getInitialViewState();
    viewStateRef.current = { ..._initialViewState };
    setIsInitialized(true);
  }, [props.id]);

  if (!isInitialized) return null;

  const ListCard = props.card;

  return (
    <Context.Provider value={context}>
      <Stack id="List">
        <Card shadow="xs" p={0} w="100%" style={{ overflow: "visible" }}>
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
                      {props.name ?? <Trans>List</Trans>}
                    </Text>

                    <Group gap={3}>
                      <ActionIcon
                        loading={isRefreshing}
                        variant="subtle"
                        radius="50%"
                        color={list.newDataCount > 0 ? undefined : "gray"}
                        onClick={refreshList}
                      >
                        <IconRefresh size={16} strokeWidth={1.8} />
                      </ActionIcon>

                      {list.count > 0 && (
                        <Badge variant="light" color="dark" size="sm">
                          <NumberFormat value={list.count} />
                        </Badge>
                      )}

                      {list.newDataCount > 0 && (
                        <Badge
                          size="sm"
                          variant="light"
                          onClick={() => list.fetch(true, { isSilient: false })}
                        >
                          <Trans>
                            +<NumberFormat value={list.newDataCount || 0} /> new one
                          </Trans>
                        </Badge>
                      )}
                    </Group>
                  </Group>

                  {layout.view === "mobile" && (
                    <Group gap={5}>
                      <ListFilterModes />
                      <Filter />
                      <Sort />
                      <ExportButton />
                      <CreateButton />
                    </Group>
                  )}
                </Group>

                {layout.view !== "mobile" && (
                  <Group gap={8} justify="end">
                    <ListFilterModes />
                    <Filter />
                    <Sort />
                    <ColsSettings />
                    <ToggleView />
                    <ResetDefaultButton />
                    <ExportButton />
                    <CreateButton />
                  </Group>
                )}
              </Group>

              <FilterBar />

              {context.viewState.view === "table" && <ListTable />}
            </Stack>

            {context.viewState.view === "grid" && list.isEmpty && (
              <Stack w="100%" p={spacing}>
                {props.components?.empty ? <props.components.empty /> : <Empty hideBorder />}
              </Stack>
            )}
          </Stack>
        </Card>

        {context.viewState.view === "grid" && ListCard && (
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
          offset={350}
          onReached={() => list.fetch(false)}
        />

        <BulkActions {...context} />
      </Stack>

      <div id="list-name" style={{ visibility: "hidden", display: "none" }}>
        {context.name ?? <Trans>Data</Trans>}
      </div>

      {context.columns.map((col) => {
        return (
          <div
            key={col.columnKey}
            data-column-name-key={col.columnKey}
            style={{ visibility: "hidden", display: "none" }}
          >
            {col.name}
          </div>
        );
      })}
    </Context.Provider>
  );
}
