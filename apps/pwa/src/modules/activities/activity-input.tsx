"use client";

import { Editor, type EditorRef } from "@/components/editor/editor";
import { ActivityType } from "@/graphql/enums.graphql";
import { useColor } from "@/modules/theme/use-color";
import { onError } from "@/utils/exceptions.utils";
import { useMutation } from "@apollo/client/react";
import { useLingui } from "@lingui/react/macro";
import { ActionIcon, Card, Group, Stack } from "@mantine/core";
import { IconMicrophone, IconPaperclip, IconPhoto, IconSend } from "@tabler/icons-react";
import { FC, useEffect, useMemo, useRef, useState } from "react";
import { ActivitiesProps } from "./activities-types";
import ADD_ACTIVITY_MUTATION, {
  type AddActivityMutation,
  type AddActivityMutationVariables,
} from "./graphql/mutationAddActivity.graphql";

import { Avatar } from "@/components/avatar";
import { createObjectId } from "@joy-one-client/utils/object-id";
import { useFileDialog } from "@mantine/hooks";
import { setRefFile } from "../files/file-service";
import { useWorkspace } from "../workspaces/workspace-context";
import QUERY_ACTIVITIES from "./graphql/queryActivities.graphql";
import { useUploadFile } from "../files/hooks/use-upload-file";
import { renderFileUrl } from "../files/files-utils";
import { VoiceInput } from "@/components/inputs/voice-input/voice-input";

export const ActivityInput: FC<ActivitiesProps & { parentId?: string; autoFocus?: boolean }> = ({
  contextType,
  contextId,
  parentId,
  autoFocus = false,
}) => {
  const { t } = useLingui();
  const color = useColor();
  const editorRef = useRef<EditorRef>(null);
  const uploadFile = useUploadFile();
  const workspace = useWorkspace();
  const attachmentsDialog = useFileDialog({
    multiple: true,
    resetOnOpen: true,
  });

  const photosDialog = useFileDialog({
    multiple: true,
    resetOnOpen: true,
    accept: "image/*",
  });

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

  useEffect(() => {
    if (attachmentsDialog.files && attachmentsDialog.files.length > 0) {
      for (let index = 0; index < attachmentsDialog.files.length; index++) {
        const file = attachmentsDialog.files[index];
        try {
          const id = createObjectId();
          setRefFile(id, file);
          // Defer the addAttachment call to avoid flushSync warning
          setTimeout(() => {
            editorRef.current?.editor?.commands.addAttachment(id);
          }, 100 + index * 100);
        } catch (error) {
          console.trace(error);
        }
      }
    }
  }, [attachmentsDialog.files]);

  const handleAddPhoto = async (files: FileList) => {
    for (let index = 0; index < files.length; index++) {
      const file = files[index];
      try {
        const fileMetadata = await uploadFile(file, { maxWidthOrHeight: 1024 });

        setTimeout(() => {
          editorRef.current?.editor?.commands.insertContent({
            type: "image",
            attrs: {
              src: renderFileUrl(fileMetadata.url),
              style: "width: 500px; height: auto;",
            },
          });
        }, 100 + index * 100);
      } catch (error) {
        console.trace(error);
      }
    }
  };

  useEffect(() => {
    if (photosDialog.files && photosDialog.files.length > 0) {
      handleAddPhoto(photosDialog.files);
    }
  }, [photosDialog.files]);

  const editorKey = contextType + contextId + (parentId ?? "root") + "input";

  const actions = useMemo(() => {
    return (
      <Group justify="end" gap={0} mih={28}>
        <VoiceInput
          onComplete={(file) => {
            editorRef.current?.editor?.commands.addAttachment(file._id);
          }}
        >
          <ActionIcon color="gray" variant="subtle">
            <IconMicrophone size={14} />
          </ActionIcon>
        </VoiceInput>

        <ActionIcon color="gray" variant="subtle" onClick={() => photosDialog.open()}>
          <IconPhoto size={14} />
        </ActionIcon>

        <ActionIcon color="gray" variant="subtle" onClick={() => attachmentsDialog.open()}>
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
  }, [attachmentsDialog.files]);

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
          isEnableToolbar={false}
          isEnableBubbleMenu={false}
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
          isEnableToolbar={false}
          isEnableBubbleMenu={false}
          autoFocus={autoFocus}
          style={{ fontSize: 14 }}
        />

        {actions}
      </Stack>
    </Card>
  );
};
