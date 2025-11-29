"use client";

import { Image } from "@/components/image";
import { ModalTitle } from "@/components/modal-title";
import { WithConnectMetaPagesModal } from "@/modals/modal-connect-meta-pages";
import { usePlugins } from "@/modules/plugins/plugins-context";
import { connectPluginZalo } from "@/modules/plugins/zalo-oas/zalo-oas-service";
import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { Card, Group, Stack, Text } from "@mantine/core";
import { modals } from "@mantine/modals";
import { IconPuzzle } from "@tabler/icons-react";
import { FC } from "react";
import { onFacebookLogin } from "../auth/auth-service";
import { getPluginMetaPagesInfo } from "./meta-pages/meta-pages-service";

const ModalConnectPlugins: FC = () => {
  const plugins = usePlugins();

  const close = () => {
    modals.close("ModalConnectPlugins");
  };

  return (
    <Stack className="ModalConnectPlugins">
      <WithConnectMetaPagesModal>
        {(open) => {
          const onConnect = async () => {
            const authResponse = await onFacebookLogin();
            const { pages } = await getPluginMetaPagesInfo(authResponse.accessToken);
            open({ pages, accessToken: authResponse.accessToken });
            close();
          };

          return (
            <Card withBorder shadow="none" p={10} style={{ cursor: "pointer" }} onClick={onConnect}>
              <Group>
                <Image w={40} src="/images/plugins-meta-pages.svg" />
                <Text>
                  <Trans>Meta pages</Trans>
                </Text>
              </Group>
            </Card>
          );
        }}
      </WithConnectMetaPagesModal>

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
          <Text>Zalo OAs</Text>
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
          <Text>Message Hub</Text>
        </Group>
      </Card>
    </Stack>
  );
};

export const OnModalConnectPlugins = () =>
  modals.open({
    modalId: "ModalConnectPlugins",
    title: <ModalTitle title={t`Connect more platforms`} icon={IconPuzzle} />,
    children: <ModalConnectPlugins />,
  });
