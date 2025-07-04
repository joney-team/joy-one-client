"use client";

import { Avatar } from "@/components/avatar";
import { DateInput } from "@/components/inputs/date-input";
import { useAuth } from "@/modules/auth/auth-context";
import { onUploadFile, removeFileFromRelativePath } from "@/modules/files/file-service";
import { t } from "@/modules/lang/lang-service";
import { onError } from "@/utils/exceptions.utils";
import { Group, LoadingOverlay, Stack, Text, TextInput, ThemeIcon } from "@mantine/core";
import { Dropzone, IMAGE_MIME_TYPE } from "@mantine/dropzone";
import { useForm } from "@mantine/form";
import { IconUpload } from "@tabler/icons-react";
import { FC, useState } from "react";

let timeout: NodeJS.Timeout;

export const ProfileForm: FC = () => {
  const auth = useAuth();
  const [avatarUploading, setAvatarUploading] = useState(false);

  const form = useForm({
    initialValues: auth.user!,
    onValuesChange: (values) => {
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => {
        auth.updateProfile(values as any).catch(onError);
      }, 300);
    },
  });

  const handleUploadAvatar = async (file: File) => {
    setAvatarUploading(true);
    try {
      const currentAvatar = auth.user?.avatar;
      const _avatarFile = await onUploadFile({ file, maxWidthOrHeight: 300 });
      await auth.updateProfile({ ...auth.user!, avatar: _avatarFile.relativePath } as any);
      if (currentAvatar) await removeFileFromRelativePath(currentAvatar).catch(() => false);
    } catch (error) {
      onError(error);
    }
    setAvatarUploading(false);
  };

  return (
    <Stack>
      <Dropzone
        accept={IMAGE_MIME_TYPE}
        onDrop={(files) => {
          if (!files.length) return;
          handleUploadAvatar(files[0]);
        }}
        multiple={false}
      >
        <Group style={{ position: "relative" }}>
          <LoadingOverlay visible={avatarUploading} loaderProps={{ size: "xs" }} />
          <Avatar
            user={{
              name: auth.user.name,
              avatar: auth.user.avatar,
              userId: auth.user._id,
            }}
            size={60}
          />

          <Group gap={5}>
            <ThemeIcon variant="transparent" color="dark" size="md">
              <IconUpload strokeWidth={1.2} />
            </ThemeIcon>
            <Text fz={12}>{t("click-to-change-avatar")}</Text>
          </Group>
        </Group>
      </Dropzone>

      <TextInput label={t("name")} {...form.getInputProps("name")} />
      <TextInput label={t("phone")} {...form.getInputProps("phone")} placeholder="090 000 000" />
      <TextInput
        label="Email"
        {...form.getInputProps("email")}
        disabled={auth.user!.isEmailVerified}
      />
      <DateInput
        label={t("birthday")}
        defaultValue={auth.user!.birthday}
        onChange={(date) => form.setFieldValue("birthday", date)}
      />
    </Stack>
  );
};
