"use client";

import { useGraphqlList } from "@/components/list/use-graphql-list";
import { useLayout } from "@/layout/layout-context";
import { apiClient } from "@/modules/apis";
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
  Skeleton,
  Stack,
  Text,
} from "@mantine/core";
import { IconRefresh } from "@tabler/icons-react";
import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { Empty } from "../empty";
import { Errored } from "../errored";
import { NumberFormat } from "../format/number-format";
import { WayPoint } from "../way-point";
import { Context } from "./list-context";
import { cleanObject, generateDefaultViewState } from "./list-utils";

import { nonLoading } from "@/utils/non-loading";
import { type BaseData, getId } from "@joy-one-client/utils/base-data";
import dynamic from "next/dynamic";
import { Column, ColumnState, ListContext, ListProps, ListViewState, TableColumn } from "./types";

const ListTable = dynamic(() => import("./table/table"), {
  ssr: false,
  loading: () => <Skeleton height={500} radius={0} />,
});

const ListFilterModes = dynamic(
  () => import("./components/filter-modes").then((m) => m.ListFilterModes),
  {
    ssr: false,
    loading: nonLoading,
  }
);

const Filter = dynamic(() => import("./filters").then((m) => m.Filter), {
  ssr: false,
  loading: nonLoading,
});

const Sort = dynamic(() => import("./sort/sort").then((m) => m.Sort), {
  ssr: false,
  loading: nonLoading,
});

const ColsSettings = dynamic(
  () => import("./components/columns-setting").then((m) => m.ColsSettings),
  {
    ssr: false,
    loading: nonLoading,
  }
);

const ToggleView = dynamic(() => import("./components/toggle-view").then((m) => m.ToggleView), {
  ssr: false,
  loading: nonLoading,
});

const ResetDefaultButton = dynamic(
  () => import("./components/reset-default-button").then((m) => m.ResetDefaultButton),
  {
    ssr: false,
    loading: nonLoading,
  }
);

const ExportButton = dynamic(
  () => import("./components/export-button").then((m) => m.ExportButton),
  {
    ssr: false,
    loading: nonLoading,
  }
);

const CreateButton = dynamic(
  () => import("./components/create-button").then((m) => m.CreateButton),
  {
    ssr: false,
    loading: nonLoading,
  }
);

const BulkActions = dynamic(() => import("./components/bulk-actions").then((m) => m.BulkActions), {
  ssr: false,
  loading: nonLoading,
});

const FilterBar = dynamic(() => import("./filters").then((m) => m.FilterBar), {
  ssr: false,
  loading: nonLoading,
});

function getInitialViewState(listViewId: string, args: typeof generateDefaultViewState.arguments) {
  try {
    const viewStateCached = localStorage.getItem(listViewId);
    if (!viewStateCached) return generateDefaultViewState(args);

    const parsed = JSON.parse(viewStateCached);
    return parsed;
  } catch (error) {
    return generateDefaultViewState(args);
  }
}

export const ListCore = <T extends BaseData>(props: ListProps<T>) => {
  const listEleRef = useRef<HTMLDivElement | null>(null);
  const [version, setVersion] = useState(0);
  const forceUpdate = () => setVersion((s) => s + 1);

  const layout = useLayout();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const listViewId = `vs_${props.id}_v2`.toLowerCase();

  const [isSelectAll, setIsSelectAll] = useState(false);
  const [_selectedIds, setSelectedIds] = useState<string[]>([]);
  const [pointedId, setPointedId] = useState<string | null>(null);

  const defaultViewState = useMemo(() => {
    return generateDefaultViewState({ element: listEleRef.current!, view: layout.view, props });
  }, [listEleRef.current, layout.view, props.columns, props.card]);

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

  const list = useGraphqlList<T>({
    id: props.id,
    limit: props.limit,
    isSkip: !isInitialized,
    query: props.query,
    params: stateParams,
    events: props.events,
  });

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

  const refreshList = async () => {
    setIsRefreshing(true);
    await list.refetch();
    setIsRefreshing(false);
  };

  const resetDefault = () => {
    viewStateRef.current = defaultViewState;
    localStorage.removeItem(listViewId);
    list.removeAllParams();
    forceUpdate();
  };

  const selectedIds = useMemo(() => {
    if (isSelectAll) return list.data.map((v) => getId(v));
    return list.data.filter((v) => _selectedIds.includes(getId(v))).map((v) => getId(v));
  }, [_selectedIds, list.data, isSelectAll]);

  const columns = useMemo(() => {
    return Object.entries(props.columns)
      .reduce<TableColumn[]>((acc, [columnKey, columnValue], columnIndex) => {
        const state = viewStateRef.current.columns?.[columnKey] ?? {};
        const column = columnValue as Column;
        if (!column) return acc;

        const defaultWidth = column.defaultWidth ?? column.minWidth ?? 120;
        const minWidth = column.minWidth ?? 100;

        if (column.disabled) return acc;

        return [
          ...acc,
          {
            ...column,
            columnKey,
            width: state.width ?? defaultWidth,
            minWidth,
            defaultWidth,
            isVisible:
              typeof state.isHidden === "boolean" ? !state.isHidden : !column.defaultHidden,
            order: state.order ?? columnIndex,
            resizable: column.resizable ?? true,
            name: column.name ?? columnKey,
            pinned: state.pinned ?? column.defaultPinned ?? null,
          },
        ];
      }, [])
      .sort((a, b) => a.order - b.order);
  }, [props.columns, version, isInitialized]);

  const initialize = async () => {
    viewStateRef.current = getInitialViewState(listViewId, {
      element: listEleRef.current!,
      view: layout.view,
      props,
    });
    setIsInitialized(true);
  };

  useEffect(() => {
    if (!isInitialized) initialize();
  }, [listViewId]);

  const context: ListContext = {
    ...props,
    resetDefault,
    actions: props.actions ?? [],
    bulkActions: props.bulkActions ?? [],
    viewState: viewStateRef.current,
    setViewState,
    list,
    spacing,
    toggleActivatedMode,
    columns,
    selectedIds,
    select: (id, args) => {
      if (args?.isReplace) {
        setSelectedIds([id]);
        return;
      }

      if (args?.isShiftKey) {
        const output = shiftSelect(
          list.data.map((v) => getId(v)),
          id,
          selectedIds,
          selectedIds[selectedIds.length - 1]
        );
        setSelectedIds(output);
      } else {
        setSelectedIds([...selectedIds, id]);
      }
    },
    unselect: (id) => {
      setSelectedIds(selectedIds.filter((v) => v !== id));
    },
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
    pointedId,
    setPointedId,
  };

  const { card: ListCard } = props;

  return (
    <Context.Provider value={context}>
      <Stack id="List" ref={listEleRef} w="100%">
        {isInitialized && (
          <Fragment>
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
                          <props.icon
                            size={22}
                            color="var(--mantine-color-bright)"
                            strokeWidth={1.5}
                          />
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
                            <Badge size="sm" variant="light" onClick={list.refetch}>
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
                    return <ListCard key={getId(item)} data={item} />;
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

            <WayPoint enabled={list.isAbleToLoadMore} offset={350} onReached={list.loadMore} />

            <BulkActions />
          </Fragment>
        )}

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
      </Stack>
    </Context.Provider>
  );
};
