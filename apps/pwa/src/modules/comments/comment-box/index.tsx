"use client";

import { CommentsIllustration } from "@/components/illustrations/comments";
import { Renderer } from "@/components/renderer";
import { useWorkspaceLayout } from "@/layout/hooks/use-workspace-layout";
import { Comment } from "@/modules/comments/comment-box/components/comment";
import { createComment, getComments } from "@/modules/comments/comment-service";
import { CommentEntity } from "@/modules/comments/comment-types";
import { useEventsListener } from "@/modules/events/event-service";
import { EventType } from "@/modules/events/event-types";
import { t } from "@/modules/lang/lang-service";
import { useList } from "@/components/list/use-list";
import { em, Group, ScrollArea, Stack, Text, ThemeIcon } from "@mantine/core";
import { useElementSize } from "@mantine/hooks";
import { IconMessages } from "@tabler/icons-react";
import dayjs from "dayjs";
import { FC, useEffect, useRef } from "react";
import { CommentInput } from "./components/comment-input";
import { CommentBoxProps, UseCommentBox } from "./types";

export const CommentBox: FC<CommentBoxProps> = (props) => {
  const headerHeight = 48;
  const rootSize = useElementSize();
  const inputsSize = useElementSize();
  const commentsViewport = useRef<HTMLDivElement>(null);
  const workspaceLayout = useWorkspaceLayout();

  const comments = useList({
    autoFetch: false,
    id: `comments-${props.ref}`,
    fetch: async (q) => getComments({ ...q, ref: props.ref }),
    limit: 50,
  });

  const scrollToBottom = (delay = 0, behavior: ScrollBehavior = "smooth") => {
    setTimeout(() => {
      commentsViewport.current?.scrollTo({
        top: commentsViewport.current?.scrollHeight,
        behavior,
      });
    }, delay);
  };

  useEffect(() => {
    comments.fetch().then(() => scrollToBottom(100, "instant"));
  }, []);

  useEventsListener(
    [EventType.COMMENT_REMOVED],
    (e) => {
      const comment = e.data as CommentEntity;
      if (comment.ref === props.ref) {
        comments.setData(comments.data.filter((c) => c._id !== comment._id));
      }
    },
    [props.ref, comments.data]
  );

  useEventsListener(
    [EventType.COMMENT_NEW, EventType.COMMENT_UPDATED],
    (e) => {
      const comment = e.data as CommentEntity;
      if (comment.ref === props.ref) {
        const isExisted = comments.data.find((c) => c._id === comment._id);
        if (isExisted) {
          comments.setData(comments.data.map((c) => (c._id === comment._id ? comment : c)));
        } else {
          comments.setData([...comments.data, comment], comments.count + 1);
        }
      }
    },
    [props.ref, comments.data]
  );

  const ctx: UseCommentBox = {
    ...props,
    send: async (dto) => {
      await createComment({ ...dto, ref: props.ref });
      scrollToBottom(100);
    },
    scrollToBottom,
  };

  const _comments = [...comments.data.sort((a, b) => a.createdAt - b.createdAt)].reverse();

  return (
    <Stack w="100%" h="100%" gap={0} ref={rootSize.ref} bg="var(--mantine-color-default-hover)">
      <Group
        px={10}
        h={headerHeight}
        style={{ borderBottom: `1px solid ${workspaceLayout.dividerColor}` }}
        bg="var(--mantine-color-body)"
        gap={8}
      >
        <ThemeIcon variant="transparent" color="dark">
          <IconMessages size={20} strokeWidth={1.5} />
        </ThemeIcon>

        <Text fz={em(16)} fw={500}>
          {t("comments")}
        </Text>
      </Group>

      <Stack
        h={rootSize.height - headerHeight - inputsSize.height}
        style={{ position: "relative" }}
      >
        <ScrollArea
          viewportRef={commentsViewport}
          style={{ pointerEvents: "all" }}
          h={rootSize.height - headerHeight - inputsSize.height}
          w="100%"
        >
          <Renderer visible={comments.isHasData}>
            <Stack
              p={10}
              px={16}
              justify="flex-end"
              mih={rootSize.height - headerHeight - inputsSize.height}
              w="100%"
              gap={5}
            >
              {_comments
                .sort((a, b) => a.createdAt - b.createdAt)
                .map((comment, index) => {
                  const prevMsg = _comments[index - 1];
                  const nextMsg = _comments[index + 1];

                  const isFirstSession = prevMsg?.createdByUserId !== comment.createdByUserId;
                  const isLastSession =
                    nextMsg?.createdByUserId !== comment.createdByUserId || !nextMsg;
                  const isOnlyOneMessageSession = isFirstSession && isLastSession;
                  const timeBtw = prevMsg
                    ? dayjs(comment.createdAt * 1000).diff(
                        dayjs(prevMsg.createdAt * 1000),
                        "minutes"
                      )
                    : 0;

                  return (
                    <Comment
                      key={comment._id}
                      {...comment}
                      isFirstSession={isFirstSession}
                      isLastSession={isLastSession}
                      isOnlyOneMessageSession={isOnlyOneMessageSession}
                      timeBtw={timeBtw}
                    />
                  );
                })}
            </Stack>
          </Renderer>

          <Renderer visible={comments.isEmpty}>
            <Stack
              flex={1}
              h={rootSize.height - headerHeight - inputsSize.height}
              justify="center"
              align="center"
            >
              <CommentsIllustration width={150} />
              <Text c="gray" fz={12}>
                {t("no_comments")}
              </Text>
            </Stack>
          </Renderer>
        </ScrollArea>
      </Stack>

      <Stack ref={inputsSize.ref}>
        <CommentInput {...ctx} />
      </Stack>
    </Stack>
  );
};
