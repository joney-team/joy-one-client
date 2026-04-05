"use client";

import { Button } from "@/components/buttons/button";
import { EntityImage } from "@/components/entity-image";
import { Renderer } from "@/components/renderer";
import { configs } from "@/configs/layout.config";
import {
  AppLocale,
  ChannelWidgetWelcomeInputType,
  MessageHubWidgetPosition,
} from "@/graphql/enums.graphql";
import { InputModalType, ModalInput } from "@/modals/modal-input";
import { useUploadFile } from "@/modules/files/hooks/use-upload-file";
import { localeNames } from "@/modules/lang/lang-service";
import { normalizeMessageHubInput } from "@/modules/plugins/message-hubs/message-hubs-service";
import { useColor } from "@/modules/theme/use-color";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { onArchive } from "@/utils/actions";
import { isDiff } from "@/utils/object.utils";
import { useApolloClient } from "@apollo/client/react";
import { DndContext, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Trans, useLingui } from "@lingui/react/macro";
import {
  ActionIcon,
  Card,
  Center,
  Code,
  ColorInput,
  CopyButton,
  em,
  Grid,
  Group,
  InputWrapper,
  Select,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  ThemeIcon,
  Tooltip,
} from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import {
  IconBrush,
  IconCopy,
  IconCopyCheck,
  IconDotsVertical,
  IconEdit,
  IconExternalLink,
  IconMessage,
  IconPlus,
  IconPuzzle,
  IconSitemap,
  IconTrash,
  IconX,
} from "@tabler/icons-react";
import { FC, useEffect, useState } from "react";
import { v4 as uuid } from "uuid";
import DeletePluginMessageHubDocument from "./graphql/deletePluginMessageHub.graphql";
import { PluginMessageHubFragment } from "./graphql/fragmentPluginMessageHub.graphql";
import UpdatePluginMessageHubDocument from "./graphql/updatePluginMessageHub.graphql";
import { MessageHubWidgetWelcome } from "@/graphql/types.graphql";

interface MessageHubCardProps {
  messageHub: PluginMessageHubFragment;
}

