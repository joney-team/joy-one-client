import { useColor } from "@/modules/theme/use-color";
import { t } from "@/modules/lang/lang-service";
import { usePlugins } from "@/modules/plugins/plugins-context";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { Card, em, Grid, Group, Stack, Text, ThemeIcon, Title } from "@mantine/core";
import { IconCirclesRelation, IconPlus } from "@tabler/icons-react";
import { FC } from "react";
import { Avatar } from "@/components/avatar";
import { Button } from "@/components/buttons/button";
import { Image } from "@/components/image";
import { PluginMetaPages } from "@/components/plugins/plugin-meta-pages";
import { PluginZaloOAs } from "@/components/plugins/plugin-zalo-oas";

export const MessageBoxesIntegrate: FC = () => {
  const color = useColor();
  const workspace = useWorkspace();
  const plugins = usePlugins();

  return (
    <Stack p={20} py={30}>
      <Stack gap={8}>
        <Title ta="center" c={color("primary")} fz={em(25)}>
          {t("msg_boxes_intro_title")}
        </Title>
        <Text ta="center" fz={em(15)}>
          {t("msg_boxes_intro_desc")}
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
                {t("message-hubs")}
              </Title>

              <Text ta="center">{t("message-hubs-description")}</Text>

              <Button mt={10} type="submit" leftIcon={IconPlus} onClick={plugins.onCreateMessageHub}>
                {t("create_new")}
              </Button>
            </Stack>
          </Card>
        </Grid.Col>
      </Grid>
    </Stack>
  );
};
