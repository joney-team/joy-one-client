"use client";

import { Avatar } from "@/components/avatar";
import { defaultNodeTypes, groupNodes, moveNodes } from "@/components/flows";
import { Image } from "@/components/image";
import { useLayout } from "@/layout/layout-context";
import { renderDateTime, renderFromNow } from "@/modules/lang/lang-service";
import { messageBoxPlatformImages } from "@/modules/message-boxes/message-boxes-service";
import { MessageBoxPlatformType } from "@/modules/message-boxes/message-boxes-types";
import { OnModalCreatePluginAiAssistant } from "@/modules/plugins/ai-assistants/modal-create-plugin-ai-assistant";
import { updatePluginAiAssistant } from "@/modules/plugins/ai-assistants/plugin-ai-assistants-service";
import { OnModalConnectPlugins } from "@/modules/plugins/modal-connect-plugins";
import { usePlugins } from "@/modules/plugins/plugins-context";
import { useColor } from "@/modules/theme/use-color";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { String } from "@/utils/string.utils";
import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { ActionIcon, Card, Group, Indicator, Stack, Switch, Text, Tooltip } from "@mantine/core";
import { useElementSize } from "@mantine/hooks";
import { IconClock, IconMessage, IconPlus } from "@tabler/icons-react";
import { Handle, Position, ReactFlow } from "@xyflow/react";
import { FC, Fragment } from "react";

const cardRootSize = {
  width: 300,
  height: 110,
};

const cardSize = {
  width: 260,
  height: 65,
};

const cardAiSize = {
  width: 320,
  height: 80,
};

const RootNode = () => {
  const workspace = useWorkspace();
  const color = useColor();

  return (
    <Fragment>
      <Handle type="target" position={Position.Left} />
      <Card
        withBorder
        shadow="none"
        p={0}
        style={{
          cursor: "default",
          borderColor: color("primary"),
        }}
      >
        <Group
          gap={10}
          px={16}
          py={10}
          w={cardRootSize.width}
          h={cardRootSize.height}
          wrap="nowrap"
        >
          <Avatar workspace={workspace.userMember.workspace} radius={8} size={70} />
          <Stack gap={0}>
            <Tooltip
              label={workspace.userMember.workspace.name}
              disabled={workspace.userMember.workspace.name.length < 10}
            >
              <Text fz={25} fw={500} truncate="end" maw={160}>
                {workspace.userMember.workspace.name}
              </Text>
            </Tooltip>
            <Text fz={12} c="gray.6" truncate="end">
              Workspace
            </Text>
          </Stack>
        </Group>
      </Card>
      <Handle type="target" position={Position.Right} />
    </Fragment>
  );
};

const AiIntegrationNode = () => {
  const plugins = usePlugins();
  const aiPlugin = plugins.aiAssistants[0];

  return (
    <Fragment>
      <Handle type="source" position={Position.Left} />

      <Card
        withBorder
        shadow="none"
        w={cardAiSize.width}
        h={cardAiSize.height}
        p={0}
        style={{
          borderStyle: aiPlugin ? "solid" : "dashed",
        }}
      >
        <Group gap={10} align="center" wrap="nowrap" h={cardAiSize.height} px={16}>
          <Group
            gap={10}
            flex={1}
            style={{
              cursor: "pointer",
            }}
            onClick={() => OnModalCreatePluginAiAssistant(aiPlugin)}
          >
            <Image src="/images/ai-assistants.png" w={40} h={40} />

            <Stack gap={0} flex={1}>
              {aiPlugin ? (
                <Fragment>
                  <Tooltip label={aiPlugin.providerName}>
                    <Text fz={16} fw={500} truncate="end">
                      {String.limitCharacters(aiPlugin.providerName, 20)}
                    </Text>
                  </Tooltip>
                  <Text fz={10} c="gray.6" truncate="end">
                    <Trans>AI assistant</Trans>
                  </Text>
                </Fragment>
              ) : (
                <Group wrap="nowrap" gap={0}>
                  <ActionIcon variant="transparent" color="dark">
                    <IconPlus size={16} />
                  </ActionIcon>
                  <Text fz={14} fw={500} truncate="end">
                    <Trans>Connect</Trans> <Trans>AI assistant</Trans>
                  </Text>
                </Group>
              )}
            </Stack>
          </Group>

          {aiPlugin && (
            <Switch
              style={{
                cursor: "pointer",
              }}
              checked={aiPlugin?.enabled}
              onChange={() => false}
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                updatePluginAiAssistant(aiPlugin._id, { enabled: !aiPlugin.enabled });
              }}
            />
          )}
        </Group>
      </Card>
    </Fragment>
  );
};

