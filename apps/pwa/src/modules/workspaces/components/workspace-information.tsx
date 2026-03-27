"use client";

import { Avatar } from "@/components/avatar";
import { WorkspaceType } from "@/graphql/enums.graphql";
import { useUploadFile } from "@/modules/files/hooks/use-upload-file";
import { WorkspacePermission } from "@/modules/workspace-roles/workspace-roles-types";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { onError } from "@/utils/exceptions.utils";
import { Trans, useLingui } from "@lingui/react/macro";
import {
  Anchor,
  Group,
  InputWrapper,
  LoadingOverlay,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  ThemeIcon,
} from "@mantine/core";
import { Dropzone, IMAGE_MIME_TYPE } from "@mantine/dropzone";
import { useForm } from "@mantine/form";
import { IconUpload } from "@tabler/icons-react";
import { FC, useState } from "react";
import { workspaceTypes } from "../workspace-constants";
import { WorkspaceTypeItem } from "./workpsace-type-item";

import { useDebouncedCallback } from "@mantine/hooks";
import { type UpdateWorkspaceMutationVariables } from "../graphql/mutationUpdateWorkspace.graphql";
import { useUpdateWorkspace } from "../hooks/useUpdateWorkspace";
import { normalizeWorkspaceInput } from "../workspaces-service";

export const WorkspaceInformation: FC = () => {
  const { t } = useLingui();
  const workspace = useWorkspace();
  const uploadFile = useUploadFile();
  const [avatarUploading, setAvatarUploading] = useState(false);
  const { updateWorkspace } = useUpdateWorkspace();

  const handleUpdateWorkspace = useDebouncedCallback(
    async (values: UpdateWorkspaceMutationVariables) => {
      await updateWorkspace({ variables: values }).catch(onError);
    },
    300,
  );

  const form = useForm({
    initialValues: normalizeWorkspaceInput(workspace.member.workspace),
    onValuesChange: handleUpdateWorkspace,
  });

  const handleUploadLogo = async (file: File) => {
    setAvatarUploading(true);
    try {
      const uploadedLogo = await uploadFile(file, { maxWidthOrHeight: 300 });
      await updateWorkspace({ variables: { ...form.values, logo: uploadedLogo.path } });
    } catch (error) {
      onError(error);
    }
    setAvatarUploading(false);
  };

  if (workspace.hasPermission(WorkspacePermission.WORKSPACE_SETTINGS))
    return (
      <Stack className="WorkspaceForm">
        <Dropzone
          accept={IMAGE_MIME_TYPE}
          onDrop={(files) => {
            if (!files.length) return;
            handleUploadLogo(files[0]);
          }}
          multiple={false}
        >
          <Group style={{ position: "relative" }} wrap="nowrap">
            <LoadingOverlay visible={avatarUploading} loaderProps={{ size: "xs" }} />
            <Avatar workspace={workspace.member?.workspace} size={80}>
              {workspace.member?.workspace.name?.slice(0, 2)}
            </Avatar>

            <Group gap={5}>
              <ThemeIcon variant="transparent" color="dark" size="md">
                <IconUpload strokeWidth={1.2} />
              </ThemeIcon>
              <Text fz={12}>
                <Trans>Click to change</Trans>
              </Text>
            </Group>
          </Group>
        </Dropzone>

        <TextInput
          label={<Trans>Name</Trans>}
          {...form.getInputProps("name")}
          placeholder="Gold Dental"
        />

        <SimpleGrid cols={{ md: 2 }}>
          <TextInput
            label={<Trans>Phone</Trans>}
            {...form.getInputProps("phone")}
            placeholder="090888888"
          />
          <TextInput label="Hotline" {...form.getInputProps("hotline")} placeholder="19008088" />
        </SimpleGrid>

        <TextInput label={<Trans>Address</Trans>} {...form.getInputProps("location.address")} />

        <InputWrapper label={<Trans>Workspace type</Trans>} {...form.getInputProps("type")}>
          <Group gap={10} pt={5}>
            {Object.values(WorkspaceType).map((type) => {
              return (
                <WorkspaceTypeItem
                  key={type}
                  icon={workspaceTypes[type].icon}
                  label={t(workspaceTypes[type].name)}
                  isActive={form.values.type === type}
                  onClick={() => form.setFieldValue("type", type)}
                />
              );
            })}
          </Group>
        </InputWrapper>
      </Stack>
    );

  return (
    <Stack>
      <Group wrap="nowrap">
        <Group style={{ position: "relative" }}>
          <LoadingOverlay visible={avatarUploading} loaderProps={{ size: "xs" }} />
          <Avatar src={workspace.member?.workspace?.logo} size={60}>
            {workspace.member?.name?.slice(0, 2)}
          </Avatar>
        </Group>

        <Stack gap={5}>
          <Text fw={500}>{workspace.member?.name}</Text>
          {workspace.member?.workspace?.hotline && (
            <Anchor href={`tel:${workspace.member?.workspace.hotline}`} c="dark">
              <Text fz={12}>Hotline: {workspace.member?.workspace.hotline}</Text>
            </Anchor>
          )}
          {workspace.member?.workspace?.location && (
            <Text fz={12}>
              <Trans>Address</Trans>: {workspace.member.workspace.location?.address}
            </Text>
          )}
        </Stack>
      </Group>
    </Stack>
  );
};
