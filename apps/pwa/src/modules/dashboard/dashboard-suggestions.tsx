"use client";

import { useApp } from "@/app.context";
import { Renderer } from "@/components/renderer";
import { onError } from "@/utils/exceptions.utils";
import { ActionIcon, Card, Group, SimpleGrid, Stack, Text, em, rem } from "@mantine/core";
import { IconBell, IconX } from "@tabler/icons-react";
import { FC, useMemo, useState } from "react";
import { useAuth } from "../auth/auth-context";
import { useColor } from "../theme/use-color";
import { t } from "../lang/lang-service";
import { useLang } from "../lang/lang-context";
import { useLocalStorage } from "@mantine/hooks";
import { onActionLoad } from "@/utils/actions";
import { useLayout } from "@/layout/layout-context";
import { OnInstallWebAppTutorial } from "@/modals/modal-install-web-app-tutorial";
import { onAppChannelMessage, postAppChannelMessage } from "@/app.channel";

interface Suggestion {
  id: string;
  title: string;
  message: React.ReactNode;
  image: string;
  bg?: any;
  notIgnore?: boolean;
  onClick: () => Promise<void> | void;
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
      output.push({
        id: "notification",
        title: "turn_on_notification",
        message: t("turn_on_notification_notice_1"),
        image: "/images/notification.png",
        onClick: () =>
          onActionLoad({
            name: t("turn_on_notification"),
            icon: IconBell,
            process: () => auth.registerNotification(),
          }),
      });
    }

    if (layout.view === "mobile" && !layout.isStandalone && !ignored.includes("install-pwa")) {
      output.push({
        id: "install-pwa",
        title: t("install_web_app"),
        message: t("install_web_app_notice_1"),
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

  // const initialize = async () => {
  //   setSuggestions(s => s.filter(v => !isIgnored(v.id)));

  //   let _suggestions: Suggestion[] = [];

  //   if (viewport.view === 'mobile' && !viewport.isStandalone) {
  //     _suggestions.push({
  //       id: "mobile-standalone",
  //       title: t("install_web_app").toString(),
  //       message: <Stack gap={3}>
  //         <Text fz={em(15)}>• {t('install_web_app_notice_1')}</Text>
  //         <Text fz={em(15)}>• {t("install_web_app_notice_2")}</Text>
  //         <Text fz={em(15)}>• {t('install_web_app_notice_3')}</Text>
  //       </Stack>,
  //       image: "/images/settings.png",
  //       onClick: () => OnInstallWebAppTutorial()
  //     })
  //   }

  //   // Notifications
  //   const device = await initializeDevice();
  //   if (!device.notificationToken && isNotificationAvailable()) {
  //     _suggestions.push({
  //       id: 'notification',
  //       title: t("turn_on_notification"),
  //       message: t("turn_on_notification_notice_1"),
  //       image: "/images/notification.png",
  //       onClick: async () => onActionLoad({
  //         name: t("turn_on_notification"),
  //         icon: IconBell,
  //         throwError: true,
  //         process: async () => auth.registerNotification(),
  //       }),
  //     })
  //   }

  //   // Workslots
  //   if (workspace.activated && workspace.permissions[WorkspacePermission.WORKSPACE_SETTINGS] && (workspace.settings.wSlots || []).length === 0) {
  //     _suggestions.push({
  //       id: 'work-slots',
  //       title: t("setup_work_slots"),
  //       message: t("setup_work_slots_notice_1"),
  //       image: "/images/work-slots.png",
  //       onClick: () => router.push(`/workspace`),
  //     })
  //   }

  //   // Products
  //   const products = await getProducts({ type: ProductType.PRODUCT, limit: 1 });
  //   if (products.count <= 0 && workspace.permissions[WorkspacePermission.PRODUCTS_SERVICES_WRITE]) {
  //     _suggestions.push({
  //       id: 'products',
  //       title: `${t("create")} ${t("products")}`,
  //       message: t("create_products_notice_1"),
  //       image: "/images/settings.png",
  //       onClick: () => router.push(`/products`),
  //     })
  //   }

  //   // Services
  //   const services = await getProducts({ type: ProductType.SERVICE, limit: 1 });
  //   if (services.count <= 0 && workspace.permissions[WorkspacePermission.PRODUCTS_SERVICES_WRITE]) {
  //     _suggestions.push({
  //       id: 'services',
  //       title: `${t("create")} ${t("services")}`,
  //       message: t('create_services_notice_1'),
  //       image: "/images/settings.png",
  //       onClick: () => router.push(`/services`),
  //     })
  //   }

  //   // Bank Account
  //   if (workspace.activated && workspace.permissions[WorkspacePermission.WORKSPACE_SETTINGS] && !workspace.settings.bankAccount) {
  //     _suggestions.push({
  //       id: 'bank',
  //       title: t("setup_workspace_bank_account"),
  //       message: t("setup_workspace_bank_account_notice_1"),
  //       image: "/images/bank.png",
  //       onClick: () => router.push(`/plugins/bank`),
  //     })
  //   }

  //   // Mailer
  //   if (workspace.activated && workspace.permissions[WorkspacePermission.WORKSPACE_SETTINGS] && !workspace.settings.mailer) {
  //     _suggestions.push({
  //       id: 'mailer',
  //       title: t('setup_workspace_mailer'),
  //       message: t('setup_workspace_mailer_notice_1'),
  //       image: "/images/mailer.png",
  //       onClick: () => router.push(`/plugins/mailer`),
  //     })
  //   }

  //   _suggestions = _suggestions.reduce<Suggestion[]>((acc, value) => {
  //     const ignored = localStorage.getItem(getIgnoreKey(value.id))
  //     if (!ignored) acc.push(value);
  //     return acc;
  //   }, []);

  //   setSuggestions(_suggestions);
  //   suggestionCached = _suggestions;
  // }

  // useEffect(() => {
  //   if (auth.isInitialized && workspace.isInitialized) {
  //     initialize()
  //   }
  // }, [
  //   workspace.activated?._id,
  //   workspace.isInitialized,
  //   auth.isInitialized,
  //   auth.user,
  //   auth.device.notificationToken,
  //   workspace.settings,
  // ])

  if (suggestions.length <= 0) return null;

  // return (
  //   <Stack gap={10}>
  //     <SessionTitle name={t('sugesstions')} icon={IconDirections} />
  //     <SimpleGrid cols={viewport.view === 'desktop' ? 3 : 1}>
  //       {workspace.balance.pendingPayment < 0 && <SuggestionItem
  //         id="pending-payment"
  //         bg="red.6"
  //         title={t("pending_payment_suggesstion_title")}
  //         message={t("pending_payment_suggesstion_content")}
  //         image='/images/pending-payment.png'
  //         onClick={() => {
  //           if (workspace.permissions[WorkspacePermission.WORKSPACE_BILLINGS_MANAGER]) {
  //             router.push(`/workspace-billings`);
  //           } else {
  //             onInfo(t("pending_payment_member_message"));
  //           }
  //         }}
  //         notIgnore
  //         onRefresh={initialize}
  //       />}

  //       {suggestions.map((s) => (
  //         <SuggestionItem key={s.id} {...s} onRefresh={initialize} />
  //       ))}
  //     </SimpleGrid>
  //   </Stack>
  // )

  onAppChannelMessage("DashboardSuggestionsRefresh", () => setVersion((v) => v + 1));

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
              {t(title)}
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
