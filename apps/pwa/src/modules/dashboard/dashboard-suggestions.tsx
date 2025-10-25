"use client";

import { onAppChannelMessage, postAppChannelMessage } from "@/app.channel";
import { useApp } from "@/app.context";
import { Button } from "@/components/buttons/button";
import { Renderer } from "@/components/renderer";
import { useLayout } from "@/layout/layout-context";
import { OnInstallWebAppTutorial } from "@/modals/modal-install-web-app-tutorial";
import { onActionLoad } from "@/utils/actions";
import { onError } from "@/utils/exceptions.utils";
import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import {
  ActionIcon,
  Anchor,
  Card,
  Group,
  Image,
  SimpleGrid,
  Stack,
  Text,
  em,
  rem,
} from "@mantine/core";
import { useLocalStorage } from "@mantine/hooks";
import { modals } from "@mantine/modals";
import { IconBell, IconX } from "@tabler/icons-react";
import { FC, useEffect, useMemo, useState } from "react";
import { useAuth } from "../auth/auth-context";
import { useLang } from "../lang/lang-context";
import { useColor } from "../theme/use-color";

interface SuggestionItemProps extends Suggestion {
  onRefresh: () => void;
  onIgnore: () => void;
}

const SuggestionItem: FC<SuggestionItemProps> = (props) => {
  const color = useColor();
  const { title, message, image } = props;

  const onClick = async () => {
    try {
      await props.onClick();
      props.onRefresh();
    } catch (error) {
      onError(error);
    }
  };

  useEffect(() => {
    if (props.onRendered) {
      const timer = setTimeout(() => {
        props.onRendered?.();
      }, 500);

      return () => {
        clearTimeout(timer);
      };
    }
  }, [props.onRendered]);

  return (
    <Card
      bg={color(props.bg || "primary.5")}
      p={10}
      style={{ cursor: "pointer" }}
      onClick={onClick}
    >
      <Group justify="space-between" align="start" wrap="nowrap">
        <Group wrap="nowrap">
          <img src={image} style={{ width: 50, height: 50, objectFit: "contain" }} />

          <Stack gap={0}>
            <Text fw={700} fz={em(15)} c="white">
              {title}
            </Text>
            <Stack fz={rem(12)} c="white">
              {message}
            </Stack>
          </Stack>
        </Group>

        <Renderer visible={!props.notIgnore}>
          <ActionIcon
            variant="transparent"
            color="white"
            mt={-10}
            mr={-10}
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              props.onIgnore();
            }}
          >
            <IconX size={16} />
          </ActionIcon>
        </Renderer>
      </Group>
    </Card>
  );
};

interface Suggestion {
  id: string;
  title: string;
  message: React.ReactNode;
  image: string;
  bg?: any;
  notIgnore?: boolean;
  onClick: () => Promise<void> | void;
  onRendered?: () => void;
}

export const DashboardSuggestions: FC = () => {
  const app = useApp();
  const auth = useAuth();
  const lang = useLang();
  const layout = useLayout();
  const [version, setVersion] = useState(0);

  const [ignored, setIgnored] = useLocalStorage<string[]>({
    key: "dashboard-suggestions-ignored",
    defaultValue: [],
  });

  const suggestions: Suggestion[] = useMemo(() => {
    if (!app.isInitialized || !auth.isInitialized) return [];
    const output: Suggestion[] = [];

    const isNotificationAvailable = layout.isStandalone || layout.view === "desktop";
    if (
      isNotificationAvailable &&
      !auth.device.notificationToken &&
      !ignored.includes("notification")
    ) {
      const onCloseModal = (isIgnore = false) => {
        modals.close("modal_turn_on_notification");
        if (isIgnore) localStorage.setItem("ignore_modal_noti", "true");
      };

      output.push({
        id: "notification",
        title: t`Turn on notification`,
        message: t`To not miss important information`,
        image: "/images/notification.png",
        onClick: () =>
          onActionLoad({
            name: t`Turn on notification`,
            icon: IconBell,
            process: () => auth.registerNotification(),
          }),
        onRendered: () => {
          const ignoreModal = localStorage.getItem("ignore_modal_noti");
          if (ignoreModal) return;

          modals.open({
            modalId: "modal_turn_on_notification",
            withCloseButton: false,
            onClose: () => onCloseModal(),
            children: (
              <Stack justify="center" align="center" py={8}>
                <Image src="/images/notification.png" w={100} h={100} />
                <Stack gap={3}>
                  <Text fw={600} ta="center" fz={20} tt="uppercase">
                    {t`Turn on notification`}
                  </Text>
                  <Text ta="center" fw={300}>
                    {t`Receive important system notifications related to customers, messages, tasks,...`}
                  </Text>
                </Stack>

                <Button
                  action
                  mt={15}
                  onClick={async () => {
                    await auth.registerNotification();
                    onCloseModal();
                  }}
                >
                  <Trans>Confirm</Trans>
                </Button>

                <Anchor fz={14} c="gray" onClick={() => onCloseModal(true)}>
                  <Trans>Skip</Trans>
                </Anchor>
              </Stack>
            ),
          });
        },
      });
    }

    if (layout.view === "mobile" && !layout.isStandalone && !ignored.includes("install-pwa")) {
      output.push({
        id: "install-pwa",
        title: t`Install Web App`,
        message: t`Access faster with standalone app`,
        image: "/images/settings.png",
        onClick: () => OnInstallWebAppTutorial(),
      });
    }
    return output;
  }, [
    app.isInitialized,
    auth.isInitialized,
    auth.device?.notificationToken,
    lang.locale,
    ignored,
    version,
  ]);

  onAppChannelMessage("DashboardSuggestionsRefresh", () => setVersion((v) => v + 1));

  if (suggestions.length <= 0) return null;

  return (
    <SimpleGrid cols={{ base: 1, md: 3 }}>
      {suggestions.map((s) => (
        <SuggestionItem
          key={s.id}
          {...s}
          onRefresh={() => {
            setVersion((prev) => prev + 1);
            postAppChannelMessage("DashboardSuggestionsRefresh");
          }}
          onIgnore={() => {
            setIgnored((prev) => [...prev, s.id]);
          }}
        />
      ))}
    </SimpleGrid>
  );
};
