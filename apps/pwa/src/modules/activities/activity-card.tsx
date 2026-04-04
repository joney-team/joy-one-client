"use client";

import { Avatar } from "@/components/avatar";
import { Button } from "@/components/buttons/button";
import { Editor, EditorRef } from "@/components/editor/editor";
import { parseEditorJSON } from "@/components/editor/editor-utils";
import { RelativeTimeFormat } from "@/components/format/date-format";
import { Plural, Trans } from "@lingui/react/macro";
import {
  ActionIcon,
  Card,
  Group,
  Menu,
  Popover,
  Skeleton,
  Stack,
  Text,
  ThemeIcon,
  Tooltip,
} from "@mantine/core";
import {
  IconCheck,
  IconDots,
  IconEyeOff,
  IconMoodPlus,
  IconPencil,
  IconThumbUp,
  IconTrash,
} from "@tabler/icons-react";
import { FC, useRef, useState } from "react";
import { useColor } from "../theme/use-color";
import { ActivityFragment } from "./graphql/fragmentActivity.graphql";

import { useApolloClient, useMutation } from "@apollo/client/react";
import styles from "./activity-card.module.css";

import { onError } from "@/utils/exceptions.utils";

import { NumberFormat } from "@/components/format/number-format";
import { ReactionType } from "@/graphql/enums.graphql";
import { AppEntity } from "@/types";
import { wait } from "@/utils/common.utils";
import { DateTime } from "@joy-one-client/utils/date-time";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useAuth } from "../auth/auth-context";
import { reactionTypes } from "../reactions/reactions-constants";
import { useReactions } from "../reactions/use-reactions";
import { ActivityReactionUsers } from "./activity-reaction-users";
import ArchiveActivityDocument from "./graphql/archiveActivity.graphql";
import ACTIVITY_FRAGMENT from "./graphql/fragmentActivity.graphql";
import GetActivitiesDocument from "./graphql/getActivities.graphql";
import UpdateActivityDocument from "./graphql/updateActivity.graphql";

const ActivityReplies = dynamic(
  () => import("./activity-replies").then((mod) => mod.ActivityReplies),
  {
    ssr: false,
    loading: () => (
      <Stack p="sm">
        <Skeleton miw="100%" h={50} />
      </Stack>
    ),
  },
);

