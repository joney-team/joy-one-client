"use client";

import { Avatar } from "@/components/avatar";
import { RelativeTimeFormat } from "@/components/format/date-format";
import { useAuth } from "@/modules/auth/auth-context";
import { pinComment, removeComment, unpinComment } from "@/modules/comments/comment-service";
import { CommentEntity } from "@/modules/comments/comment-types";
import { ActionIcon, Group, Popover, Stack, Text, TypographyStylesProvider } from "@mantine/core";
import { IconDots, IconPin, IconPinnedOff, IconX } from "@tabler/icons-react";
import { type FC } from "react";

interface CommentCardProps {
  comment: CommentEntity;
  visiblePinned?: boolean;
}

export const CommentCard: FC<CommentCardProps> = (props) => {
  const { comment } = props;
  const auth = useAuth();
  const isMe = auth.user?._id === comment.createdByUserId;

  return (
    <Group align="start" gap={10} wrap="nowrap">
      <Avatar src={comment.createdByUser!.avatar}>
        {comment.createdByUser!.name?.slice(0, 2)}
      </Avatar>

      <Stack gap={10} flex={1}>
        <Group align="start" justify="space-between">
          <Stack gap={0}>
            <Text fw={500} fz={14}>
              {comment.createdByUser!.name}
            </Text>
            <Text c="gray" fz={10}>
              <RelativeTimeFormat value={comment.createdAt} />
            </Text>
          </Stack>

          <Group gap={5}>
            {isMe && (
              <Popover withArrow>
                <Popover.Target>
                  <ActionIcon color="gray" variant="outline" size="xs">
                    <IconDots strokeWidth={1.5} size={12} />
                  </ActionIcon>
                </Popover.Target>
                <Popover.Dropdown p={5}>
                  <Stack gap={10}>
                    <Group
                      gap={0}
                      style={{ cursor: "pointer" }}
                      pr={5}
                      onClick={() => removeComment(comment._id)}
                    >
                      <ActionIcon variant="transparent" color="dark">
                        <IconX strokeWidth={1.2} size={16} />
                      </ActionIcon>
                      <Text fw={500} fz={12}>
                        Xoá
                      </Text>
                    </Group>
                  </Stack>
                </Popover.Dropdown>
              </Popover>
            )}

            <Popover withArrow>
              <Popover.Target>
                <ActionIcon
                  color={comment.isPinned ? "orange" : "gray"}
                  variant={comment.isPinned ? "filled" : "outline"}
                  size="xs"
                >
                  <IconPin strokeWidth={1.5} size={12} />
                </ActionIcon>
              </Popover.Target>
              <Popover.Dropdown p={5}>
                <Stack gap={10}>
                  <Group
                    gap={0}
                    style={{ cursor: "pointer" }}
                    pr={5}
                    onClick={() => {
                      if (comment.isPinned) {
                        unpinComment(comment._id);
                      } else {
                        pinComment(comment._id);
                      }
                    }}
                  >
                    <ActionIcon variant="transparent" color="dark">
                      {comment.isPinned ? (
                        <IconPinnedOff strokeWidth={1.2} size={16} />
                      ) : (
                        <IconPin strokeWidth={1.2} size={16} />
                      )}
                    </ActionIcon>
                    <Text c="dark" fw={500} fz={12}>
                      {comment.isPinned ? "Bỏ ghim" : "Ghim"}
                    </Text>
                  </Group>
                </Stack>
              </Popover.Dropdown>
            </Popover>
          </Group>
        </Group>

        <Stack pb={10}>
          <TypographyStylesProvider>
            <div
              dangerouslySetInnerHTML={{ __html: comment.text || (comment as any).content || "" }}
            />
          </TypographyStylesProvider>
        </Stack>
      </Stack>
    </Group>
  );
};
