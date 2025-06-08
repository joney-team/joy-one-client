import { Image } from "@/components/image";
import { ModalTitle } from "@/components/modal-title";
import { t } from "@/modules/lang/lang-service";
import { usePlugins } from "@/modules/plugins/plugins-context";
import { connectPluginZalo } from "@/modules/plugins/zalo-oas/zalo-oas-service";
import { Card, Group, Stack, Text } from "@mantine/core";
import { modals } from "@mantine/modals";
import { IconPuzzle } from "@tabler/icons-react";
import { FC } from "react";

const ModalConnectPlugins: FC = () => {
  const plugins = usePlugins();

  const close = () => {
    modals.close("ModalConnectPlugins");
  };

  return (
    <Stack className="ModalConnectPlugins">
      <Card
        withBorder
        shadow="none"
        p={10}
        style={{ cursor: "pointer" }}
        onClick={() => {
          close();
          plugins.onConnectMetaPages();
        }}
      >
        <Group>
          <Image w={40} src="/images/plugins-meta-pages.svg" />
          <Text>{t("meta_pages")}</Text>
        </Group>
      </Card>

      <Card
        withBorder
        shadow="none"
        p={10}
        style={{ cursor: "pointer" }}
        onClick={() => {
          connectPluginZalo();
        }}
      >
        <Group>
          <Image w={40} src="/images/plugins-zalo-oa.svg" />
          <Text>{t("zalo_oas")}</Text>
        </Group>
      </Card>

      <Card
        withBorder
        shadow="none"
        p={10}
        style={{ cursor: "pointer" }}
        onClick={() => {
          close();
          plugins.onCreateMessageHub();
        }}
      >
        <Group>
          <Image w={40} src="/images/plugins-message-hubs.svg" />
          <Text>{t("message-hubs")}</Text>
        </Group>
      </Card>
    </Stack>
  );
};

export const OnModalConnectPlugins = () =>
  modals.open({
    modalId: "ModalConnectPlugins",
    title: <ModalTitle title={t("connect_more_platforms")} icon={IconPuzzle} />,
    children: <ModalConnectPlugins />,
  });
