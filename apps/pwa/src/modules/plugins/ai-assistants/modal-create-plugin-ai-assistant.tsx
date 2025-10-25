import { useColor } from "@/modules/theme/use-color";
import { Button } from "@/components/buttons/button";
import { ButtonArchive } from "@/components/buttons/button-archive";
import { Image } from "@/components/image";
import { ModalTitle } from "@/components/modal-title";
import { tl } from "@/modules/lang/lang-service";
import {
  createPluginAiAssistant,
  removePluginAiAssistant,
  updatePluginAiAssistant,
} from "@/modules/plugins/ai-assistants/plugin-ai-assistants-service";
import {
  PluginAiAssistantEntity,
  PluginAiAssistantProvider,
} from "@/modules/plugins/ai-assistants/plugin-ai-assistants-types";
import { onError } from "@/utils/exceptions.utils";
import {
  Card,
  Group,
  InputWrapper,
  PasswordInput,
  Radio,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { modals } from "@mantine/modals";
import {
  IconAi,
  IconCheck,
  IconExternalLink,
  IconKey,
  IconLinkPlus,
  IconNotebook,
} from "@tabler/icons-react";
import { FC, useState } from "react";

export const pluginAiAssistantProviders: {
  [key in PluginAiAssistantProvider]: {
    name: string;
    image: string;
    description: string;
    appLink: string;
    docsLink: string;
  };
} = {
  [PluginAiAssistantProvider.DIFY]: {
    name: "Dify",
    image: "https://assets.dify.ai/images/dify_logo_dark.png",
    description: "The Innovation Engine for GenAI Applications",
    appLink: "https://cloud.dify.ai",
    docsLink: "https://docs.dify.ai",
  },
  [PluginAiAssistantProvider.VONIC_DIFY]: {
    name: "AI Agent Vonic",
    image: "https://api.joyone.vn/files/66b05b93a3d870cc96a53e9c.png",
    description: "Dify Self-Hosted AI Agent",
    appLink: "http://dify.app.webree.io.vn",
    docsLink: "https://docs.dify.ai",
  },
};

export const ModalCreatePluginAiAssistant: FC<{
  plugin?: PluginAiAssistantEntity;
}> = ({ plugin }) => {
  const [loading, setLoading] = useState(false);
  const color = useColor();

  const form = useForm<any>({
    initialValues: {
      apiKey: "",
      provider: plugin?.provider || PluginAiAssistantProvider.DIFY,
      enabled: typeof plugin?.enabled === "boolean" ? plugin.enabled : true,
    },
    validate: {
      provider: (value) => (value.length > 0 ? null : tl("required")),
      apiKey: (value, values) => {
        if (values.provider !== plugin?.provider) {
          return value.length > 0 ? null : tl("required");
        }

        return null;
      },
    },
  });

  const onClose = () => {
    modals.close("PluginAiAssistantModal");
  };

  const onSubmit = form.onSubmit(async (values) => {
    try {
      setLoading(true);
      if (plugin) {
        await updatePluginAiAssistant(plugin._id, values);
        onClose();
      } else {
        await createPluginAiAssistant(values);
        onClose();
      }
    } catch (error) {
      onError(error);
    } finally {
      setLoading(false);
    }
  });

  return (
    <Stack>
      <InputWrapper label={tl("provider")}>
        <SimpleGrid cols={2} mt={8}>
          {Object.keys(pluginAiAssistantProviders).map((providerKey) => {
            const provider = pluginAiAssistantProviders[providerKey as PluginAiAssistantProvider];
            const isSelected = form.values.provider === providerKey;
            return (
              <Card
                key={providerKey}
                className="unselectable"
                withBorder
                style={{
                  borderColor: isSelected ? color("violet.9") : undefined,
                  position: "relative",
                  cursor: "pointer",
                }}
                onClick={() => form.setFieldValue("provider", providerKey)}
              >
                <Group
                  style={{
                    position: "absolute",
                    top: 0,
                    right: 0,
                  }}
                  p={5}
                >
                  <Radio
                    checked={isSelected}
                    onChange={() => form.setFieldValue("provider", providerKey)}
                    color="violet.9"
                  />
                </Group>

                <Card.Section>
                  <Image src={provider.image} w="100%" h={80} fit="contain" />
                </Card.Section>

                <Stack gap={0} h={100} justify="space-between">
                  <Stack gap={0}>
                    <Text fz={16} fw={500}>
                      {provider.name}
                    </Text>
                    <Text fz={12} c="gray">
                      {provider.description}
                    </Text>
                  </Stack>

                  <Group flex={1} align="end">
                    <Button
                      variant="subtle"
                      size="compact-sm"
                      color="gray"
                      leftIcon={IconExternalLink}
                      fz={12}
                      onClick={() => window.open(provider.appLink, "_blank")}
                    >
                      {tl("open_app")}
                    </Button>

                    <Button
                      variant="subtle"
                      size="compact-sm"
                      color="gray"
                      leftIcon={IconNotebook}
                      fz={12}
                      onClick={() => window.open(provider.docsLink, "_blank")}
                    >
                      {tl("docs")}
                    </Button>
                  </Group>
                </Stack>
              </Card>
            );
          })}
        </SimpleGrid>
      </InputWrapper>

      {plugin && plugin.provider === form.values.provider ? (
        <TextInput
          label={tl("apiKey")}
          leftSection={<IconKey size={16} strokeWidth={1.5} />}
          value="••••••••••••••••••••••"
          readOnly
        />
      ) : (
        <PasswordInput
          label={tl("apiKey")}
          leftSection={<IconKey size={16} strokeWidth={1.5} />}
          placeholder={tl("provide_api_key")}
          {...form.getInputProps("apiKey")}
        />
      )}

      <Stack align="center" justify="center" mt={16}>
        <Button
          action
          leftIcon={plugin ? IconCheck : IconLinkPlus}
          onClick={onSubmit}
          loading={loading}
          color="violet.9"
        >
          {tl(plugin ? "save" : "connect")}
        </Button>

        {plugin && (
          <ButtonArchive
            label="disconect"
            name="ai_assistant"
            goBackWhenArchived={false}
            process={async () => {
              await removePluginAiAssistant(plugin._id);
              onClose();
            }}
          />
        )}
      </Stack>
    </Stack>
  );
};

export const OnModalCreatePluginAiAssistant = (plugin?: PluginAiAssistantEntity) => {
  return modals.open({
    modalId: "PluginAiAssistantModal",
    title: <ModalTitle title="ai_assistant" icon={IconAi} color="violet.9" />,
    children: <ModalCreatePluginAiAssistant plugin={plugin} />,
    size: "600px",
  });
};
