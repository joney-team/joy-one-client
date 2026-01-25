"use client";

import { TagType } from "@/graphql/enums.graphql";
import QUERY_TAGS, {
  type TagsQuery,
  type TagsQueryVariables,
} from "@/modules/tags/graphql/queryTags.graphql";
import { useLazyQuery } from "@apollo/client/react";
import { alpha, FocusTrap, Group, Loader, Stack, Text, TextInput } from "@mantine/core";
import { TaskMenuComponent } from "./task-menu-types";

import { WayPoint } from "@/components/way-point";
import { searchEntity } from "@/modules/search/search-service";
import { useColor } from "@/modules/theme/use-color";
import { AppEntity } from "@/types";
import { Trans, useLingui } from "@lingui/react/macro";
import { useDebouncedState } from "@mantine/hooks";
import { IconFolder, IconSearch } from "@tabler/icons-react";
import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import { TaskDataFragment } from "../../graphql/fragmentTask.graphql";
import styles from "./task-menu.module.css";

export const TaskMenuFolder: TaskMenuComponent = ({ task, groupVariables, updateTask }) => {
  const { t } = useLingui();
  const color = useColor();
  const scrollRef = useRef<HTMLDivElement>(null);

  const [selected, setSelected] = useState<TaskDataFragment["folder"]>(task.folder ?? null);
  const [textSearch, setTextSearch] = useDebouncedState("", 300);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [isSearchEmpty, setIsSearchEmpty] = useState(false);

  const [getFolders, { data, fetchMore, loading }] = useLazyQuery<TagsQuery, TagsQueryVariables>(
    QUERY_TAGS,
    {
      fetchPolicy: "cache-and-network",
    }
  );

  const onGetFolders = useCallback(
    async (q: string) => {
      if (q.length > 0) {
        const searchResult = await searchEntity(AppEntity.TAGS, q, { type: TagType.TaskFolder });
        if (searchResult.length === 0) return setIsSearchEmpty(true);
        await getFolders({
          variables: { type: TagType.TaskFolder, ids: searchResult.map((result) => result._id) },
        });
        return setIsSearchEmpty(false);
      } else {
        await getFolders({
          variables: { type: TagType.TaskFolder },
        });
        return setIsSearchEmpty(false);
      }
    },
    [getFolders]
  );

  const onFetchMore = useCallback(async () => {
    if (!data || isFetchingMore) return;
    setIsFetchingMore(true);
    await fetchMore({
      variables: { type: TagType.TaskFolder, offset: data.tags.results.length },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) return prev;
        return {
          ...prev,
          tags: {
            ...prev.tags,
            data: [...prev.tags.results, ...fetchMoreResult.tags.results],
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
    data.tags.results.length < data.tags.total &&
    textSearch.length === 0;

  useEffect(() => {
    onGetFolders(textSearch);
  }, [textSearch, getFolders]);

  return (
    <Fragment>
      <Group p={4}>
        <FocusTrap>
          <TextInput
            radius={4}
            autoFocus
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
        </FocusTrap>
      </Group>

      <Stack p={4} gap={0} mah={220} style={{ overflow: "auto" }} ref={scrollRef}>
        {!isSearchEmpty &&
          data?.tags.results.map((folder) => {
            const isSelected = selected?._id === folder._id;

            return (
              <Group
                key={folder._id}
                className={styles.TaskMenuItem}
                gap={8}
                pr={12}
                pl={6}
                py={5}
                align="center"
                onClick={() => {
                  setSelected(isSelected ? null : folder);
                  if (isSelected) {
                    updateTask({
                      _id: task._id,
                      folder: null,
                      context: { fromGroupVariables: groupVariables },
                    });
                  } else {
                    updateTask({
                      _id: task._id,
                      folder,
                      context: { fromGroupVariables: groupVariables },
                    });
                  }
                }}
              >
                <Group
                  style={{
                    background: isSelected
                      ? alpha(color(folder.color || "gray"), 0.1)
                      : "transparent",
                    borderRadius: 4,
                    padding: 2,
                  }}
                >
                  <IconFolder color={folder.color || "gray"} size={14} />
                </Group>
                <Text fz={14}>{folder.name}</Text>
              </Group>
            );
          })}

        {isSearchEmpty && (
          <Text fz={12} c="gray" ta="center" py={5}>
            <Trans>No folders found</Trans>
          </Text>
        )}

        {isCanFetchMore && (
          <WayPoint scrollContainerRef={scrollRef.current} onReached={onFetchMore} />
        )}
      </Stack>
    </Fragment>
  );
};
