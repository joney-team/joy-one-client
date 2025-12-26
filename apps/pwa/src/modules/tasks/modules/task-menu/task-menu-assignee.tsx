"use client";

import { useLazyQuery } from "@apollo/client/react";
import { FocusTrap, Group, Loader, ScrollArea, Stack, Text, TextInput } from "@mantine/core";
import { TaskMenuComponent } from "./task-menu-types";

import { Avatar } from "@/components/avatar";
import { WayPoint } from "@/components/way-point";
import { useAuth } from "@/modules/auth/auth-context";
import { searchEntity } from "@/modules/search/search-service";
import { useColor } from "@/modules/theme/use-color";
import QUERY_WORKSPACE_MEMBERS, {
  type WorkspaceMembersQuery,
  type WorkspaceMembersQueryVariables,
} from "@/modules/workspace-members/graphql/queryWorkspaceMembers.graphql";
import { getWorkspaceMemberRoleLabel } from "@/modules/workspace-members/workspace-members-service";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { AppEntity } from "@/types";
import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { useDebouncedState } from "@mantine/hooks";
import { IconSearch } from "@tabler/icons-react";
import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import { TaskDataFragment } from "../../graphql/fragmentTask.graphql";
import styles from "./task-menu.module.css";

const MenuItem = ({
  member,
  isSelected,
  onClick,
}: {
  member: WorkspaceMembersQuery["workspaceMembers"]["data"][number];
  isSelected: boolean;
  onClick: () => void;
}) => {
  const auth = useAuth();
  const isSelf = member.userId === auth.user?._id;
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
            borderColor: isSelected ? color(member.color || "gray") : "transparent",
            borderRadius: "50%",
            padding: 2,
          }}
        >
          <Avatar user={member} size={28} />
        </Group>
        <Stack gap={0}>
          <Text fz={13} fw={500}>
            {member.name}{" "}
            {isSelf && (
              <Text component="span" c="gray" fz={11}>
                (<Trans>You</Trans>)
              </Text>
            )}
          </Text>

          <Text fz={10} c="gray">
            {getWorkspaceMemberRoleLabel(member)}
          </Text>
        </Stack>
      </Group>
    </Group>
  );
};

export const TaskMenuAssignee: TaskMenuComponent = ({ task, groupVariables, updateTask }) => {
  const { member } = useWorkspace();
  const scrollRef = useRef<HTMLDivElement>(null);

  const [selected, setSelected] = useState<TaskDataFragment["assigneeUsers"]>(
    task.assigneeUsers ?? []
  );
  const [textSearch, setTextSearch] = useDebouncedState("", 300);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [isSearchEmpty, setIsSearchEmpty] = useState(false);

  const [getMembers, { data, loading, fetchMore }] = useLazyQuery<
    WorkspaceMembersQuery,
    WorkspaceMembersQueryVariables
  >(QUERY_WORKSPACE_MEMBERS, { fetchPolicy: "cache-and-network" });

  const onGetMembers = useCallback(
    async (q: string) => {
      if (q.length > 0) {
        const searchResult = await searchEntity(AppEntity.WORKSPACE_MEMBERS, q);
        if (searchResult.length === 0) return setIsSearchEmpty(true);

        await getMembers({
          variables: { ignoreSelf: true, ids: searchResult.map((result) => result._id) },
        });
        return setIsSearchEmpty(false);
      }

      await getMembers({ variables: { ignoreSelf: true, limit: 10 } });
      return setIsSearchEmpty(false);
    },
    [getMembers]
  );

  const onFetchMore = useCallback(async () => {
    if (!data || isFetchingMore) return;
    setIsFetchingMore(true);
    await fetchMore({
      variables: { ignoreSelf: true, offset: data.workspaceMembers.data.length },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) return prev;
        return {
          ...prev,
          workspaceMembers: {
            ...prev.workspaceMembers,
            data: [...prev.workspaceMembers.data, ...fetchMoreResult.workspaceMembers.data],
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
    data.workspaceMembers.data.length < data.workspaceMembers.count &&
    textSearch.length === 0;

  useEffect(() => {
    onGetMembers(textSearch);
  }, [textSearch, getMembers]);

  return (
    <Stack gap={0} align="stretch" miw={0}>
      <FocusTrap>
        <Group p={6} w="100%">
          <TextInput
            w="100%"
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
        </Group>
      </FocusTrap>

      <ScrollArea.Autosize mah={220} offsetScrollbars scrollbarSize={6} viewportRef={scrollRef}>
        <Stack px={5} gap={0}>
          {textSearch.length === 0 && (
            <Fragment>
              {member && (
                <MenuItem
                  member={member}
                  isSelected={selected.some((u) => u._id === member._id)}
                  onClick={() => {
                    const isSelected = selected.some((u) => u._id === member._id);
                    const data = isSelected
                      ? selected.filter((t) => t._id !== member._id)
                      : [...selected, member];

                    setSelected(data);
                    updateTask({
                      _id: task._id,
                      assigneeUsers: data,
                      context: { fromGroupVariables: groupVariables },
                    });
                  }}
                />
              )}

              {selected.map((member) => {
                const isSelf = member.userId === member?.userId;
                if (isSelf) return null;

                return (
                  <MenuItem
                    key={member._id}
                    member={member}
                    isSelected
                    onClick={() => {
                      const data = selected.filter((t) => t._id !== member._id);
                      setSelected(data);

                      updateTask({
                        _id: task._id,
                        assigneeUsers: data,
                        context: { fromGroupVariables: groupVariables },
                      });
                    }}
                  />
                );
              })}
            </Fragment>
          )}

          {!isSearchEmpty &&
            data?.workspaceMembers.data.map((member) => {
              const isSelected = selected.some((u) => u._id === member._id);
              if (textSearch.length === 0 && isSelected) return null;

              return (
                <MenuItem
                  key={member._id}
                  member={member}
                  isSelected={isSelected}
                  onClick={() => {
                    const data = isSelected
                      ? selected.filter((t) => t._id !== member._id)
                      : [...selected, member];

                    setSelected(data);
                    updateTask({
                      _id: task._id,
                      assigneeUsers: data,
                      context: { fromGroupVariables: groupVariables },
                    });
                  }}
                />
              );
            })}

          {isSearchEmpty && (
            <Text fz={12} c="gray" ta="center" py={5}>
              <Trans>No assignees found</Trans>
            </Text>
          )}

          {isCanFetchMore && (
            <WayPoint scrollContainerRef={scrollRef.current} onReached={onFetchMore} />
          )}
        </Stack>
      </ScrollArea.Autosize>
    </Stack>
  );
};
