"use client";

import { Editor, type EditorRef } from "@/components/editor/editor";
import { useColor } from "@/modules/theme/use-color";
import { useLingui } from "@lingui/react/macro";
import { ActionIcon, Card, Group, Stack } from "@mantine/core";
import { IconSend } from "@tabler/icons-react";
import { FC, useRef, useState } from "react";
import { ActivitiesProps } from "./activities-types";
import { useMutation } from "@apollo/client/react";
import ADD_ACTIVITY_MUTATION, {
  type AddActivityMutation,
  type AddActivityMutationVariables,
} from "./graphql/addActivity.graphql";
import { ActivityType } from "@/graphql/enums.graphql";
import { onError } from "@/utils/exceptions.utils";

import QUERY_ACTIVITIES from "./graphql/queryActivities.graphql";

export const ActivitiesInput: FC<ActivitiesProps> = ({ contextType, contextId }) => {
  const { t } = useLingui();
  const color = useColor();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const editorRef = useRef<EditorRef>(null);

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
          type: ActivityType.Post,
          content: JSON.stringify(contentJSON),
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

  return (
    <Card withBorder p="md" shadow="xs" style={{ borderColor: color("gray.1") }}>
      <Stack gap="sm">
        <Editor
          key={contextType + contextId + "input"}
          ref={editorRef}
          placeholder={t`Leave a comment...`}
          isNonWrapped
          isShowToolbar={false}
        />

        <Group justify="end">
          <ActionIcon
            color="gray"
            variant="outline"
            style={{ borderColor: color("gray.4") }}
            loading={isSubmitting}
            onClick={onSubmit}
          >
            <IconSend size={14} />
          </ActionIcon>
        </Group>
      </Stack>
    </Card>
  );
};
