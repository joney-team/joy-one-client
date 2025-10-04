"use client";

import { Checkbox } from "@/components/checkbox";
import { Container } from "@/components/container";
import { FormSession } from "@/components/form-session";
import { Image } from "@/components/image";
import { DateInput } from "@/components/inputs/date-input";
import { TimeZoneInput } from "@/components/inputs/timezone-input";
import { SessionTitle } from "@/components/session-title";
import { configs } from "@/configs/layout.config";
import { useAuth } from "@/modules/auth/auth-context";
import { getSessionId } from "@/modules/auth/auth-service";
import { useEventsListener } from "@/modules/events/event-service";
import { EventType } from "@/modules/events/event-types";
import { useLang } from "@/modules/lang/lang-context";
import { localeNames, t } from "@/modules/lang/lang-service";
import { Locale } from "@/modules/lang/lang-types";
import {
  Card,
  Divider,
  Group,
  InputWrapper,
  Select,
  Space,
  Stack,
  Text,
  TextInput,
  ThemeIcon,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDebouncedCallback } from "@mantine/hooks";
import { IconCalendar, IconMail, IconPhone, IconUpload, IconUser } from "@tabler/icons-react";
import { useEffect, type FC } from "react";
import { UserWorkspaceSettings } from "./components/user-workspace-settings-form";
import { Dropzone, IMAGE_MIME_TYPE } from "@mantine/dropzone";
import { onActionLoad } from "@/utils/actions";
import { Avatar } from "@/components/avatar";
import { useLayout } from "@/layout/layout-context";

export const UserProfileSettings: FC = () => {
  const auth = useAuth();
  const lang = useLang();
  const layout = useLayout();

  const onUpdate = useDebouncedCallback(auth.updateProfile, 300);

  useEffect(() => {
    layout.setComponents({
      head: t("profile_settings"),
    });
  }, []);

  const form = useForm({
    initialValues: auth.user!,
    onValuesChange: onUpdate,
  });

  useEventsListener(
    [EventType.USER_PROFILE_UPDATED],
    (event) => {
      const sessionId = getSessionId();
      if (event.userId === auth.user!._id && event.sessionId !== sessionId) {
        form.setValues(event.data);
      }
    },
    []
  );

  return (
    <Container p={16}>
      <Stack gap={30}>
        <Card shadow="xs">
          <Stack>
            <FormSession title="profile" description="profile_description">
              <Stack>
                <Dropzone
                  accept={IMAGE_MIME_TYPE}
                  onDrop={(files) => {
                    if (!files.length) return;
                    onActionLoad({
                      process: () => auth.uploadAvatar(files[0]),
                    });
                  }}
                  multiple={false}
                >
                  <Group className="clickable" gap={5}>
                    <Avatar
                      user={{
                        name: auth.user.name,
                        avatar: auth.user.avatar,
                        userId: auth.user._id,
                      }}
                      size={60}
                      hideOnlineStatus
                    />

                    <Group gap={5}>
                      <ThemeIcon variant="transparent" color="dark" size="md">
                        <IconUpload strokeWidth={1.2} size={16} />
                      </ThemeIcon>
                      <Text fz={10}>{t("click-to-change-avatar")}</Text>
                    </Group>
                  </Group>
                </Dropzone>

                <TextInput
                  leftSection={<IconUser size={16} />}
                  label={t("name")}
                  {...form.getInputProps("name")}
                />
                <TextInput
                  leftSection={<IconPhone size={16} />}
                  label={t("phone")}
                  {...form.getInputProps("phone")}
                  placeholder="090 0000 000"
                />
                <TextInput
                  leftSection={<IconMail size={16} />}
                  label="Email"
                  {...form.getInputProps("email")}
                  disabled={!!auth.user?.email}
                />
                <DateInput
                  label={t("birthday")}
                  leftSection={<IconCalendar size={16} />}
                  value={auth.user!.birthday}
                  onChange={(date) => form.setFieldValue("birthday", date)}
                />
              </Stack>
            </FormSession>

            <Divider opacity={0.5} my={30} />

            <FormSession title="lang_region" description="lang_region_desc">
              <Stack>
                <Select
                  label={t("language")}
                  description={t("change_locale_desc")}
                  leftSection={
                    <Image src={`/lang/${form.values.settings.locale}.png`} w={16} h={16} />
                  }
                  data={Object.values(Locale).map((locale) => ({
                    label: localeNames[locale],
                    value: locale,
                  }))}
                  value={form.values.settings.locale}
                  onChange={(l) => lang.setLocale(l as Locale)}
                />

                <TimeZoneInput label={t("timezone")} {...form.getInputProps("settings.timezone")} />
              </Stack>
            </FormSession>

            <Divider opacity={0.5} my={30} />

            <FormSession title="time_settings" description="time_settings_desc">
              <Stack gap={30}>
                <InputWrapper label={t("start_of_week")}>
                  <Stack gap={10} mt={10}>
                    <Checkbox
                      label={t("sunday")}
                      checked={!!form.values.settings.isStartOfWeekSunday}
                      onChange={() => form.setFieldValue("settings.isStartOfWeekSunday", true)}
                    />

                    <Checkbox
                      label={t("monday")}
                      checked={!!!form.values.settings.isStartOfWeekSunday}
                      onChange={() => form.setFieldValue("settings.isStartOfWeekSunday", false)}
                    />
                  </Stack>
                </InputWrapper>

                <InputWrapper label={t("time_format")}>
                  <Stack gap={10} mt={10}>
                    <Checkbox
                      label={t("12_hour")}
                      checked={!!form.values.settings.isTwelveHour}
                      onChange={() => form.setFieldValue("settings.isTwelveHour", true)}
                    />

                    <Checkbox
                      label={t("24_hour")}
                      checked={!!!form.values.settings.isTwelveHour}
                      onChange={() => form.setFieldValue("settings.isTwelveHour", false)}
                    />
                  </Stack>
                </InputWrapper>

                <InputWrapper label={t("date_format")}>
                  <Stack gap={10} mt={10}>
                    {configs.dateFormats.map((f) => {
                      return (
                        <Checkbox
                          key={f}
                          label={f}
                          checked={form.values.settings.dateFormat === f}
                          onChange={() => form.setFieldValue("settings.dateFormat", f)}
                        />
                      );
                    })}

                    <Checkbox
                      label={t("auto")}
                      checked={
                        form.values.settings.dateFormat === "auto" ||
                        !form.values.settings.dateFormat
                      }
                      onChange={() => form.setFieldValue("settings.dateFormat", "auto")}
                    />
                  </Stack>
                </InputWrapper>
              </Stack>
            </FormSession>

            <Space h={30} />
          </Stack>
        </Card>

        <SessionTitle name="workspace-settings" mb={-20} />

        <Card shadow="xs">
          <UserWorkspaceSettings userId={auth.user!._id} />
        </Card>
      </Stack>
    </Container>
  );
};
