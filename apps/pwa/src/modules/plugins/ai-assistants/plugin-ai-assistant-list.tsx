"use client";

import { Avatar } from "@/components/avatar";
import { Button } from "@/components/buttons/button";
import { Container } from "@/components/container";
import { OnModalCreatePluginAiAssistant } from "@/modules/plugins/ai-assistants/modal-create-plugin-ai-assistant";
import { useColor } from "@/modules/theme/use-color";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { Trans } from "@lingui/react/macro";
import { ActionIcon, Card, Group, Skeleton, Stack, Text, ThemeIcon, Title } from "@mantine/core";
import { IconAi, IconCirclesRelation, IconLinkPlus, IconPencil } from "@tabler/icons-react";
import { type FC } from "react";
import { usePluginAiAssistants } from "./hooks/use-plugin-ai-assistants";

export const AiAssistantList: FC = () => {
  const workspace = useWorkspace();
  const color = useColor();
  const { aiAssistants, loading } = usePluginAiAssistants();

  if (loading) return <Skeleton w="100%" h={300} />;

  if (aiAssistants.length === 0) {
    return (
      <Container size="sm" p="md">
        <Card shadow="xs">
          <Stack align="center" py={20}>
            <Group gap={30} mb={20}>
              <Avatar workspace={workspace.member.workspace} size={55} />
              <ThemeIcon variant="transparent" size="lg" color="dark">
                <IconCirclesRelation size={50} />
              </ThemeIcon>
              <Avatar src="/images/ai-assistants.png" size={55} />
            </Group>

            <Title mt={-10} ta="center" order={2} fw={300} c={color("primary")}>
              <Trans>Connect</Trans> <Trans>AI assistant</Trans>
            </Title>

            <Text ta="center">
              • <Trans>Automatically reply to customer messages</Trans> <br />•{" "}
              <Trans>Integrate with LLM models</Trans>
            </Text>

            <Button
              mt={10}
              onClick={() => OnModalCreatePluginAiAssistant()}
              leftIcon={IconLinkPlus}
            >
              <Trans>Connect</Trans>
            </Button>
          </Stack>
        </Card>
      </Container>
    );
  }

  return (
    <Container size="xs" p="md">
      <Stack>
        {aiAssistants.map((plugin) => {
          return (
            <Card key={plugin._id} shadow="sm">
              <Group align="start">
                <ThemeIcon size={60} variant="light">
                  <IconAi size={40} strokeWidth={1.2} />
                </ThemeIcon>

                <Stack gap={3} flex={1}>
                  <Text fw={600}>{plugin.providerName}</Text>
                  <Text c="gray" fz={12}>
                    <Trans>Provider</Trans>: <Trans>AI Assistant {plugin.provider}</Trans>
                  </Text>
                </Stack>

                <Stack>
                  <ActionIcon
                    variant="subtle"
                    color="gray"
                    onClick={() => OnModalCreatePluginAiAssistant(plugin)}
                  >
                    <IconPencil size={16} />
                  </ActionIcon>
                </Stack>
              </Group>
            </Card>
          );
        })}
      </Stack>
    </Container>
  );
};
