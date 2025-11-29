"use client";

import { onConfirmModal } from "@/hooks/use-confirm-modal";
import { WithConnectMetaPagesModal } from "@/modals/modal-connect-meta-pages";
import { onFacebookLogin } from "@/modules/auth/auth-service";
import {
  disconnectPluginMetaPage,
  getPluginMetaPagesInfo,
} from "@/modules/plugins/meta-pages/meta-pages-service";
import { usePlugins } from "@/modules/plugins/plugins-context";
import { useColor } from "@/modules/theme/use-color";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import config from "@joy-one-client/config";
import { Trans } from "@lingui/react/macro";
import {
  Anchor,
  Card,
  Center,
  Group,
  SimpleGrid,
  Skeleton,
  Stack,
  Text,
  ThemeIcon,
  Title,
  em,
} from "@mantine/core";
import { IconCirclesRelation, IconLinkPlus, IconPuzzle } from "@tabler/icons-react";
import { FC } from "react";
import { Avatar } from "../../../components/avatar";
import { Button } from "../../../components/buttons/button";
import { Image } from "../../../components/image";

export const PluginMetaPages: FC = () => {
  const workspace = useWorkspace();
  const plugins = usePlugins();

  const color = useColor();

  if (!plugins.isInitialized) return <Skeleton height={150} />;

  if (plugins.metaPages.length === 0)
    return (
      <Stack align="center" py={20}>
        <Group gap={30} mb={20}>
          <Avatar workspace={workspace.userMember.workspace} size={55} />
          <ThemeIcon variant="transparent" size="lg" color="dark">
            <IconCirclesRelation size={50} />
          </ThemeIcon>
          <Image w={55} src="/images/plugins-meta-pages.svg" />
        </Group>

        <Title mt={-10} ta="center" order={2} fw={300} c={color("primary")}>
          <Trans>Connect</Trans> Fanpage Facebook
        </Title>

        <Text ta="center">
          • <Trans>Interact with customers via Messenger</Trans> <br />•{" "}
          <Trans>Easy & quick setup</Trans>
        </Text>

        <WithConnectMetaPagesModal>
          {(open) => {
            const onConnect = async () => {
              const authResponse = await onFacebookLogin();
              const { pages } = await getPluginMetaPagesInfo(authResponse.accessToken);
              open({ pages, accessToken: authResponse.accessToken });
            };

            return (
              <Button mt={10} type="submit" onClick={onConnect} leftIcon={IconLinkPlus}>
                <Trans>Connect</Trans>
              </Button>
            );
          }}
        </WithConnectMetaPagesModal>
      </Stack>
    );

  return (
    <Stack gap={30}>
      <SimpleGrid cols={{ md: 2 }}>
        {plugins.metaPages.map((page) => {
          return (
            <Card key={page._id} shadow="none" withBorder>
              <Group justify="space-between">
                <Group>
                  <Avatar pluginMetaPage={page} />
                  <Stack gap={0}>
                    <Text>{page.name}</Text>
                    <Text fz={12}>#{page.id}</Text>
                    {config.ENV === "development" && <Text fz={12}>#{page._id}</Text>}
                  </Stack>
                </Group>

                <Anchor
                  c="gray"
                  fw={500}
                  fz={em(12)}
                  onClick={() =>
                    onConfirmModal({
                      type: "danger",
                      icon: IconPuzzle,
                      content: <Trans>Are you sure you want to disconnect {page.name}?</Trans>,
                      onConfirm: () => disconnectPluginMetaPage(page._id),
                    })
                  }
                >
                  <Trans>Disconect</Trans>
                </Anchor>
              </Group>
            </Card>
          );
        })}

        <WithConnectMetaPagesModal>
          {(open) => {
            const onConnect = async () => {
              const authResponse = await onFacebookLogin();
              const { pages } = await getPluginMetaPagesInfo(authResponse.accessToken);
              open({ pages, accessToken: authResponse.accessToken });
            };

            return (
              <Center>
                <Button type="submit" onClick={onConnect} leftIcon={IconLinkPlus}>
                  <Trans>Connect more</Trans>
                </Button>
              </Center>
            );
          }}
        </WithConnectMetaPagesModal>
      </SimpleGrid>
    </Stack>
  );
};