export const ActivityCard: FC<{ activity: ActivityFragment }> = ({ activity }) => {
  const isReply = Boolean(activity.parentId);
  const color = useColor();
  const editorRef = useRef<EditorRef>(null);
  const client = useApolloClient();

  const { user } = useAuth();
  const [isArchived, setIsArchived] = useState(false);
  const [isShowReply, setIsShowReply] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isShowEdit, setIsShowEdit] = useState(false);

  const isSelf = activity.createdByUser._id === user._id;

  const [archive] = useMutation(ArchiveActivityDocument);

  const onArchive = async () => {
    setIsArchived(true);
    setIsMenuOpen(false);
    try {
      await archive({
        variables: { id: activity._id },
        refetchQueries: [GetActivitiesDocument],
      });
    } catch (error) {
      onError(error);
      setIsArchived(false);
    }
  };

  const [update] = useMutation(UpdateActivityDocument);

  const onSaveEdit = async () => {
    if (!activity || !editorRef.current) return;
    try {
      const content = JSON.stringify(editorRef.current.getJSON());
      await update({
        variables: { id: activity._id, content },
        update: (cache) => {
          const identifiedId = client.cache.identify({
            __typename: "Activity",
            _id: activity._id,
          });

          cache.updateFragment(
            {
              id: identifiedId,
              fragment: ACTIVITY_FRAGMENT,
              fragmentName: "Activity",
            },
            (prev) => {
              if (!prev) return prev;
              return {
                ...prev,
                content,
                contentLastModifiedAt: DateTime.getNowInSeconds(),
              };
            },
          );
        },
      });
      setIsShowEdit(false);
    } catch (error) {
      onError(error);
    }
  };

  const {
    handleAddReaction,
    handleRemoveReaction,
    otherReactions,
    userReactions,
    availableReactions,
  } = useReactions({
    entity: AppEntity.ACTIVITIES,
    fragmentData: activity,
    fragment: ACTIVITY_FRAGMENT,
  });

  const onEdit = async () => {
    setIsShowEdit(true);
    setIsMenuOpen(false);
    await wait(200);
    editorRef.current?.focus();
  };

  return (
    <Card
      className={styles.ActivityCard}
      shadow={isReply ? "none" : "xs"}
      withBorder
      radius={isReply ? 0 : "md"}
      style={isReply ? { border: "none" } : { borderColor: color("gray.1") }}
      p={0}
    >
      <Stack gap={0}>
        <Stack p="md" gap="xs" className={styles.ActivityCardContent}>
          <Group justify="space-between">
            {activity.createdByUser && (
              <Group gap={6} flex={1}>
                <Avatar user={activity.createdByUser} size={18} hideOnlineStatus />
                <Text fz={12} fw={500}>
                  {activity.createdByUser.name}
                </Text>

                {activity.createdAt && (
                  <Text fz={10} c="gray">
                    <RelativeTimeFormat value={activity.createdAt} />
                  </Text>
                )}

                {!!activity.contentLastModifiedAt && (
                  <Text fz={10} c="gray">
                    • <Trans>Edited</Trans>
                  </Text>
                )}
              </Group>
            )}

            {!isArchived && isSelf && (
              <Group>
                <Menu
                  closeOnItemClick={false}
                  position="bottom-end"
                  offset={-2}
                  opened={isMenuOpen}
                  onChange={setIsMenuOpen}
                >
                  <Menu.Target>
                    <ActionIcon
                      className={styles.Menu}
                      variant="subtle"
                      color="gray"
                      size="sm"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setIsMenuOpen(true);
                      }}
                    >
                      <IconDots size={14} />
                    </ActionIcon>
                  </Menu.Target>

                  <Menu.Dropdown>
                    <Menu.Item
                      leftSection={<IconPencil size={12} style={{ marginRight: -3 }} />}
                      pl={6}
                      pr={10}
                      fz="xs"
                      style={{ borderRadius: 6 }}
                      onClick={onEdit}
                    >
                      <Trans>Edit</Trans>
                    </Menu.Item>

                    <Menu.Item
                      leftSection={<IconTrash size={12} style={{ marginRight: -3 }} />}
                      pl={6}
                      pr={10}
                      fz="xs"
                      style={{ borderRadius: 6 }}
                      onClick={onArchive}
                    >
                      <Trans>Remove</Trans>
                    </Menu.Item>
                  </Menu.Dropdown>
                </Menu>
              </Group>
            )}
          </Group>

          <Stack gap={0} pl={isReply ? 28 : 0}>
            {isArchived ? (
              <Group p="sm" justify="center" align="center" gap={3} opacity={0.5}>
                <ThemeIcon size="sm" variant="transparent" color="gray">
                  <IconEyeOff size={18} strokeWidth={1.5} />
                </ThemeIcon>
                <Text c="gray" fz="xs" ta="center">
                  <Trans>This activity has been archived</Trans>
                </Text>
              </Group>
            ) : isShowEdit ? (
              <Stack gap="sm">
                <Editor
                  ref={editorRef}
                  style={{ fontSize: 14 }}
                  key={activity._id + "edit"}
                  defaultValue={parseEditorJSON(activity.content)}
                  isEnableToolbar={false}
                  isNonWrapped
                />

                <Group gap={5} justify="end">
                  <Button
                    size="compact-xs"
                    variant="outline"
                    onClick={() => setIsShowEdit(false)}
                    component="div"
                    color="gray"
                  >
                    <Trans>Cancel</Trans>
                  </Button>

                  <Button size="compact-xs" leftIcon={IconCheck} onClick={onSaveEdit}>
                    <Trans>Save</Trans>
                  </Button>
                </Group>
              </Stack>
            ) : (
              <Editor
                ref={editorRef}
                style={{ fontSize: 14 }}
                key={activity._id + activity.contentLastModifiedAt}
                defaultValue={parseEditorJSON(activity.content)}
                readonly
                isNonWrapped
              />
            )}
          </Stack>
        </Stack>

        {!isArchived && (
          <Stack pl={isReply ? 42 : 0}>
            <Group
              px={isReply ? 0 : "sm"}
              py="xs"
              style={{ borderTop: `1px solid ${color("gray.1")}` }}
              justify="space-between"
            >
              <Group gap={3}>
                {userReactions.length > 0 ? (
                  <Group gap={3}>
                    {userReactions.map((reaction) => {
                      const reactionType = reactionTypes[reaction.type];

                      return (
                        <Menu trigger="hover" key={reaction.type + "menu"}>
                          <Menu.Target>
                            <Button
                              key={reaction.type}
                              size="compact-xs"
                              variant="light"
                              onClick={() => handleRemoveReaction(reaction.type)}
                              color={reactionType.color}
                              styles={{
                                section: {
                                  marginRight: 5,
                                },
                              }}
                              leftSection={
                                <Image
                                  src={reactionType.iconSrc}
                                  alt=""
                                  fill={false}
                                  width={14}
                                  height={14}
                                />
                              }
                            >
                              {reaction.userIds.length > 1 ? (
                                <Trans>You and +{reaction.userIds.length - 1}</Trans>
                              ) : (
                                <Trans>You</Trans>
                              )}
                            </Button>
                          </Menu.Target>

                          <ActivityReactionUsers userIds={reaction.userIds} />
                        </Menu>
                      );
                    })}
                  </Group>
                ) : (
                  <Tooltip label={<Trans>Like this comment</Trans>}>
                    <ActionIcon
                      size="sm"
                      variant="subtle"
                      onClick={() => handleAddReaction(ReactionType.Like)}
                      color="gray"
                    >
                      <IconThumbUp size={14} />
                    </ActionIcon>
                  </Tooltip>
                )}

                {otherReactions.map((reaction) => {
                  const reactionType = reactionTypes[reaction.type];
                  return (
                    <Menu trigger="click-hover">
                      <Menu.Target>
                        <Button
                          key={reaction.type + "other"}
                          size="compact-xs"
                          variant="light"
                          color={reactionType.color}
                          styles={{
                            section: {
                              marginRight: 5,
                            },
                          }}
                          leftSection={
                            <Image
                              src={reactionType.iconSrc}
                              alt=""
                              fill={false}
                              width={14}
                              height={14}
                            />
                          }
                        >
                          <NumberFormat value={reaction.userIds.length} />
                        </Button>
                      </Menu.Target>

                      <ActivityReactionUsers userIds={reaction.userIds} />
                    </Menu>
                  );
                })}

                {availableReactions.length > 0 && (
                  <Popover shadow="md" position="top" withArrow>
                    <Popover.Target>
                      <ActionIcon variant="subtle" color="gray" size="sm">
                        <IconMoodPlus size={14} />
                      </ActionIcon>
                    </Popover.Target>

                    <Popover.Dropdown p={5}>
                      <Group gap={0}>
                        {availableReactions.map((type) => {
                          const reactionType = reactionTypes[type];
                          return (
                            <ActionIcon
                              key={type}
                              variant="subtle"
                              color={reactionType.color}
                              size="xl"
                              onClick={() => handleAddReaction(type)}
                            >
                              <Image
                                src={reactionType.iconSrc}
                                alt=""
                                fill={false}
                                width={25}
                                height={25}
                              />
                            </ActionIcon>
                          );
                        })}
                      </Group>
                    </Popover.Dropdown>
                  </Popover>
                )}
              </Group>

              {!activity.parentId && (
                <Group>
                  <Button
                    size="compact-xs"
                    variant={isShowReply ? "light" : "subtle"}
                    color={isShowReply ? undefined : "gray"}
                    onClick={() => setIsShowReply(!isShowReply)}
                  >
                    {activity.childCount && activity.childCount > 0 ? (
                      <Plural value={activity.childCount} one="# reply" other="# replies" />
                    ) : (
                      <Trans>Reply</Trans>
                    )}
                  </Button>
                </Group>
              )}
            </Group>
          </Stack>
        )}

        {isShowReply && (
          <Stack style={{ borderTop: `1px solid ${color("gray.1")}` }}>
            <ActivityReplies
              activityId={activity._id}
              contextId={activity.contextId}
              contextType={activity.contextType}
              autoFocus={!activity.childCount || activity.childCount === 0}
            />
          </Stack>
        )}
      </Stack>
    </Card>
  );
};
