"use client";

import { Avatar } from "@/components/avatar";
import { Button } from "@/components/buttons/button";
import { ModalTitle } from "@/components/modal-title";
import { useAuth } from "@/modules/auth/auth-context";
import { BookingEntity } from "@/modules/bookings/booking-types";
import { CommentCard } from "@/modules/comments/comment-card";
import { createComment, getComments } from "@/modules/comments/comment-service";
import { CommentEntity } from "@/modules/comments/comment-types";
import { CustomerEntity } from "@/modules/customers/customer-types";
import { useEventsListener } from "@/modules/events/event-service";
import { EventType } from "@/modules/events/event-types";
import { onError } from "@/utils/exceptions.utils";
import { useList } from "@/utils/use-list.util";
import {
  ActionIcon,
  Box,
  Card,
  Divider,
  Group,
  Indicator,
  Modal,
  Stack,
  Text,
  ThemeIcon,
  TypographyStylesProvider,
  alpha,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { Link, RichTextEditor } from "@mantine/tiptap";
import { IconMessage, IconPin, IconSend } from "@tabler/icons-react";
import Placeholder from "@tiptap/extension-placeholder";
import { BubbleMenu, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { type FC, Fragment, useEffect, useState } from "react";

interface CommentsProps {
  customer?: CustomerEntity;
  booking?: BookingEntity;
}

export const Comments: FC<CommentsProps> = (props) => {
  const auth = useAuth();
  const [opened, { open, close }] = useDisclosure(false);
  const [isSending, setIsSending] = useState(false);
  const [pinnedComment, setPinnedComment] = useState<CommentEntity>();

  const defaultParams = {
    customerId: props.customer?._id,
    bookingId: props.booking?._id,
  };

  const fetchPinnedComment = async () => {
    return getComments({ pinned: true, ...defaultParams, offset: 0, limit: 1 })
      .then((res) => setPinnedComment(res.data[0]))
      .catch(() => false);
  };

  const comments = useList<CommentEntity>({
    id: `comments-${JSON.stringify(defaultParams)}`,
    fetch: (p) =>
      getComments({
        ...defaultParams,
        ...p,
      }),
  });

  const editor = useEditor({
    extensions: [StarterKit, Link, Placeholder.configure({ placeholder: "Nhập nội dung comment" })],
    content: "",
  });

  const onSend = async () => {
    if (!editor) return;
    const html = editor.getHTML();
    if (!html) return;
    setIsSending(true);
    try {
      await createComment({
        ...defaultParams,
        text: html,
      });
      editor.commands.setContent("");
    } catch (error) {
      onError(error);
    }
    setIsSending(false);
  };

  useEventsListener(
    [
      EventType.COMMENT_NEW,
      EventType.COMMENT_UPDATED,
      EventType.COMMENT_REMOVED,
      EventType.COMMENT_PINNED,
      EventType.COMMENT_UNPINNED,
    ],
    () => {
      comments.fetch(true);
      fetchPinnedComment();
    }
  );

  useEffect(() => {
    fetchPinnedComment();
  }, []);

  if (!props.booking && !props.customer) return null;

  return (
    <Fragment>
      <Group onClick={open}>
        {!!pinnedComment && (
          <Group
            px={5}
            pr={8}
            py={3}
            style={{
              background: "white",
              borderRadius: 5,
              boxShadow: "0px 0px 5px #00000020",
              maxWidth: "calc(100svw - 80px)",
              fontSize: 12,
            }}
            gap={0}
          >
            <ThemeIcon variant="transparent" color="orange">
              <IconPin strokeWidth={1.5} size={18} />
            </ThemeIcon>
            <TypographyStylesProvider>
              <div
                dangerouslySetInnerHTML={{
                  __html: pinnedComment.text || (pinnedComment as any).content || "",
                }}
              />
            </TypographyStylesProvider>
          </Group>
        )}
        <Indicator
          offset={5}
          color="red"
          label={
            <Text fw={500} fz={10}>
              {comments.count}
            </Text>
          }
          disabled={comments.count === 0}
          size={16}
        >
          <ActionIcon radius={150} size="xl">
            <IconMessage strokeWidth={1.5} />
          </ActionIcon>
        </Indicator>
      </Group>

      <Modal
        opened={opened}
        onClose={close}
        title={<ModalTitle icon={IconMessage} title="Bình luận" />}
        yOffset={10}
        styles={{
          inner: {
            paddingLeft: 10,
            paddingRight: 10,
          },
        }}
        size={1000}
      >
        <Stack>
          {!!pinnedComment && (
            <Stack gap={3}>
              <Group gap={3}>
                <ThemeIcon variant="transparent" color="orange" size="xs">
                  <IconPin strokeWidth={1.5} size={18} />
                </ThemeIcon>
                <Text c="orange" fw={400} fz={12}>
                  Bình luận đã được ghim
                </Text>
              </Group>
              <Card p={5} withBorder>
                <CommentCard comment={pinnedComment} />
              </Card>
            </Stack>
          )}

          {!!editor && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                onSend();
              }}
            >
              <Stack gap={10}>
                <Group gap={10} align="start">
                  <Avatar src={auth.user?.avatar}>
                    {auth.user?.name?.slice(0, 2).toUpperCase()}
                  </Avatar>

                  <RichTextEditor editor={editor} flex={1}>
                    <BubbleMenu editor={editor}>
                      <RichTextEditor.ControlsGroup>
                        <RichTextEditor.Bold />
                        <RichTextEditor.Italic />
                        <RichTextEditor.Link />
                      </RichTextEditor.ControlsGroup>
                    </BubbleMenu>

                    <RichTextEditor.Content />
                  </RichTextEditor>
                </Group>

                <Group justify="end">
                  <Button
                    h={32}
                    size="sm"
                    rightSection={<IconSend strokeWidth={1.5} size={18} />}
                    type="submit"
                    loading={isSending}
                  >
                    Gửi
                  </Button>
                </Group>
              </Stack>
            </form>
          )}

          {comments.data.length > 0 &&
            comments.data.map((comment, index) => {
              return (
                <Box key={comment._id}>
                  <CommentCard comment={comment} />

                  {index !== comments.data.length - 1 && <Divider color={alpha("#000000", 0.05)} />}
                </Box>
              );
            })}
        </Stack>
      </Modal>
    </Fragment>
  );
};
