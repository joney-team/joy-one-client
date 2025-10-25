"use client";

import { Avatar } from "@/components/avatar";
import { Checkbox } from "@/components/checkbox";
import { Container } from "@/components/container";
import { FormSession } from "@/components/form-session";
import { Image } from "@/components/image";
import { DateInput } from "@/components/inputs/date-input";
import { TimeZoneInput } from "@/components/inputs/timezone-input";
import { SessionTitle } from "@/components/session-title";
import { configs } from "@/configs/layout.config";
import { useLayout } from "@/layout/layout-context";
import { useAuth } from "@/modules/auth/auth-context";
import { getSessionId } from "@/modules/auth/auth-service";
import { useEventsListener } from "@/modules/events/event-service";
import { EventType } from "@/modules/events/event-types";
import { useLang } from "@/modules/lang/lang-context";
import { localeNames } from "@/modules/lang/lang-service";
import { Locale } from "@/modules/lang/lang-types";
import { onActionLoad } from "@/utils/actions";
import { t } from "@lingui/core/macro";
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
import { Dropzone, IMAGE_MIME_TYPE } from "@mantine/dropzone";
import { useForm } from "@mantine/form";
import { useDebouncedCallback } from "@mantine/hooks";
import { IconCalendar, IconMail, IconPhone, IconUpload, IconUser } from "@tabler/icons-react";
import { useEffect, type FC } from "react";
import { UserWorkspaceSettings } from "./components/user-workspace-settings-form";

export const UserProfileSettings: FC = () => {
  const auth = useAuth();
  const lang = useLang();
  const layout = useLayout();

  const onUpdate = useDebouncedCallback(auth.updateProfile, 300);

  useEffect(() => {
    layout.setComponents({
      head: t`Profile settings`,
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
            <FormSession title={t`Profile`} description={t`Your personal information`}>
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
                      <Text fz={10}>{t`Click to change avatar`}</Text>
                    </Group>
                  </Group>
                </Dropzone>

                <TextInput
                  leftSection={<IconUser size={16} />}
                  label={t`Name`}
                  {...form.getInputProps("name")}
                />
                <TextInput
                  leftSection={<IconPhone size={16} />}
                  label={t`Phone`}
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
                  label={t`Birthday`}
                  leftSection={<IconCalendar size={16} />}
                  value={auth.user!.birthday}
                  onChange={(date) => form.setFieldValue("birthday", date)}
                />
              </Stack>
            </FormSession>

            <Divider opacity={0.5} my={30} />

            <FormSession
              title={t`Language and region`}
              description={t`Customize your language and region settings`}
            >
              <Stack>
                <Select
                  label={t`Language`}
                  description={t`Change your language settings`}
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

                <TimeZoneInput label={t`Timezone`} {...form.getInputProps("settings.timezone")} />
              </Stack>
            </FormSession>

            <Divider opacity={0.5} my={30} />

            <FormSession title={t`Time settings`} description={t`Time settings for your profile`}>
              <Stack gap={30}>
                <InputWrapper label={t`Start of week`}>
                  <Stack gap={10} mt={10}>
                    <Checkbox
                      label={t`Sunday`}
                      checked={!!form.values.settings.isStartOfWeekSunday}
                      onChange={() => form.setFieldValue("settings.isStartOfWeekSunday", true)}
                    />

                    <Checkbox
                      label={t`Monday`}
                      checked={!!!form.values.settings.isStartOfWeekSunday}
                      onChange={() => form.setFieldValue("settings.isStartOfWeekSunday", false)}
                    />
                  </Stack>
                </InputWrapper>

                <InputWrapper label={t`Time format`}>
                  <Stack gap={10} mt={10}>
                    <Checkbox
                      label={t`12 hour`}
                      checked={!!form.values.settings.isTwelveHour}
                      onChange={() => form.setFieldValue("settings.isTwelveHour", true)}
                    />

                    <Checkbox
                      label={t`24 hour`}
                      checked={!!!form.values.settings.isTwelveHour}
                      onChange={() => form.setFieldValue("settings.isTwelveHour", false)}
                    />
                  </Stack>
                </InputWrapper>

                <InputWrapper label={t`Date format`}>
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
                      label={t`Auto`}
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

        <SessionTitle name={t`Workspace settings`} mb={-20} />

        <Card shadow="xs">
          <UserWorkspaceSettings userId={auth.user!._id} />
        </Card>
      </Stack>
    </Container>
  );
};
