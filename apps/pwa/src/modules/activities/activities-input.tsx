"use client";

import { Editor, type EditorRef } from "@/components/editor/editor";
import { ActivityType } from "@/graphql/enums.graphql";
import { useColor } from "@/modules/theme/use-color";
import { onError } from "@/utils/exceptions.utils";
import { useMutation } from "@apollo/client/react";
import { useLingui } from "@lingui/react/macro";
import { ActionIcon, Card, Group, Stack } from "@mantine/core";
import { IconMicrophone, IconPaperclip, IconSend } from "@tabler/icons-react";
import { FC, useMemo, useRef, useState } from "react";
import { ActivitiesProps } from "./activities-types";
import ADD_ACTIVITY_MUTATION, {
  type AddActivityMutation,
  type AddActivityMutationVariables,
} from "./graphql/mutationAddActivity.graphql";

import { Avatar } from "@/components/avatar";
import { useWorkspace } from "../workspaces/workspace-context";
import QUERY_ACTIVITIES from "./graphql/queryActivities.graphql";

export const ActivitiesInput: FC<ActivitiesProps & { parentId?: string; autoFocus?: boolean }> = ({
  contextType,
  contextId,
  parentId,
  autoFocus = false,
}) => {
  const { t } = useLingui();
  const color = useColor();
  const editorRef = useRef<EditorRef>(null);
  const workspace = useWorkspace();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [addActivity] = useMutation<AddActivityMutation, AddActivityMutationVariables>(
    ADD_ACTIVITY_MUTATION
  );

  const onSubmit = async () => {
    try {
      setIsSubmitting(true);
      const contentJSON = editorRef.current?.getJSON();
      if (!contentJSON || !contentJSON.content || contentJSON.content.length === 0) return;

      await addActivity({
        variables: {
          contextType,
          contextId,
          type: ActivityType.Comment,
          content: JSON.stringify(contentJSON),
          parentId,
        },
        refetchQueries: [QUERY_ACTIVITIES],
      });
      editorRef.current?.clear();
    } catch (error) {
      onError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const editorKey = contextType + contextId + (parentId ?? "root") + "input";

  const actions = useMemo(() => {
    return (
      <Group justify="end" gap={0} mih={28}>
        <ActionIcon color="gray" variant="subtle">
          <IconMicrophone size={14} />
        </ActionIcon>

        <ActionIcon color="gray" variant="subtle">
          <IconPaperclip size={14} />
        </ActionIcon>

        <ActionIcon
          ml="xs"
          color="gray"
          variant="outline"
          style={{ borderColor: color("gray.4") }}
          loading={isSubmitting}
          onClick={onSubmit}
          component="button"
        >
          <IconSend size={14} />
        </ActionIcon>
      </Group>
    );
  }, []);

  if (parentId) {
    return (
      <Group pl={4} gap={8} w="100%" align="start">
        <Stack mih={28} justify="center">
          <Avatar user={workspace.member} size={18} hideOnlineStatus />
        </Stack>

        <Editor
          key={editorKey}
          ref={editorRef}
          placeholder={t`Leave a comment...`}
          isNonWrapped
          isShowToolbar={false}
          style={{ fontSize: 14 }}
          container={{ flex: 1, pt: 4 }}
          autoFocus={autoFocus}
        />

        {actions}
      </Group>
    );
  }

  return (
    <Card withBorder p="sm" shadow="xs" style={{ borderColor: color("gray.1") }}>
      <Stack gap="sm">
        <Editor
          key={editorKey}
          ref={editorRef}
          placeholder={t`Leave a comment...`}
          isNonWrapped
          isShowToolbar={false}
          autoFocus={autoFocus}
          style={{ fontSize: 14 }}
        />

        {actions}
      </Stack>
    </Card>
  );
};
