import { configs } from "@/configs/layout.config";
import { useColor } from "@/modules/theme/use-color";
import { Button } from "@/components/buttons/button";
import { EntityImage } from "@/components/entity-image";
import { Renderer } from "@/components/renderer";
import { onArchive } from "@/utils/actions";
import { useLayout } from "@/layout/layout-context";
import { InputModalType, OnModalInput } from "@/modals/modal-input";
import { uploadFile } from "@/modules/files/file-service";
import { localeNames, tl } from "@/modules/lang/lang-service";
import { Locale } from "@/modules/lang/lang-types";
import {
  removePluginMessageHub,
  updatePluginMessageHub,
} from "@/modules/plugins/message-hubs/message-hubs-service";
import {
  ChannelWidgetWelcomeInput,
  PluginMessageHubEntity,
} from "@/modules/plugins/message-hubs/message-hubs-types";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { isDiff } from "@/utils/object.utils";
import { DndContext, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
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
  const layout = useLayout();

  const { messageHub } = props;
  const color = useColor();
  const [widgetSettings, setWidgetSettings] = useState(messageHub.widgetSettings);

  const [debouced] = useDebouncedValue(widgetSettings, 500);

  const submit = async () => {
    let _widgetSettings = { ...debouced };

    if ((_widgetSettings.brandLogo as any) instanceof File) {
      const brandLogo = await uploadFile({
        file: _widgetSettings.brandLogo as any,
        maxWidthOrHeight: 200,
      });
      _widgetSettings.brandLogo = brandLogo.url;
    }

    if ((_widgetSettings.chatIcon as any) instanceof File) {
      const chatIcon = await uploadFile({
        file: _widgetSettings.chatIcon as any,
        maxWidthOrHeight: 200,
      });
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

  const onChangeName = () => {
    OnModalInput({
      type: InputModalType.TEXT,
      title: tl("change_name"),
      icon: IconMessage,
      value: messageHub.name,
      onDone: (name) => {
        if (name.length > 0) {
          updatePluginMessageHub(messageHub._id, { ...messageHub, name });
        }
      },
    });
  };

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

            <Tooltip label={tl("change_name")}>
              <ActionIcon size="sm" color="gray" variant="subtle" onClick={onChangeName}>
                <IconEdit strokeWidth={1.5} />
              </ActionIcon>
            </Tooltip>
          </Group>

          <Button
            rightIcon={IconExternalLink}
            size="xs"
            variant="subtle"
            onClick={() => {
              window.open(messageHub.direct.src, "_blank");
            }}
          >
            {tl("open_chat_box")}
          </Button>
        </Group>

        <Group gap={8} mb={-18}>
          <ThemeIcon size="sm" variant="transparent" color="dark">
            <IconSitemap />
          </ThemeIcon>
          <Text fz={em(15)}>{tl("message_hub_script_desc")}</Text>
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
          <Text fz={em(15)}>{tl("customize-ui")}</Text>
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

            <InputWrapper label={tl("chat_icon")}>
              <EntityImage
                fit="contain"
                src={widgetSettings.chatIcon}
                onChange={(src) => setWidgetSettings({ ...widgetSettings, chatIcon: src as any })}
              />
            </InputWrapper>
          </Group>

          <Stack>
            <TextInput
              label={tl("brand_name")}
              value={widgetSettings.brandName}
              onChange={(e) => setWidgetSettings({ ...widgetSettings, brandName: e.target.value })}
            />

            <ColorInput
              label={tl("color")}
              format="hex"
              swatches={configs.swatches}
              value={widgetSettings.color}
              onChange={(color) => setWidgetSettings({ ...widgetSettings, color })}
            />
          </Stack>

          <TextInput
            label={tl("welcome_message")}
            value={widgetSettings.welcomMessage}
            placeholder={tl("welcome_message_placeholder", {
              workspaceName: workspace.userMember.workspace.name,
            })}
            onChange={(e) =>
              setWidgetSettings({ ...widgetSettings, welcomMessage: e.target.value })
            }
          />

          <TextInput
            label={tl("welcomSubMessage")}
            value={widgetSettings.welcomSubMessage}
            placeholder={tl("welcomSubMessage_placeholder")}
            onChange={(e) =>
              setWidgetSettings({ ...widgetSettings, welcomSubMessage: e.target.value })
            }
          />

          <Select
            label={tl("message_hub_position")}
            data={[
              { value: "left", label: tl("left") },
              { value: "right", label: tl("right") },
            ]}
            value={widgetSettings.position}
            onChange={(position) =>
              setWidgetSettings({ ...widgetSettings, position: position as any })
            }
          />

          <Select
            label={tl("language")}
            data={Object.values(Locale).map((v) => ({
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
            {tl("remove")}
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
    <InputWrapper label={tl("message_hubs_welcomeInputs")}>
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
              iconSize={18}
              fz={em(14)}
              onClick={addWelcomeInput}
            >
              {tl("add_input")}
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
              {tl("input")}
            </Text>
          </Group>

          <ActionIcon color="gray.5" size="xs" variant="subtle" onClick={onRemove}>
            <IconX size={16} />
          </ActionIcon>
        </Group>

        <Grid gutter={10}>
          <Grid.Col span={{ md: isDynamicInput ? 4 : 6 }}>
            <Select
              label={tl("msg_hub_input_type")}
              value={input.type}
              data={[
                { label: tl("name"), value: "name" },
                { label: tl("phone"), value: "phone" },
                { label: "Email", value: "email" },
                { label: tl("text"), value: "text" },
                { label: tl("number"), value: "number" },
              ]}
              onChange={(type) => _onChange("type", type)}
            />
          </Grid.Col>

          <Renderer visible={isDynamicInput}>
            <Grid.Col span={{ md: 4 }}>
              <TextInput
                label={tl("input_name")}
                value={input.fieldName}
                onChange={(e) => _onChange("fieldName", e.target.value)}
              />
            </Grid.Col>
          </Renderer>

          <Grid.Col span={{ md: isDynamicInput ? 4 : 6 }}>
            <TextInput
              label={tl("input_label")}
              value={input.label}
              onChange={(e) => _onChange("label", e.target.value)}
            />
          </Grid.Col>

          <Grid.Col span={{ md: 12 }}>
            <TextInput
              label={tl("input_desc")}
              value={input.description}
              onChange={(e) => _onChange("description", e.target.value)}
            />
          </Grid.Col>
        </Grid>
      </Stack>
    </Card>
  );
};