export const MessageHubCard: FC<MessageHubCardProps> = (props) => {
  const { t } = useLingui();
  const client = useApolloClient();
  const workspace = useWorkspace();
  const uploadFile = useUploadFile();

  const { messageHub } = props;
  const color = useColor();
  const [widgetSettings, setWidgetSettings] = useState(messageHub.widgetSettings);

  const [debouced] = useDebouncedValue(widgetSettings, 500);

  const submit = async () => {
    let _widgetSettings = { ...debouced };

    if ((_widgetSettings.brandLogo as any) instanceof File) {
      const brandLogo = await uploadFile(_widgetSettings.brandLogo as any, {
        maxWidthOrHeight: 200,
      });
      _widgetSettings.brandLogo = brandLogo.url;
    }

    if ((_widgetSettings.chatIcon as any) instanceof File) {
      const chatIcon = await uploadFile(_widgetSettings.chatIcon as any, { maxWidthOrHeight: 200 });
      _widgetSettings.chatIcon = chatIcon.url;
    }

    if (_widgetSettings.welcomeInputs) {
      _widgetSettings.welcomeInputs = _widgetSettings.welcomeInputs.filter(
        (input) => !!input.type && !!input.id,
      );
    }

    client.mutate({
      mutation: UpdatePluginMessageHubDocument,
      variables: {
        messageHubId: messageHub._id,
        input: {
          name: messageHub.name,
          widgetSettings: {
            brandLogo: _widgetSettings.brandLogo,
            chatIcon: _widgetSettings.chatIcon,
            brandName: _widgetSettings.brandName,
            color: _widgetSettings.color,
            welcomMessage: _widgetSettings.welcomMessage,
            welcomSubMessage: _widgetSettings.welcomSubMessage,
            position: _widgetSettings.position,
            locale: _widgetSettings.locale,
            welcomeInputs: _widgetSettings.welcomeInputs?.map((input) => ({
              id: input.id,
              type: input.type,
              label: input.label,
              fieldName: input.fieldName,
              description: input.description,
              placeholder: input.placeholder,
              isRequired: input.isRequired,
            })),
          },
        },
      },
    });
  };

  useEffect(() => {
    if (isDiff(debouced, messageHub.widgetSettings)) {
      submit();
    }
  }, [debouced]);

  const onRemove = () => {
    onArchive({
      name: "Message Hub",
      process: () =>
        client.mutate({
          mutation: DeletePluginMessageHubDocument,
          variables: {
            messageHubId: messageHub._id,
          },
        }),
    });
  };

  return (
    <Card shadow="xs">
      <Stack gap={25}>
        <Group justify="space-between">
          <Group gap={5}>
            <ThemeIcon variant="transparent" color="dark">
              <IconPuzzle />
            </ThemeIcon>
            <Text fw={600}>{messageHub.name}</Text>

            <ModalInput>
              {(openInput) => (
                <Tooltip label={<Trans>Change name</Trans>}>
                  <ActionIcon
                    size="sm"
                    color="gray"
                    variant="subtle"
                    onClick={() => {
                      openInput({
                        type: InputModalType.TEXT,
                        title: <Trans>Change name</Trans>,
                        icon: IconMessage,
                        value: messageHub.name,
                        onDone: (name) => {
                          if (name.length > 0) {
                            client.mutate({
                              mutation: UpdatePluginMessageHubDocument,
                              variables: {
                                messageHubId: messageHub._id,
                                input: {
                                  ...normalizeMessageHubInput(messageHub),
                                  name,
                                },
                              },
                            });
                          }
                        },
                      });
                    }}
                  >
                    <IconEdit strokeWidth={1.5} />
                  </ActionIcon>
                </Tooltip>
              )}
            </ModalInput>
          </Group>

          <Button
            rightIcon={IconExternalLink}
            size="xs"
            variant="subtle"
            onClick={() => {
              window.open(messageHub.direct.src, "_blank");
            }}
          >
            <Trans>Open chat box</Trans>
          </Button>
        </Group>

        <Group gap={8} mb={-18}>
          <ThemeIcon size="sm" variant="transparent" color="dark">
            <IconSitemap />
          </ThemeIcon>
          <Text fz={em(15)}>
            <Trans>Copy the script and paste it into your website.</Trans>
          </Text>
        </Group>

        <CopyButton value={messageHub.script.html}>
          {({ copied, copy }) => (
            <Group gap={10} w="100%" onClick={copy} align="start">
              <Code p="md" flex={1}>
                {messageHub.script.html}
              </Code>

              <ActionIcon
                radius={5}
                variant={copied ? "filled" : "light"}
                color={color(copied ? "primary" : "dark")}
                size="lg"
              >
                {copied ? <IconCopyCheck size={18} /> : <IconCopy size={18} />}
              </ActionIcon>
            </Group>
          )}
        </CopyButton>

        <Group gap={8} mb={-20}>
          <ThemeIcon size="sm" variant="transparent" color="dark">
            <IconBrush />
          </ThemeIcon>
          <Text fz={em(15)}>
            <Trans>Customize UI</Trans>
          </Text>
        </Group>

        <SimpleGrid cols={{ md: 2 }}>
          <Group>
            <InputWrapper label="Logo">
              <EntityImage
                fit="contain"
                src={widgetSettings.brandLogo}
                onChange={(src) => setWidgetSettings({ ...widgetSettings, brandLogo: src as any })}
              />
            </InputWrapper>

            <InputWrapper label={<Trans>Chat icon</Trans>}>
              <EntityImage
                fit="contain"
                src={widgetSettings.chatIcon}
                onChange={(src) => setWidgetSettings({ ...widgetSettings, chatIcon: src as any })}
              />
            </InputWrapper>
          </Group>

          <Stack>
            <TextInput
              label={<Trans>Brand name</Trans>}
              value={widgetSettings.brandName ?? undefined}
              onChange={(e) => setWidgetSettings({ ...widgetSettings, brandName: e.target.value })}
            />

            <ColorInput
              label={<Trans>Color</Trans>}
              format="hex"
              swatches={configs.swatches}
              value={widgetSettings.color ?? undefined}
              onChange={(color) => setWidgetSettings({ ...widgetSettings, color })}
            />
          </Stack>

          <TextInput
            label={<Trans>Welcome message</Trans>}
            value={widgetSettings.welcomMessage ?? undefined}
            placeholder={`${t`Welcome to`} ${workspace.member.workspace.name}`}
            onChange={(e) =>
              setWidgetSettings({ ...widgetSettings, welcomMessage: e.target.value })
            }
          />

          <TextInput
            label={<Trans>Welcome sub message</Trans>}
            value={widgetSettings.welcomSubMessage ?? undefined}
            placeholder={t`You need advice! Start chatting with us now.`}
            onChange={(e) =>
              setWidgetSettings({ ...widgetSettings, welcomSubMessage: e.target.value })
            }
          />

          <Select
            label={<Trans>Message hub position</Trans>}
            data={[
              { value: MessageHubWidgetPosition.Left, label: t`Left` },
              { value: MessageHubWidgetPosition.Right, label: t`Right` },
            ]}
            value={widgetSettings.position}
            onChange={(position) =>
              setWidgetSettings({ ...widgetSettings, position: position as any })
            }
          />

          <Select
            label={<Trans>Language</Trans>}
            data={Object.values(AppLocale).map((v) => ({
              label: localeNames[v],
              value: v,
            }))}
            value={widgetSettings.locale}
            onChange={(locale) => setWidgetSettings({ ...widgetSettings, locale: locale as any })}
          />
        </SimpleGrid>

        <WelcomInputs
          inputs={widgetSettings.welcomeInputs || []}
          onChange={(inputs) => setWidgetSettings({ ...widgetSettings, welcomeInputs: inputs })}
        />

        <Center>
          <Button
            variant="subtle"
            size="xs"
            color="red"
            leftIcon={IconTrash}
            onClick={onRemove}
            fw={400}
          >
            <Trans>Remove</Trans>
          </Button>
        </Center>
      </Stack>
    </Card>
  );
};

