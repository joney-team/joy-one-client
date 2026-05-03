"use client";

import { useApp } from "@/app.context";
import { Avatar } from "@/components/avatar";
import { Button } from "@/components/buttons/button";
import { CopyText } from "@/components/copy-text";
import { useUploadFile } from "@/modules/files/hooks/use-upload-file";
import WORKSPACE_DATE_FRAGMENT from "@/modules/workspaces/graphql/fragmentWorkspace.graphql";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { onError } from "@/utils/exceptions.utils";
import { getDnsRecordName, getMainDomain, isDomain } from "@/utils/string.utils";
import { useMutation } from "@apollo/client/react";
import { swatches } from "@joy-one-client/config/colors";
import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import {
  Card,
  Center,
  ColorInput,
  Group,
  InputWrapper,
  Slider,
  Stack,
  Text,
  TextInput,
  ThemeIcon,
} from "@mantine/core";
import { Dropzone, IMAGE_MIME_TYPE } from "@mantine/dropzone";
import { useForm } from "@mantine/form";
import { IconExternalLink, IconUpload } from "@tabler/icons-react";
import { FC, useState } from "react";

import { WorkspaceInput } from "@/graphql/types.graphql";
import UpdateWorkspaceDocument from "@/modules/workspaces/graphql/updateWorkspace.graphql";
import { normalizeWorkspaceInput } from "@/modules/workspaces/workspaces-service";
import config from "@joy-one-client/config";
import { generateColorsMap } from "@mantine/colors-generator";
import { Container } from "@/components/container";

