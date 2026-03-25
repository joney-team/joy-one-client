"use client";

import { useLazyQuery } from "@apollo/client/react";
import { FocusTrap, Group, Loader, ScrollArea, Stack, Text, TextInput } from "@mantine/core";
import { TaskMenuComponent } from "./task-menu-types";

import { Avatar } from "@/components/avatar";
import { WayPoint } from "@/components/way-point";
import QUERY_CUSTOMERS, {
  type CustomersQuery,
  type CustomersQueryVariables,
} from "@/modules/customers/graphql/queryCustomers.graphql";
import { searchEntity } from "@/modules/search/search-service";
import { useColor } from "@/modules/theme/use-color";
import { AppEntity } from "@/types";
import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { useDebouncedState } from "@mantine/hooks";
import { IconSearch } from "@tabler/icons-react";
import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import { TaskFragment } from "../../graphql/fragmentTask.graphql";
import styles from "./task-menu.module.css";

const MenuItem = ({
  customer,
  isSelected,
  onClick,
}: {
  customer: CustomersQuery["list"]["results"][number];
  isSelected: boolean;
  onClick: () => void;
  isSelf?: boolean;
}) => {
  const color = useColor();

  return (
    <Group
      className={styles.TaskMenuItem}
      gap={8}
      pr={12}
      pl={6}
      py={5}
      align="center"
      onClick={onClick}
    >
      <Group gap={8}>
        <Group
          style={{
            border: `1px solid transparent`,
            borderColor: isSelected ? color("gray") : "transparent",
            borderRadius: "50%",
            padding: 2,
          }}
        >
          <Avatar customer={customer} size={28} />
        </Group>
        <Stack gap={0}>
          <Text fz={13} fw={500}>
            {customer.name}
          </Text>

          {customer.phone && (
            <Text fz={10} c="gray">
              {customer.phone}
            </Text>
          )}
        </Stack>
      </Group>
    </Group>
  );
};

export const TaskMenuCustomer: TaskMenuComponent = ({ task, groupVariables, updateTask }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const [selected, setSelected] = useState<TaskFragment["customer"]>(task.customer ?? null);
  const [textSearch, setTextSearch] = useDebouncedState("", 300);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [isSearchEmpty, setIsSearchEmpty] = useState(false);

  const [getCustomers, { data, loading, fetchMore }] = useLazyQuery<
    CustomersQuery,
    CustomersQueryVariables
  >(QUERY_CUSTOMERS, { fetchPolicy: "cache-and-network" });

  const onGetMembers = useCallback(
    async (q: string) => {
      if (q.length > 0) {
        const searchResult = await searchEntity(AppEntity.CUSTOMERS, q);
        if (searchResult.length === 0) return setIsSearchEmpty(true);

        await getCustomers({
          variables: { ids: searchResult.map((result) => result._id) },
        });
        return setIsSearchEmpty(false);
      }

      await getCustomers({ variables: { limit: 10 } });
      return setIsSearchEmpty(false);
    },
    [getCustomers],
  );

  const onFetchMore = useCallback(async () => {
    if (!data || isFetchingMore) return;
    setIsFetchingMore(true);
    await fetchMore({
      variables: { offset: data.list.results.length },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) return prev;
        return {
          ...prev,
          list: {
            ...prev.list,
            data: [...prev.list.results, ...fetchMoreResult.list.results],
          },
        };
      },
    });
    setIsFetchingMore(false);
  }, [fetchMore, data, isFetchingMore]);

  const isCanFetchMore =
    !isFetchingMore &&
    !loading &&
    data &&
    data.list.results.length < data.list.total &&
    textSearch.length === 0;

  useEffect(() => {
    onGetMembers(textSearch);
  }, [textSearch, getCustomers]);

  return (
    <Stack miw={0} align="stretch" gap={0}>
      <FocusTrap active={!!data && data.list.total > 0}>
        <Group p={6} w="100%">
          <TextInput
            w="100%"
            radius={4}
            size="xs"
            leftSection={<IconSearch size={16} />}
            placeholder={t`Search`}
            onChange={(e) => setTextSearch(e.target.value)}
            rightSection={
              loading && !data ? <Loader size="xs" type="dots" color="gray" /> : undefined
            }
            styles={{
              input: {
                backgroundColor: "var(--mantine-color-default-hover)",
                border: "none",
              },
            }}
          />
        </Group>
      </FocusTrap>

      <ScrollArea.Autosize mah={220} offsetScrollbars scrollbarSize={6} viewportRef={scrollRef}>
        <Stack px={5} gap={0}>
          {textSearch.length === 0 && selected && (
            <Fragment>
              <MenuItem
                key={selected._id}
                customer={selected}
                isSelected
                onClick={() => {
                  setSelected(null);

                  updateTask({
                    _id: task._id,
                    customer: null,
                    context: { fromGroupVariables: groupVariables },
                  });
                }}
              />
            </Fragment>
          )}

          {!isSearchEmpty &&
            data?.list.results.map((customer) => {
              const isSelected = selected?._id === customer._id;
              if (textSearch.length === 0 && isSelected) return null;

              return (
                <MenuItem
                  key={customer._id}
                  customer={customer}
                  isSelected={isSelected}
                  onClick={() => {
                    setSelected(customer);
                    updateTask({
                      _id: task._id,
                      customer,
                      context: { fromGroupVariables: groupVariables },
                    });
                  }}
                />
              );
            })}

          {isSearchEmpty ||
            (data && data.list.total === 0 && (
              <Text fz={12} c="gray" ta="center" py={5}>
                <Trans>No customers found</Trans>
              </Text>
            ))}

          {isCanFetchMore && (
            <WayPoint scrollContainerRef={scrollRef.current} onReached={onFetchMore} />
          )}
        </Stack>
      </ScrollArea.Autosize>
    </Stack>
  );
};
