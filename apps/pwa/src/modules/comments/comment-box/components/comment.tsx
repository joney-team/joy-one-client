"use client";

import { type FC } from "react";
import { Avatar } from "@/components/avatar";
import { Renderer } from "@/components/renderer";
import { FileCard } from "@/modules/files/file-card";
import { useAuth } from "@/modules/auth/auth-context";
import { CommentEntity } from "@/modules/comments/comment-types";
import { getDateFormat } from "@/modules/lang/lang-service";
import { useWorkspaceMembers } from "@/modules/workspace-members/workspace-members-hooks";
import { Card, Group, SimpleGrid, Stack, Text } from "@mantine/core";
import dayjs from "dayjs";

interface Comment extends CommentEntity {
  isFirstSession: boolean;
  isLastSession: boolean;
  isOnlyOneMessageSession: boolean;
  timeBtw: number;
}

const radius = "20px";
const cornorRadius = "3px";

export const Comment: FC<Comment> = (comment) => {
  const auth = useAuth();

  const [userMemberInfos] = useWorkspaceMembers([comment.createdByUserId]);
  const isMe = auth.user._id === comment.createdByUserId;
  const member = userMemberInfos.find((m) => m.userId === comment.createdByUserId);

  const limitTimeBtw = 30;

  const getBorderRadius = () => {
    if (isMe) {
      if (comment.isOnlyOneMessageSession) return `${radius} ${cornorRadius} ${radius} ${radius}`;
      if (comment.isFirstSession) return `${radius} ${radius} ${cornorRadius} ${radius}`;
      if (comment.isLastSession) return `${radius} ${cornorRadius} ${radius} ${radius}`;
      return `${radius} ${cornorRadius} ${cornorRadius} ${radius}`;
    }

    if (comment.isOnlyOneMessageSession) return `${cornorRadius} ${radius} ${radius} ${radius}`;
    if (comment.isFirstSession) return `${radius} ${radius} ${radius} ${cornorRadius}`;
    if (comment.isLastSession) return `${cornorRadius} ${radius} ${radius} ${radius}`;
    return `${cornorRadius} ${radius} ${radius} ${cornorRadius}`;
  };

  const getTime = () => {
    const isToday = dayjs(comment.createdAt * 1000).isSame(dayjs(), "day");
    const isYesterday = dayjs(comment.createdAt * 1000).isSame(dayjs().subtract(1, "day"), "day");
    const isSameWeek = dayjs(comment.createdAt * 1000).isSame(dayjs(), "week");

    if (isToday) return dayjs(comment.createdAt * 1000).format("HH:mm");
    if (isYesterday) return dayjs(comment.createdAt * 1000).format("HH:mm");
    if (isSameWeek) return dayjs(comment.createdAt * 1000).format("dddd HH:mm");
    return dayjs(comment.createdAt * 1000).format(`${getDateFormat()} HH:mm`);
  };

  if (!member) return null;

  return (
    <Renderer visible={!!comment.text || (comment.attachments || []).length > 0}>
      <Group w="100%" justify={isMe ? "flex-end" : "flex-start"} gap={8} align="start">
        <Renderer visible={!isMe}>
          <Avatar
            user={comment.createdByUser}
            radius={200}
            size={30}
            mt={3}
            opacity={comment.isFirstSession ? 1 : 0}
          />
        </Renderer>

        <Stack gap={8} align={isMe ? "flex-end" : "flex-start"}>
          <Renderer visible={comment.isFirstSession}>
            {isMe ? (
              <Text fz={12} c="gray.6">
                {getTime()}
              </Text>
            ) : (
              <Text fz={12} c="gray.6">
                {member.name} • {getTime()}
              </Text>
            )}
          </Renderer>

          <Renderer visible={!comment.isFirstSession && comment.timeBtw > limitTimeBtw}>
            <Text fz={12} c="gray.6">
              {getTime()}
            </Text>
          </Renderer>

          <Card
            id={`comment-${comment._id}`}
            withBorder
            shadow="none"
            py={8}
            px={10}
            bg={isMe ? "blue.1" : "white"}
            radius={0}
            style={{
              borderRadius: getBorderRadius(),
              borderWidth: 3,
              borderColor: "transparent",
            }}
          >
            <Stack gap={8} align={!isMe ? "flex-start" : "flex-end"}>
              <Renderer visible={!!comment.text && comment.text.length > 0}>
                <Text style={{ wordBreak: "break-word" }} ta={!isMe ? "left" : "right"}>
                  {comment.text}
                </Text>
              </Renderer>

              <Renderer visible={comment.attachments && comment.attachments.length > 0}>
                <SimpleGrid cols={comment.attachments!.length === 1 ? 1 : 2} spacing={8}>
                  {comment.attachments!.map((att, i) => {
                    return (
                      <FileCard
                        src={att.raw || att.url}
                        key={`${comment._id}-${i}-file`}
                        viewable
                      />
                    );
                  })}
                </SimpleGrid>
              </Renderer>
            </Stack>
          </Card>
        </Stack>
      </Group>
    </Renderer>
  );
};
