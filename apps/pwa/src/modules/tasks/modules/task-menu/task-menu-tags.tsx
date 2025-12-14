"use client";

import { Circle } from "@/components/circle";
import { TagType } from "@/graphql/enums.graphql";
import QUERY_TAGS, {
  type TagsQuery,
  type TagsQueryVariables,
} from "@/modules/tags/graphql/queryTags.graphql";
import { useLazyQuery } from "@apollo/client/react";
import { Card, Divider, FocusTrap, Group, Loader, Stack, Text, TextInput } from "@mantine/core";
import { TaskMenuComponent } from "./task-menu-types";

import { WayPoint } from "@/components/way-point";
import { searchEntity } from "@/modules/search/search-service";
import { ModalTagForm } from "@/modules/tags/modals/modal-tag-form";
import { useColor } from "@/modules/theme/use-color";
import { AppEntity } from "@/types";
import { Trans, useLingui } from "@lingui/react/macro";
import { useDebouncedState } from "@mantine/hooks";
import { IconSearch, IconTagPlus } from "@tabler/icons-react";
import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import { TaskDataFragment } from "../../graphql/fragmentTask.graphql";
import styles from "./task-menu.module.css";

export const TaskMenuTags: TaskMenuComponent = ({
  task,
  groupVariables,
  updateTask,
  setClickOutsideToClose,
}) => {
  const { t } = useLingui();
  const color = useColor();
  const scrollRef = useRef<HTMLDivElement>(null);

  const [selected, setSelected] = useState<TaskDataFragment["tags"]>(task.tags ?? []);
  const [textSearch, setTextSearch] = useDebouncedState("", 300);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [isSearchEmpty, setIsSearchEmpty] = useState(false);

  const [getTags, { data, fetchMore, loading }] = useLazyQuery<TagsQuery, TagsQueryVariables>(
    QUERY_TAGS,
    {
      fetchPolicy: "cache-and-network",
    }
  );

  const onGetTags = useCallback(
    async (q: string) => {
      if (q.length > 0) {
        const searchResult = await searchEntity(AppEntity.TAGS, q);
        if (searchResult.length === 0) return setIsSearchEmpty(true);
        await getTags({
          variables: { type: TagType.Task, ids: searchResult.map((result) => result._id) },
        });
        return setIsSearchEmpty(false);
      } else {
        await getTags({
          variables: { type: TagType.Task },
        });
        return setIsSearchEmpty(false);
      }
    },
    [getTags]
  );

  const onFetchMore = useCallback(async () => {
    if (!data || isFetchingMore) return;
    setIsFetchingMore(true);
    await fetchMore({
      variables: { type: TagType.Task, offset: data.tags.data.length, limit: 10 },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) return prev;
        return {
          ...prev,
          tags: {
            ...prev.tags,
            data: [...prev.tags.data, ...fetchMoreResult.tags.data],
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
    data.tags.data.length < data.tags.count &&
    textSearch.length === 0;

  useEffect(() => {
    onGetTags(textSearch);
  }, [textSearch, getTags]);

  return (
    <Fragment>
      <Group p={6}>
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
          textSearch.length === 0 &&
          selected.map((tag) => {
            const isSelected = selected.some((t) => t._id === tag._id);
            return (
              <Group
                key={tag._id}
                className={styles.TaskMenuItem}
                gap={8}
                pr={12}
                pl={6}
                py={5}
                align="center"
                onClick={() => {
                  const tags = isSelected
                    ? selected.filter((t) => t._id !== tag._id)
                    : [...selected, tag];

                  setSelected(tags);
                  updateTask({
                    _id: task._id,
                    tags,
                    context: { fromGroupVariables: groupVariables },
                  });
                }}
              >
                <Group
                  style={{
                    border: `1px solid transparent`,
                    borderColor: isSelected ? color(tag.color || "gray") : "transparent",
                    borderRadius: "50%",
                    padding: 2,
                  }}
                >
                  <Circle color={tag.color || "gray"} size={12} />
                </Group>
                <Text fz={14}>{tag.name}</Text>
              </Group>
            );
          })}

        {!isSearchEmpty &&
          data?.tags.data.map((tag) => {
            const isSelected = selected.some((t) => t._id === tag._id);
            if (textSearch.length === 0 && isSelected) return null;

            return (
              <Group
                key={tag._id}
                className={styles.TaskMenuItem}
                gap={8}
                pr={12}
                pl={6}
                py={5}
                align="center"
                onClick={() => {
                  const tags = isSelected
                    ? selected.filter((t) => t._id !== tag._id)
                    : [...selected, tag];

                  setSelected(tags);
                  updateTask({
                    _id: task._id,
                    tags,
                    context: { fromGroupVariables: groupVariables },
                  });
                }}
              >
                <Group
                  style={{
                    border: `1px solid transparent`,
                    borderColor: isSelected ? color(tag.color || "gray") : "transparent",
                    borderRadius: "50%",
                    padding: 2,
                  }}
                >
                  <Circle color={tag.color || "gray"} size={12} />
                </Group>
                <Text fz={14}>{tag.name}</Text>
              </Group>
            );
          })}

        {isSearchEmpty && (
          <Text fz={12} c="gray" ta="center" py={5}>
            <Trans>No tags found</Trans>
          </Text>
        )}

        {isCanFetchMore && (
          <WayPoint scrollContainerRef={scrollRef.current} onReached={onFetchMore} />
        )}
      </Stack>
    </Fragment>
  );
};
