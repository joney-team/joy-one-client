"use client";

import { Button } from "@/components/buttons/button";
import { EntityImage } from "@/components/entity-image";
import { Renderer } from "@/components/renderer";
import { configs } from "@/configs/layout.config";
import { InputModalType, ModalInput } from "@/modals/modal-input";
import { useUploadFile } from "@/modules/files/hooks/use-upload-file";
import { localeNames } from "@/modules/lang/lang-service";
import { AppLocale } from "@/modules/lang/lang-types";
import {
  removePluginMessageHub,
  updatePluginMessageHub,
} from "@/modules/plugins/message-hubs/message-hubs-service";
import {
  ChannelWidgetWelcomeInput,
  PluginMessageHubEntity,
} from "@/modules/plugins/message-hubs/message-hubs-types";
import { useColor } from "@/modules/theme/use-color";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { onArchive } from "@/utils/actions";
import { isDiff } from "@/utils/object.utils";
import { DndContext, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
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

interface MessageHubCardProps {
  messageHub: PluginMessageHubEntity;
}

export const MessageHubCard: FC<MessageHubCardProps> = (props) => {
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
        (input) => !!input.type && !!input.id
      );
    }

    updatePluginMessageHub(messageHub._id, {
      ...props.messageHub,
      widgetSettings: _widgetSettings,
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
      process: () => removePluginMessageHub(messageHub._id),
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
                <Tooltip label={t`Change name`}>
                  <ActionIcon
                    size="sm"
                    color="gray"
                    variant="subtle"
                    onClick={() => {
                      openInput({
                        type: InputModalType.TEXT,
                        title: t`Change name`,
                        icon: IconMessage,
                        value: messageHub.name,
                        onDone: (name) => {
                          if (name.length > 0) {
                            updatePluginMessageHub(messageHub._id, { ...messageHub, name });
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
              <Code p={16} flex={1}>
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

            <InputWrapper label={t`Chat icon`}>
              <EntityImage
                fit="contain"
                src={widgetSettings.chatIcon}
                onChange={(src) => setWidgetSettings({ ...widgetSettings, chatIcon: src as any })}
              />
            </InputWrapper>
          </Group>

          <Stack>
            <TextInput
              label={t`Brand name`}
              value={widgetSettings.brandName}
              onChange={(e) => setWidgetSettings({ ...widgetSettings, brandName: e.target.value })}
            />

            <ColorInput
              label={t`Color`}
              format="hex"
              swatches={configs.swatches}
              value={widgetSettings.color}
              onChange={(color) => setWidgetSettings({ ...widgetSettings, color })}
            />
          </Stack>

          <TextInput
            label={t`Welcome message`}
            value={widgetSettings.welcomMessage}
            placeholder={`${t`Welcome to`} ${workspace.member.workspace.name}`}
            onChange={(e) =>
              setWidgetSettings({ ...widgetSettings, welcomMessage: e.target.value })
            }
          />

          <TextInput
            label={t`Welcome sub message`}
            value={widgetSettings.welcomSubMessage}
            placeholder={t`You need advice! Start chatting with us now.`}
            onChange={(e) =>
              setWidgetSettings({ ...widgetSettings, welcomSubMessage: e.target.value })
            }
          />

          <Select
            label={t`Message hub position`}
            data={[
              { value: "left", label: t`Left` },
              { value: "right", label: t`Right` },
            ]}
            value={widgetSettings.position}
            onChange={(position) =>
              setWidgetSettings({ ...widgetSettings, position: position as any })
            }
          />

          <Select
            label={t`Language`}
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
  onChange: (value: ChannelWidgetWelcomeInput[]) => void;
  inputs: ChannelWidgetWelcomeInput[];
}> = (props) => {
  const addWelcomeInput = () => {
    props.onChange([
      ...props.inputs,
      {
        id: uuid(),
        type: "" as any,
        label: "",
        description: "",
      },
    ]);
  };

  const onChange = (index: number, value: ChannelWidgetWelcomeInput) => {
    props.onChange(
      props.inputs.map((input, i) => {
        if (i === index) return value;
        return input;
      })
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
    })
  );

  return (
    <InputWrapper label={t`Data that customers need to provide before starting a conversation`}>
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
  input: ChannelWidgetWelcomeInput;
  onChange: (value: ChannelWidgetWelcomeInput) => void;
  onRemove: () => void;
}> = ({ input, onChange, onRemove }) => {
  const isDynamicInput = ["text", "number"].includes(input.type);

  const _onChange = (key: keyof ChannelWidgetWelcomeInput, value: any) => {
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

        <Grid gutter={10}>
          <Grid.Col span={{ md: isDynamicInput ? 4 : 6 }}>
            <Select
              label={t`Data type`}
              value={input.type}
              data={[
                { label: t`Name`, value: "name" },
                { label: t`Phone`, value: "phone" },
                { label: t`Email`, value: "email" },
                { label: t`Text`, value: "text" },
                { label: t`Number`, value: "number" },
              ]}
              onChange={(type) => _onChange("type", type)}
            />
          </Grid.Col>

          <Renderer visible={isDynamicInput}>
            <Grid.Col span={{ md: 4 }}>
              <TextInput
                label={t`Input name`}
                value={input.fieldName}
                onChange={(e) => _onChange("fieldName", e.target.value)}
              />
            </Grid.Col>
          </Renderer>

          <Grid.Col span={{ md: isDynamicInput ? 4 : 6 }}>
            <TextInput
              label={t`Input label`}
              value={input.label}
              onChange={(e) => _onChange("label", e.target.value)}
            />
          </Grid.Col>

          <Grid.Col span={{ md: 12 }}>
            <TextInput
              label={t`Input description`}
              value={input.description}
              onChange={(e) => _onChange("description", e.target.value)}
            />
          </Grid.Col>
        </Grid>
      </Stack>
    </Card>
  );
};
