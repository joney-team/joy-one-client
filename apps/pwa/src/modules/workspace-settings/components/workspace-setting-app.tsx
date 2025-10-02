"use client";

import { useApp } from "@/app.context";
import { Avatar } from "@/components/avatar";
import { Button } from "@/components/buttons/button";
import { CopyText } from "@/components/copy-text";
import { Renderer } from "@/components/renderer";
import { getColorShape } from "@/modules/theme/generator";
import { onUploadWorkspaceFile, removeFileFromRelativePath } from "@/modules/files/file-service";
import { t } from "@/modules/lang/lang-service";
import { useColor } from "@/modules/theme/use-color";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { onError } from "@/utils/exceptions.utils";
import { getDnsRecordName, getMainDomain, isDomain } from "@/utils/string.utils";
import {
  Card,
  Center,
  ColorSwatch,
  Group,
  InputWrapper,
  SimpleGrid,
  Slider,
  Stack,
  Text,
  ThemeIcon,
  TextInput,
  useMantineTheme,
} from "@mantine/core";
import { Dropzone, IMAGE_MIME_TYPE } from "@mantine/dropzone";
import { useForm } from "@mantine/form";
import { IconCheck, IconExternalLink, IconUpload } from "@tabler/icons-react";
import { FC, useState } from "react";

export const WorkspaceAppSettings: FC = () => {
  const workspace = useWorkspace();
  const app = useApp();
  const theme = useMantineTheme();
  const color = useColor();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm({
    initialValues: {
      appDomain: workspace.userMember.workspace.appDomain || "",
      appName: workspace.userMember.workspace.appName || "",
      appColor: workspace.userMember.workspace.appColor || "primary",
      appColorShape: getColorShape(workspace.userMember.workspace.appColorShape || 0),
    } as any,
    validate: {
      appDomain: (value: string) => {
        if (value && !value.includes("localhost") && !/^[a-z0-9-]+(\.[a-z0-9-]+)+$/.test(value))
          return t("invalid_domain");
      },
    },
  });

  const onSubmit = form.onSubmit(async (values) => {
    setIsSubmitting(true);

    try {
      let appIcon = workspace.userMember.workspace.appIcon;

      if (values.iconFile) {
        const currentLogo = workspace.userMember.workspace.appIcon;
        const _file = await onUploadWorkspaceFile({ file: values.iconFile, maxWidthOrHeight: 512 });
        appIcon = _file.relativePath;
        if (currentLogo) await removeFileFromRelativePath(currentLogo).catch(() => false);
      }

      await workspace.update({
        ...workspace.userMember.workspace,
        appIcon,
        appDomain: values.appDomain?.trim(),
        appName: values.appName,
        appColor: values.appColor,
        appColorShape: values.appColorShape,
      });
    } catch (error) {
      onError(error);
    }

    setIsSubmitting(false);
  });

  return (
    <Stack>
      <SimpleGrid cols={{ md: 2 }}>
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
                    : workspace.userMember.workspace.appIcon
                }
                size={50}
                radius={10}
              >
                {workspace.userMember?.workspace?.code?.slice(0, 2)}
              </Avatar>

              <Group gap={5}>
                <ThemeIcon variant="transparent" color="dark" size="md">
                  <IconUpload strokeWidth={1.2} />
                </ThemeIcon>
                <Text fz={12}>{t("change_app_icon")}</Text>
              </Group>
            </Group>
          </Dropzone>

          <TextInput label={t("name")} {...form.getInputProps("appName")} />

          <InputWrapper label={t("theme_color")}>
            <Card p={10} mt={3} withBorder shadow="none">
              <Stack>
                <Group gap={10}>
                  {[
                    "primary",
                    "pink",
                    "grape",
                    "violet",
                    "indigo",
                    "blue",
                    "cyan",
                    "teal",
                    "green",
                    "lime",
                    "yellow",
                    "orange",
                  ].map((color) => {
                    return (
                      <ColorSwatch
                        key={color}
                        color={theme.colors[color][6]}
                        style={{ cursor: "pointer" }}
                        onClick={() => form.setFieldValue("appColor", color)}
                        radius={5}
                        size={40}
                      >
                        {form.values.appColor === color && (
                          <IconCheck strokeWidth={1.8} size={18} color="white" />
                        )}
                      </ColorSwatch>
                    );
                  })}
                </Group>

                <Stack pb={5} gap={5}>
                  <Text fz={12} c="gray">
                    {t("color_shape")}
                  </Text>
                  <Slider
                    w={200}
                    maw="100%"
                    color={color(`${form.values.appColor}.${form.values.appColorShape}`)}
                    value={(form.values.appColorShape + 1) * 10}
                    min={10}
                    step={10}
                    onChange={(e) => {
                      form.setFieldValue("appColorShape", e / 10 - 1);
                    }}
                  />
                </Stack>
              </Stack>
            </Card>
          </InputWrapper>
        </Stack>

        <Stack>
          <TextInput
            label={t("domain")}
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

          <Renderer visible={!!app.config.workspaceDomainIP && isDomain(form.values.appDomain)}>
            <Group>
              <Card withBorder shadow="none">
                <Stack gap={3}>
                  <Text fz={16}>
                    {t("register_dns_domain")}{" "}
                    <strong>{getMainDomain(form.values.appDomain)}</strong>
                  </Text>
                  <Group>
                    <Text fz={16}>Type:</Text>
                    <CopyText text="A">
                      <Text fz={16} fw={700}>
                        A
                      </Text>
                    </CopyText>
                  </Group>

                  <Group>
                    <Text fz={16}>Name:</Text>
                    <CopyText text={getDnsRecordName(form.values.appDomain)}>
                      <Text fz={16} fw={700}>
                        {getDnsRecordName(form.values.appDomain)}
                      </Text>
                    </CopyText>
                  </Group>

                  <Group>
                    <Text fz={16}>IPv4 address:</Text>
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
                      {t("open_app")}
                    </Button>
                  </Group>
                </Stack>
              </Card>
            </Group>
          </Renderer>
        </Stack>
      </SimpleGrid>

      <Center>
        <Button type="submit" onClick={onSubmit} loading={isSubmitting} miw={150}>
          {t("update")}
        </Button>
      </Center>
    </Stack>
  );
};
