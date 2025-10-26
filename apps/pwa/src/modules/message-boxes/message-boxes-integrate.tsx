"use client";

import { Avatar } from "@/components/avatar";
import { Button } from "@/components/buttons/button";
import { Image } from "@/components/image";
import { PluginMetaPages } from "@/modules/plugins/meta-pages/plugin-meta-pages";
import { usePlugins } from "@/modules/plugins/plugins-context";
import { PluginZaloOAs } from "@/modules/plugins/zalo-oas/zalo-oas";
import { useColor } from "@/modules/theme/use-color";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { Trans } from "@lingui/react/macro";
import { Card, em, Grid, Group, Stack, Text, ThemeIcon, Title } from "@mantine/core";
import { IconCirclesRelation, IconPlus } from "@tabler/icons-react";
import { FC } from "react";

export const MessageBoxesIntegrate: FC = () => {
  const color = useColor();
  const workspace = useWorkspace();
  const plugins = usePlugins();

  return (
    <Stack p={20} py={30}>
      <Stack gap={8}>
        <Title ta="center" c={color("primary")} fz={em(25)}>
          <Trans>Connect with Social channels</Trans>
        </Title>
        <Text ta="center" fz={em(15)}>
          <Trans>
            Integrate channels like Zalo, Facebook, Websites, ... to centralize all customer
            messages in one place.
          </Trans>
        </Text>
      </Stack>

      <Grid justify="center" align="stretch">
        <Grid.Col span={{ md: 4 }}>
          <Card withBorder shadow="none">
            <PluginMetaPages />
          </Card>
        </Grid.Col>

        <Grid.Col span={{ md: 4 }}>
          <Card withBorder shadow="none">
            <PluginZaloOAs />
          </Card>
        </Grid.Col>

        <Grid.Col span={{ md: 4 }}>
          <Card withBorder shadow="none">
            <Stack align="center" py={20}>
              <Group gap={30} mb={20}>
                <Avatar workspace={workspace.userMember.workspace} size={55} />
                <ThemeIcon variant="transparent" size="lg" color="dark">
                  <IconCirclesRelation size={50} />
                </ThemeIcon>
                <Image w={55} src="/images/plugins-message-hubs.svg" />
              </Group>

              <Title mt={-10} ta="center" order={2} fw={300} c={color("primary")}>
                <Trans>Message Hubs</Trans>
              </Title>

              <Text ta="center">
                <Trans>
                  Integrate ChatBox into your website <br /> Easy & quick setup
                </Trans>
              </Text>

              <Button
                mt={10}
                type="submit"
                leftIcon={IconPlus}
                onClick={plugins.onCreateMessageHub}
              >
                <Trans>Create new</Trans>
              </Button>
            </Stack>
          </Card>
        </Grid.Col>
      </Grid>
    </Stack>
  );
};
