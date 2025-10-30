"use client";

import { Avatar } from "@/components/avatar";
import { Checkbox } from "@/components/checkbox";
import { Container } from "@/components/container";
import { FormSession } from "@/components/form-session";
import { Image } from "@/components/image";
import { DateInput } from "@/components/inputs/date-input";
import { TimeZoneInput } from "@/components/inputs/timezone-input";
import { SectionTitle } from "@/components/session-title";
import { useLayout } from "@/layout/layout-context";
import { useAuth } from "@/modules/auth/auth-context";
import { getSessionId } from "@/modules/auth/auth-service";
import { useEventsListener } from "@/modules/events/event-service";
import { EventType } from "@/modules/events/event-types";
import { useLang } from "@/modules/lang/lang-context";
import { localeNames } from "@/modules/lang/lang-service";
import { AppLocale } from "@/modules/lang/lang-types";
import { onActionLoad } from "@/utils/actions";
import { Trans } from "@lingui/react/macro";
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
      head: <Trans>Profile settings</Trans>,
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
            <FormSession
              title={<Trans>Profile</Trans>}
              description={<Trans>Your personal information</Trans>}
            >
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
                      <Text fz={10}>
                        <Trans>Click to change avatar</Trans>
                      </Text>
                    </Group>
                  </Group>
                </Dropzone>

                <TextInput
                  leftSection={<IconUser size={16} />}
                  label={<Trans>Name</Trans>}
                  {...form.getInputProps("name")}
                />
                <TextInput
                  leftSection={<IconPhone size={16} />}
                  label={<Trans>Phone</Trans>}
                  {...form.getInputProps("phone")}
                  placeholder="090 0000 000"
                />
                <TextInput
                  leftSection={<IconMail size={16} />}
                  label={<Trans>Email</Trans>}
                  {...form.getInputProps("email")}
                  disabled={!!auth.user?.email}
                />
                <DateInput
                  label={<Trans>Birthday</Trans>}
                  leftSection={<IconCalendar size={16} />}
                  value={auth.user!.birthday}
                  onChange={(date) => form.setFieldValue("birthday", date)}
                />
              </Stack>
            </FormSession>

            <Divider opacity={0.5} my={30} />

            <FormSession
              title={<Trans>Language and region</Trans>}
              description={<Trans>Customize your language and region settings</Trans>}
            >
              <Stack>
                <Select
                  label={<Trans>Language</Trans>}
                  description={<Trans>Change your language settings</Trans>}
                  leftSection={
                    <Image src={`/lang/${form.values.settings.locale}.png`} w={16} h={16} />
                  }
                  data={Object.values(AppLocale).map((locale) => ({
                    label: localeNames[locale],
                    value: locale,
                  }))}
                  value={form.values.settings.locale}
                  onChange={(l) => lang.changeLocale(l as AppLocale)}
                />

                <TimeZoneInput
                  label={<Trans>Timezone</Trans>}
                  {...form.getInputProps("settings.timezone")}
                />
              </Stack>
            </FormSession>

            <Divider opacity={0.5} my={30} />

            <FormSession
              title={<Trans>Time settings</Trans>}
              description={<Trans>Time settings for your profile</Trans>}
            >
              <Stack gap={30}>
                <InputWrapper label={<Trans>Start of week</Trans>}>
                  <Stack gap={10} mt={10}>
                    <Checkbox
                      label={<Trans>Sunday</Trans>}
                      checked={!!form.values.settings.isStartOfWeekSunday}
                      onChange={() => form.setFieldValue("settings.isStartOfWeekSunday", true)}
                    />

                    <Checkbox
                      label={<Trans>Monday</Trans>}
                      checked={!!!form.values.settings.isStartOfWeekSunday}
                      onChange={() => form.setFieldValue("settings.isStartOfWeekSunday", false)}
                    />
                  </Stack>
                </InputWrapper>

                <InputWrapper label={<Trans>Time format</Trans>}>
                  <Stack gap={10} mt={10}>
                    <Checkbox
                      label={<Trans>12 hour</Trans>}
                      checked={!!form.values.settings.isTwelveHour}
                      onChange={() => form.setFieldValue("settings.isTwelveHour", true)}
                    />

                    <Checkbox
                      label={<Trans>24 hour</Trans>}
                      checked={!!!form.values.settings.isTwelveHour}
                      onChange={() => form.setFieldValue("settings.isTwelveHour", false)}
                    />
                  </Stack>
                </InputWrapper>
              </Stack>
            </FormSession>

            <Space h={30} />
          </Stack>
        </Card>

        <SectionTitle name={<Trans>Workspace settings</Trans>} mb={-20} />

        <Card shadow="xs">
          <UserWorkspaceSettings userId={auth.user!._id} />
        </Card>
      </Stack>
    </Container>
  );
};
