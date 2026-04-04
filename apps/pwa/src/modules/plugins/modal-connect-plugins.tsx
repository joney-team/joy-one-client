"use client";

import { Image } from "@/components/image";
import { ModalHead } from "@/components/modal/modal-head";
import { InputModalType, ModalInput } from "@/modals/modal-input";
import { WithConnectMetaPagesModal } from "@/modules/plugins/meta-pages/modal-connect-meta-pages";
import { usePlugins } from "@/modules/plugins/plugins-context";
import { useApolloClient } from "@apollo/client/react";
import { Trans } from "@lingui/react/macro";
import { Card, Group, Stack, Text } from "@mantine/core";
import { modals } from "@mantine/modals";
import { IconMessage, IconPuzzle } from "@tabler/icons-react";
import { FC } from "react";
import { onFacebookLogin } from "../auth/auth-service";
import { useWorkspace } from "../workspaces/workspace-context";
import GetMetaPagesInfosDocument from "./meta-pages/graphql/getMetaPagesInfos.graphql";
import ConnectZaloOaDocument from "./zalo-oas/graphql/connectZaloOa.graphql";

const ModalConnectPlugins: FC = () => {
  const plugins = usePlugins();
  const client = useApolloClient();
  const workspace = useWorkspace();

  const close = () => {
    modals.close("ModalConnectPlugins");
  };

  return (
    <Stack className="ModalConnectPlugins">
      <WithConnectMetaPagesModal>
        {(open) => {
          const onConnect = async () => {
            const authResponse = await onFacebookLogin();
            const result = await client.query({
              query: GetMetaPagesInfosDocument,
              variables: { accessToken: authResponse.accessToken },
            });
            open({
              pages: result.data?.getMetaPagesInfos ?? [],
              accessToken: authResponse.accessToken,
            });
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
        onClick={async () =>
          client
            .mutate({
              mutation: ConnectZaloOaDocument,
            })
            .then((result) => {
              window.open(result.data?.connectZaloOa?.url, "_blank");
            })
        }
      >
        <Group>
          <Image w={40} src="/images/plugins-zalo-oa.svg" />
          <Text>Zalo OAs</Text>
        </Group>
      </Card>

      <ModalInput>
        {(openInput) => (
          <Card
            withBorder
            shadow="none"
            p={10}
            style={{ cursor: "pointer" }}
            onClick={() => {
              close();
              openInput({
                type: InputModalType.TEXT,
                title: <Trans>Enter name</Trans>,
                icon: IconMessage,
                value: workspace.member.name,
                onDone: async (name) => {
                  await plugins.onCreateMessageHub(name);
                },
              });
            }}
          >
            <Group>
              <Image w={40} src="/images/plugins-message-hubs.svg" />
              <Text>Message Hub</Text>
            </Group>
          </Card>
        )}
      </ModalInput>
    </Stack>
  );
};

export const OnModalConnectPlugins = () =>
  modals.open({
    modalId: "ModalConnectPlugins",
    title: <ModalHead name={<Trans>Connect more platforms</Trans>} icon={IconPuzzle} />,
    children: <ModalConnectPlugins />,
  });