const WelcomInputs: FC<{
  onChange: (value: MessageHubWidgetWelcome[]) => void;
  inputs: MessageHubWidgetWelcome[];
}> = (props) => {
  const addWelcomeInput = () => {
    props.onChange([
      ...props.inputs,
      {
        __typename: "MessageHubWidgetWelcome",
        isRequired: false,
        fieldName: "",
        placeholder: "",
        id: uuid(),
        type: "" as any,
        label: "",
        description: "",
      },
    ]);
  };

  const onChange = (index: number, value: MessageHubWidgetWelcome) => {
    props.onChange(
      props.inputs.map((input, i) => {
        if (i === index) return value;
        return input;
      }),
    );
  };

  const onRemove = (index: number) => {
    props.onChange(props.inputs.filter((_, i) => i !== index));
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 10,
      },
    }),
  );

  return (
    <InputWrapper
      label={<Trans>Data that customers need to provide before starting a conversation</Trans>}
    >
      <DndContext
        sensors={sensors}
        onDragEnd={(e) => {
          const { active, over } = e;
          if (!over || active.id === over?.id) return;
          let items = [...props.inputs];
          const oldIndex = items.findIndex((v) => v.id === active.id.toString());
          const newIndex = items.findIndex((v) => v.id === over?.id.toString());
          items = arrayMove(items, oldIndex, newIndex);
          props.onChange(items);
        }}
      >
        <Stack mt={3} gap={10}>
          <SortableContext
            items={props.inputs.map((v) => v.id)}
            strategy={verticalListSortingStrategy}
          >
            {props.inputs.map((input, index) => {
              return (
                <WelcomInput
                  key={input.id}
                  input={input}
                  onChange={(value) => onChange(index, value)}
                  onRemove={() => onRemove(index)}
                />
              );
            })}
          </SortableContext>

          <Group>
            <Button
              size="compact-xs"
              variant="subtle"
              leftIcon={IconPlus}
              onClick={addWelcomeInput}
            >
              <Trans>Add input</Trans>
            </Button>
          </Group>
        </Stack>
      </DndContext>
    </InputWrapper>
  );
};

const WelcomInput: FC<{
  input: MessageHubWidgetWelcome;
  onChange: (value: MessageHubWidgetWelcome) => void;
  onRemove: () => void;
}> = ({ input, onChange, onRemove }) => {
  const { t } = useLingui();
  const isDynamicInput = ["text", "number"].includes(input.type);

  const _onChange = (key: keyof MessageHubWidgetWelcome, value: any) => {
    const _input = { ...input, [key]: value };
    onChange(_input);
  };

  const sortable = useSortable({ id: input.id, data: input });

  const style = {
    transform: CSS.Transform.toString(sortable.transform),
    transition: sortable.transition,
  };

  return (
    <Card
      ref={sortable.setNodeRef}
      {...sortable.attributes}
      style={{
        ...style,
      }}
      withBorder
      shadow="none"
      p={10}
    >
      <Stack gap={0}>
        <Group justify="space-between">
          <Group gap={3}>
            <Group {...sortable.listeners} style={{ cursor: "grab" }} ml={-5}>
              <ThemeIcon size="sm" variant="transparent" color="dark">
                <IconDotsVertical size={18} strokeWidth={1.5} />
              </ThemeIcon>
            </Group>
            <Text fz={em(12)} fw={600}>
              <Trans>Input</Trans>
            </Text>
          </Group>

          <ActionIcon color="gray.5" size="xs" variant="subtle" onClick={onRemove}>
            <IconX size={16} />
          </ActionIcon>
        </Group>

        <Grid gap={10}>
          <Grid.Col span={{ md: isDynamicInput ? 4 : 6 }}>
            <Select
              label={<Trans>Data type</Trans>}
              value={input.type}
              data={[
                { label: t`Name`, value: ChannelWidgetWelcomeInputType.Name },
                { label: t`Phone`, value: ChannelWidgetWelcomeInputType.Phone },
                { label: t`Email`, value: ChannelWidgetWelcomeInputType.Email },
                { label: t`Text`, value: ChannelWidgetWelcomeInputType.Text },
                { label: t`Number`, value: ChannelWidgetWelcomeInputType.Number },
              ]}
              onChange={(type) => _onChange("type", type)}
            />
          </Grid.Col>

          <Renderer visible={isDynamicInput}>
            <Grid.Col span={{ md: 4 }}>
              <TextInput
                label={<Trans>Input name</Trans>}
                value={input.fieldName}
                onChange={(e) => _onChange("fieldName", e.target.value)}
              />
            </Grid.Col>
          </Renderer>

          <Grid.Col span={{ md: isDynamicInput ? 4 : 6 }}>
            <TextInput
              label={<Trans>Input label</Trans>}
              value={input.label}
              onChange={(e) => _onChange("label", e.target.value)}
            />
          </Grid.Col>

          <Grid.Col span={{ md: 12 }}>
            <TextInput
              label={<Trans>Input description</Trans>}
              value={input.description ?? undefined}
              onChange={(e) => _onChange("description", e.target.value)}
            />
          </Grid.Col>
        </Grid>
      </Stack>
    </Card>
  );
};