export const WorkspaceAppSettings: FC = () => {
  const workspace = useWorkspace();
  const app = useApp();
  const uploadFile = useUploadFile();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { baseColorIndex } = generateColorsMap(app.metadata.color ?? config.PRIMARY_COLOR);

  const form = useForm<
    Pick<WorkspaceInput, "appDomain" | "appName" | "appColor" | "appColorShape"> & {
      iconFile?: File;
    }
  >({
    initialValues: {
      appDomain: workspace.member.workspace.appDomain || "",
      appName: workspace.member.workspace.appName || "",
      appColor: workspace.member.workspace.appColor || config.PRIMARY_COLOR,
      appColorShape:
        workspace.member.workspace.appColorShape || app.metadata.colorShape || baseColorIndex,
    } as any,
    validate: {
      appDomain: (value) => {
        if (value && !value.includes("localhost") && !/^[a-z0-9-]+(\.[a-z0-9-]+)+$/.test(value))
          return t`Invalid domain`;
      },
    },
  });

  const [updateWorkspace] = useMutation(UpdateWorkspaceDocument, {
    update: (cache, result) => {
      if (!result.data) return;
      cache.updateFragment(
        {
          id: `Workspace:${result.data.workspace._id}`,
          fragment: WORKSPACE_DATE_FRAGMENT,
          fragmentName: "Workspace",
        },
        (data) => {
          if (!data) return data;

          return {
            ...data,
            ...result.data?.workspace,
          };
        },
      );
    },
  });

  const onSubmit = form.onSubmit(async (values) => {
    setIsSubmitting(true);

    try {
      let appIcon = workspace.member.workspace.appIcon ?? "";

      if (values.iconFile) {
        const uploadedLogo = await uploadFile(values.iconFile, { maxWidthOrHeight: 512 });
        appIcon = uploadedLogo.path;
      }

      await updateWorkspace({
        variables: {
          input: {
            ...normalizeWorkspaceInput(workspace.member.workspace),
            appIcon,
            appDomain: values.appDomain?.trim(),
            appName: values.appName ?? "",
            appColor: values.appColor ?? "",
            appColorShape: values.appColorShape || 6,
          },
        },
      });
    } catch (error) {
      onError(error);
    }

    setIsSubmitting(false);
  });

  return (
    <Stack>
      <Stack className="WorkspaceApp">
        <Dropzone
          accept={IMAGE_MIME_TYPE}
          onDrop={(files) => {
            if (!files.length) return;
            form.setFieldValue("iconFile", files[0]);
          }}
          multiple={false}
        >
          <Group style={{ position: "relative" }} wrap="nowrap">
            <Avatar
              src={
                form.values.iconFile
                  ? URL.createObjectURL(form.values.iconFile)
                  : workspace.member.workspace.appIcon
              }
              size={50}
              radius={5}
            >
              {workspace.member?.workspace?.code?.slice(0, 2)}
            </Avatar>

            <Group gap={5}>
              <ThemeIcon variant="transparent" color="dark" size="md">
                <IconUpload strokeWidth={1.2} />
              </ThemeIcon>
              <Text fz={12}>{<Trans>Change app icon</Trans>}</Text>
            </Group>
          </Group>
        </Dropzone>

        <TextInput
          label={<Trans>Name</Trans>}
          {...form.getInputProps("appName")}
          placeholder={workspace.member.workspace.name}
        />

        <ColorInput
          label={<Trans>Brand color</Trans>}
          format="hex"
          swatches={swatches}
          value={form.values.appColor ?? undefined}
          onChange={(value) => form.setFieldValue("appColor", value)}
        />

        <InputWrapper label={<Trans>Color shape</Trans>}>
          <Slider
            value={form.values.appColorShape || 6}
            onChange={(value) => form.setFieldValue("appColorShape", value)}
            min={0}
            max={9}
            step={1}
          />
        </InputWrapper>

        <Stack>
          <TextInput
            label={<Trans>Custom Domain</Trans>}
            placeholder={`workspace.example.com`}
            {...form.getInputProps("appDomain")}
            onChange={(e) => {
              const value = e.target.value
                .trim()
                .replace(/https?:\/\//, "")
                .split("/")[0];
              form.setFieldValue("appDomain", value);
            }}
          />

          {!!app.config.workspaceDomainIP &&
            !!form.values.appDomain &&
            isDomain(form.values.appDomain) && (
              <Group>
                <Card withBorder shadow="none">
                  <Stack gap={3}>
                    <Text fz={16}>
                      <Trans>
                        You need to create a DNS Record with domain{" "}
                        <strong>{getMainDomain(form.values.appDomain)}</strong>
                      </Trans>
                    </Text>
                    <Group>
                      <Text fz={16}>
                        <Trans>Type</Trans>
                        {":"}
                      </Text>
                      <CopyText text="A">
                        <Text fz={16} fw={700}>
                          A
                        </Text>
                      </CopyText>
                    </Group>

                    <Group>
                      <Text fz={16}>
                        <Trans>Name</Trans>
                        {":"}
                      </Text>
                      <CopyText text={getDnsRecordName(form.values.appDomain)}>
                        <Text fz={16} fw={700}>
                          {getDnsRecordName(form.values.appDomain)}
                        </Text>
                      </CopyText>
                    </Group>

                    <Group>
                      <Text fz={16}>
                        <Trans>IPv4 address</Trans>
                        {":"}
                      </Text>
                      <CopyText text={app.config.workspaceDomainIP}>
                        <Text fz={16} fw={700}>
                          {app.config.workspaceDomainIP}
                        </Text>
                      </CopyText>
                    </Group>

                    <Group mt={10}>
                      <Button
                        variant="light"
                        radius={100}
                        rightIcon={IconExternalLink}
                        onClick={() => window.open(`https://${form.values.appDomain}`, "_blank")}
                      >
                        <Trans>Open app</Trans>
                      </Button>
                    </Group>
                  </Stack>
                </Card>
              </Group>
            )}
        </Stack>
      </Stack>

      <Center>
        <Button type="submit" onClick={() => onSubmit()} loading={isSubmitting} miw={150}>
          <Trans>Update</Trans>
        </Button>
      </Center>
    </Stack>
  );
};

export const WorkspaceAppSettingsPage: FC = () => {
  return (
    <Container p="md">
      <Card shadow="xs">
        <WorkspaceAppSettings />
      </Card>
    </Container>
  );
};