const PluginNode = (props: any) => {
  const { plugin, name, type } = props.data;

  const platformType =
    type === "metaPages"
      ? MessageBoxPlatformType.META_PAGE
      : type === "zalaOAs"
      ? MessageBoxPlatformType.ZALO
      : MessageBoxPlatformType.MESSAGE_HUB;

  const PluginAvatar: FC = (
    {
      metaPages: () => <Avatar color="primary" pluginMetaPage={plugin} size={30} />,
      zalaOAs: () => <Avatar color="primary" pluginZaloOa={plugin} size={30} />,
      messageHubs: () => (
        <Avatar icon={IconMessage} src="/images/plugins-message-hubs.png" size={30} />
      ),
    } as any
  )[type];

  return (
    <Fragment>
      <Handle type="source" position={Position.Right} />

      <Card
        withBorder
        shadow="none"
        w={cardSize.width}
        h={cardSize.height}
        p={0}
        style={{ cursor: "default" }}
      >
        <Group gap={10} align="center" w={cardSize.width} h={cardSize.height} p={16} wrap="nowrap">
          <Indicator
            label={<Image src={messageBoxPlatformImages[platformType]} w={16} h={16} />}
            radius={8}
            color="var(--mantine-color-body)"
            position="bottom-end"
            offset={5}
            styles={{
              indicator: {
                paddingInline: 0,
                width: 20,
                height: 20,
                transform: "translate(50%, 80%)",
                zIndex: 10,
              },
            }}
          >
            <PluginAvatar />
          </Indicator>
          <Stack gap={0}>
            <Tooltip label={name} disabled={!name || name.length < 15}>
              <Text fz={16} fw={500} truncate="end" maw={150}>
                {name || t`Plugin`}
              </Text>
            </Tooltip>

            {!!plugin.lastInteractionAt && (
              <Tooltip
                label={`${t`Last interaction at`}: ${renderDateTime(plugin.lastInteractionAt)}`}
              >
                <Text fz={10} fw={500} c="gray" truncate="end">
                  <IconClock size={12} style={{ marginBottom: -2.5 }} />{" "}
                  {renderFromNow(plugin.lastInteractionAt)}
                </Text>
              </Tooltip>
            )}
          </Stack>
        </Group>
      </Card>
    </Fragment>
  );
};

const PlusPluginNode = (props: any) => {
  const { isHasPlugin } = props.data;
  return (
    <Fragment>
      <Handle type="source" position={Position.Right} />

      <Card
        withBorder
        shadow="none"
        p={0}
        h={cardSize.height}
        w={cardSize.width}
        style={{ cursor: "pointer", borderStyle: "dashed" }}
        onClick={() => OnModalConnectPlugins()}
      >
        <Group
          gap={10}
          align="center"
          h={cardSize.height}
          w={cardSize.width}
          p={16}
          wrap="nowrap"
          bg="var(--mantine-color-body)"
        >
          <ActionIcon size={30} radius={100} variant="subtle" color="dark">
            <IconPlus size={20} strokeWidth={1.5} />
          </ActionIcon>
          <Text fz={14} fw={500} truncate="end">
            {isHasPlugin ? t`Connect more` : t`Connect platform`}
          </Text>
        </Group>
      </Card>
    </Fragment>
  );
};

export const WorkspaceSettingMessageBoxesIntegrations: FC = () => {
  const layout = useLayout();
  const sized = useElementSize();
  const plugins = usePlugins();
  const aiPlugin = plugins.aiAssistants[0];

  const distanceFromRoot = 100;

  const rootPosition = {
    x: sized.width * 0.5 - cardRootSize.width / 2,
    y: sized.height / 2 - cardRootSize.height / 2,
  };

  const pluginsGroup = groupNodes({
    group: {
      x: 0,
      y: 0,
      id: "plugins",
      title: "message_source",
      spacing: 16,
    },
    nodes: [
      ...plugins.metaPages.map((m) => ({
        id: m._id,
        type: "plugin",
        data: { name: m.name, plugin: m, type: "metaPages" },
        position: { x: 0, y: 0 },
        ...cardSize,
      })),
      ...plugins.zaloOas.map((m) => ({
        id: m._id,
        type: "plugin",
        data: { name: m.info.name, plugin: m, type: "zalaOAs" },
        position: { x: 0, y: 0 },
        ...cardSize,
      })),
      ...plugins.messageHubs.map((m) => ({
        id: m._id,
        type: "plugin",
        data: { name: m.name, plugin: m, type: "messageHubs" },
        position: { x: 0, y: 0 },
        ...cardSize,
      })),
      {
        id: "plus",
        type: "plus",
        position: { x: 0, y: 0 },
        ...cardSize,
        data: {},
      },
    ],
  });

  const nodes = [
    {
      id: "root",
      position: rootPosition,
      type: "root",
      data: {},
    },
    ...moveNodes(pluginsGroup.nodes, {
      x: rootPosition.x - distanceFromRoot - cardSize.width,
      y: sized.height / 2 - pluginsGroup.group.height / 2,
    }),
    // Ai Integration
    {
      id: "ai",
      type: "ai",
      position: {
        x: rootPosition.x + distanceFromRoot * 0.5 + cardAiSize.width,
        y: sized.height / 2 - cardAiSize.height / 2,
      },
      data: {},
    },
  ];

  // Edges
  const edges = [
    // Plugin -> Root
    ...pluginsGroup.childNodes.map((p) => ({
      id: `${p.id}-root`,
      source: p.id,
      target: "root",
      animated: true,
    })),
    // Ai -> Root
    { id: "ai-root", source: "ai", target: "root", animated: !aiPlugin || aiPlugin.enabled },
  ];

  return (
    <Card ref={sized.ref} w="100%" h={layout.height - 200} p={0} bg="gray.0" shadow="none">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={{
          ...defaultNodeTypes,
          root: RootNode,
          plugin: PluginNode,
          plus: PlusPluginNode,
          ai: AiIntegrationNode,
        }}
        nodesDraggable={false}
        zoomOnDoubleClick={false}
        zoomOnPinch={false}
        zoomOnScroll={false}
        maxZoom={1}
        minZoom={1}
      />
    </Card>
  );
};
