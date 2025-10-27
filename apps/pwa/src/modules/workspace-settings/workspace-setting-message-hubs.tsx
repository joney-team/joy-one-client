import { Avatar } from "@/components/avatar";
import { Button } from "@/components/buttons/button";
import { ButtonPlus } from "@/components/buttons/button-plus";
import { Container } from "@/components/container";
import { Image } from "@/components/image";
import { LazyLoad } from "@/components/lazy-load";
import { SectionTitle } from "@/components/session-title";
import { MessageHubCard } from "@/modules/plugins/message-hubs/message-hub-card";
import { usePlugins } from "@/modules/plugins/plugins-context";
import { useColor } from "@/modules/theme/use-color";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { Trans } from "@lingui/react/macro";
import { Card, Group, Stack, Text, ThemeIcon, Title } from "@mantine/core";
import { IconCirclesRelation, IconMessage, IconPlus } from "@tabler/icons-react";
import { type FC } from "react";

export function getColorScheme(key: string) {
  return document.documentElement.getAttribute(key);
}

export const WorkspaceSettingMessageHubs: FC = () => {
  const workspace = useWorkspace();
  const plugins = usePlugins();
  const color = useColor();

  if (!plugins.isInitialized) return <LazyLoad />;

  if (plugins.messageHubs.length === 0) {
    return (
      <Container p={16}>
        <Card shadow="xs">
          <Stack align="center" py={20}>
            <Group gap={30} mb={20}>
              <Avatar workspace={workspace.userMember.workspace} size={55} />
              <ThemeIcon variant="transparent" size="lg" color="dark">
                <IconCirclesRelation size={50} />
              </ThemeIcon>
              <Image w={55} src="/images/plugins-message-hubs.svg" />
            </Group>

            <Title mt={-10} ta="center" order={2} fw={300} c={color("primary")}>
              Message Hub
            </Title>

            <Text ta="center">
              • <Trans>Tích hợp ChatBox vào website của bạn</Trans> <br />•{" "}
              <Trans>Setup nhanh gọn và dễ dàng</Trans>
            </Text>

            <Button mt={10} type="submit" leftIcon={IconPlus} onClick={plugins.onCreateMessageHub}>
              <Trans>Create new</Trans>
            </Button>
          </Stack>
        </Card>
      </Container>
    );
  }

  return (
    <Container p={16}>
      <Stack>
        <SectionTitle icon={IconMessage} name="Message Hubs" iconColor="primary">
          <ButtonPlus onClick={plugins.onCreateMessageHub} size="sm" iconSize={16} />
        </SectionTitle>

        {plugins.messageHubs.map((messageHub) => {
          return <MessageHubCard key={messageHub._id} messageHub={messageHub} />;
        })}
      </Stack>
    </Container>
  );
};
