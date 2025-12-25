"use client";

import { WorkspaceMember } from "@/graphql/types.graphql";
import { searchEntity } from "@/modules/search/search-service";
import { AppEntity } from "@/types";
import { computePosition, flip, shift } from "@floating-ui/react-dom";
import { zIndexes } from "@joy-one-client/config/layout";
import { type MentionOptions } from "@tiptap/extension-mention";
import {
  Editor,
  NodeViewWrapper,
  posToDOMRect,
  ReactNodeViewProps,
  ReactNodeViewRenderer,
  ReactRenderer,
} from "@tiptap/react";
import {
  FC,
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from "react";

import QUERY_WORKSPACE_MEMBER, {
  type WorkspaceMemberQuery,
  type WorkspaceMemberQueryVariables,
} from "@/modules/workspace-members/graphql/queryWorkspaceMember.graphql";
import QUERY_WORKSPACE_MEMBERS, {
  type WorkspaceMembersQuery,
  type WorkspaceMembersQueryVariables,
} from "@/modules/workspace-members/graphql/queryWorkspaceMembers.graphql";
import { classNames } from "@/utils/ui.utils";
import { useLazyQuery, useQuery } from "@apollo/client/react";
import { Trans } from "@lingui/react/macro";
import { Card, Group, Stack, Text } from "@mantine/core";
import Mention from "@tiptap/extension-mention";
import { Avatar } from "../avatar";
import styles from "./editor-mention.module.css";

interface MentionListProps {
  items: WorkspaceMember[];
  select: (user: WorkspaceMember) => void;
  command: (option: { id: string }) => void;
  query: string;
}

interface MentionListRef {
  onKeyDown: (args: { event: KeyboardEvent }) => void;
}

const MentionList = forwardRef<MentionListRef, MentionListProps>((props, ref) => {
  const textSearch = props.query;
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isSearchEmpty, setIsSearchEmpty] = useState(false);

  const [getMembers, { data }] = useLazyQuery<
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

  useEffect(() => {
    onGetMembers(textSearch);
  }, [textSearch, getMembers]);

  const members = useMemo(() => {
    return data?.workspaceMembers.data ?? [];
  }, [data]);

  const selectItem = (index: number) => {
    const item = members[index];
    if (!item) return;
    props.command({ id: item._id });
  };

  const upHandler = () => {
    setSelectedIndex((selectedIndex + members.length - 1) % members.length);
  };

  const downHandler = () => {
    setSelectedIndex((selectedIndex + 1) % members.length);
  };

  const enterHandler = () => {
    selectItem(selectedIndex);
  };

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }) => {
      if (event.key === "ArrowUp") {
        upHandler();
        return true;
      }

      if (event.key === "ArrowDown") {
        downHandler();
        return true;
      }

      if (event.key === "Enter") {
        enterHandler();
        return true;
      }

      return false;
    },
  }));

  useEffect(() => setSelectedIndex(0), [members]);

  useEffect(() => {
    onGetMembers(textSearch);
  }, [textSearch, getMembers]);

  return (
    <Card withBorder className={styles.EditorMentionList} p={0}>
      <Stack p={5} gap={0}>
        {!isSearchEmpty &&
          data?.workspaceMembers.data.map((member, memberIndex) => {
            return (
              <Group
                key={member._id}
                className={classNames(styles.MentionListItem, {
                  [styles.isSelected]: memberIndex === selectedIndex,
                })}
                gap="xs"
                pr="sm"
                pl="xs"
                py={5}
                align="center"
                onClick={() => selectItem(memberIndex)}
              >
                <Avatar user={member} size={20} />
                <Text fz="sm">{member.name}</Text>
              </Group>
            );
          })}

        {isSearchEmpty && (
          <Text fz="sm" c="gray" ta="center" px="xs">
            <Trans>No member found</Trans>
          </Text>
        )}
      </Stack>
    </Card>
  );
});

const updatePosition = (editor: Editor, element: HTMLElement) => {
  const virtualElement = {
    getBoundingClientRect: () =>
      posToDOMRect(editor.view, editor.state.selection.from, editor.state.selection.to),
  };

  computePosition(virtualElement, element, {
    placement: "bottom-start",
    strategy: "fixed",
    middleware: [shift(), flip()],
  }).then(({ x, y, strategy }) => {
    element.style.width = "max-content";
    element.style.position = strategy;
    element.style.left = `${x}px`;
    element.style.top = `${y}px`;
    element.style.zIndex = `${zIndexes.commonModals + 100}`;
  });
};

export const suggestion: MentionOptions["suggestion"] = {
  char: "@",
  render: () => {
    let reactRenderer: ReactRenderer<MentionListRef, MentionListProps> | null = null;

    return {
      onStart: (props) => {
        if (!props.clientRect) {
          return;
        }

        reactRenderer = new ReactRenderer(MentionList, {
          props,
          editor: props.editor,
        });

        reactRenderer.element.style.position = "absolute";

        document.body.appendChild(reactRenderer.element);

        updatePosition(props.editor, reactRenderer.element);
      },

      onUpdate(props) {
        if (!reactRenderer) return;

        reactRenderer?.updateProps(props);

        if (!props.clientRect) {
          return;
        }
        updatePosition(props.editor, reactRenderer.element);
      },

      onKeyDown(props) {
        if (props.event.key === "Escape") {
          reactRenderer?.destroy();
          reactRenderer?.element.remove();

          return true;
        }

        return reactRenderer?.ref?.onKeyDown(props) ?? false;
      },

      onExit() {
        reactRenderer?.destroy();
        reactRenderer?.element.remove();
      },
    };
  },
};

const UserMention: FC<ReactNodeViewProps> = ({ node }) => {
  const userId = node?.attrs?.id;
  const { data } = useQuery<WorkspaceMemberQuery, WorkspaceMemberQueryVariables>(
    QUERY_WORKSPACE_MEMBER,
    {
      variables: { userId },
      skip: !userId,
      fetchPolicy: "cache-first",
    }
  );
  const user = data?.workspaceMember;

  return (
    <NodeViewWrapper as="span" key={userId} className={styles.UserMention}>
      @{user?.name}
    </NodeViewWrapper>
  );
};

const UsersMentionExtension = Mention.extend({
  addNodeView() {
    return ReactNodeViewRenderer(UserMention);
  },
});

export const UsersMention = UsersMentionExtension.configure({
  HTMLAttributes: {
    class: "mention",
  },
  suggestion,
});
