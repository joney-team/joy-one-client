import { useColor } from "@/modules/theme/use-color";
import { useLayout } from "@/layout/layout-context";
import { OnModalConnectPlugins } from "@/modules/plugins/modal-connect-plugins";
import { OnPluginAiAssistantModal } from "@/modules/plugins/ai-assistants/modal-plugin-ai-assistants";
import { renderDateTime, renderFromNow, t } from "@/modules/lang/lang-service";
import { updatePluginAiAssistant } from "@/modules/plugins/ai-assistants/ai-assistants-service";
import { usePlugins } from "@/modules/plugins/plugins-context";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { capitalize, StringUtils } from "@/utils/string.utils";
import { ActionIcon, Card, Group, Stack, Switch, Text, Tooltip } from "@mantine/core";
import { useElementSize } from "@mantine/hooks";
import { IconClock, IconMessage, IconPlus } from "@tabler/icons-react";
import { Handle, Position, ReactFlow } from "@xyflow/react";
import { FC } from "react";
import { Avatar } from "@/components/avatar";
import { defaultNodeTypes, groupNodes, moveNodes } from "@/components/flows";
import { Image } from "@/components/image";

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
    <>
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
        <Group gap={10} px={16} py={10} w={cardRootSize.width} h={cardRootSize.height} wrap="nowrap">
          <Avatar workspace={workspace.userMember.workspace} radius={8} size={70} />
          <Stack gap={0}>
            <Text fz={25} fw={500} truncate="end">
              {workspace.userMember.workspace.name}
            </Text>
            <Text fz={12} c="gray.6" truncate="end">
              {t("workspace")}
            </Text>
          </Stack>
        </Group>
      </Card>
      <Handle type="target" position={Position.Right} />
    </>
  );
};

const AiIntegrationNode = () => {
  const plugins = usePlugins();
  const aiPlugin = plugins.aiAssistants[0];

  return (
    <>
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
            onClick={() => OnPluginAiAssistantModal(aiPlugin)}
          >
            <Image src="/images/ai-assistants.png" w={40} h={40} />

            <Stack gap={0} flex={1}>
              {aiPlugin ? (
                <>
                  <Tooltip label={aiPlugin.providerName}>
                    <Text fz={16} fw={500} truncate="end">
                      {StringUtils.limitCharacters(aiPlugin.providerName, 20)}
                    </Text>
                  </Tooltip>
                  <Text fz={10} c="gray.6" truncate="end">
                    {t("ai_assistant")}
                  </Text>
                </>
              ) : (
                <Group wrap="nowrap" gap={0}>
                  <ActionIcon variant="transparent" color="dark">
                    <IconPlus size={16} />
                  </ActionIcon>
                  <Text fz={14} fw={500} truncate="end">{`${t("connect")} ${t("ai-assistants")}`}</Text>
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
    </>
  );
};

const PluginNode = (props: any) => {
  const { plugin, name, type } = props.data;

  const PluginAvatar: FC = (
    {
      metaPages: () => <Avatar color="primary" pluginMetaPage={plugin} size={30} />,
      zalaOAs: () => <Avatar color="primary" pluginZaloOa={plugin} size={30} />,
      messageHubs: () => <Avatar icon={IconMessage} src="/images/plugins-message-hubs.png" size={30} />,
    } as any
  )[type];

  return (
    <>
      <Handle type="source" position={Position.Right} />

      <Card withBorder shadow="none" w={cardSize.width} h={cardSize.height} p={0} style={{ cursor: "default" }}>
        <Group gap={10} align="center" w={cardSize.width} h={cardSize.height} p={16} wrap="nowrap">
          <PluginAvatar />
          <Stack gap={0}>
            <Text fz={16} fw={500} truncate="end">
              {name || t("plugin")}
            </Text>
            {!!plugin.lastInteractionAt && (
              <Tooltip label={capitalize(`${t("last_interaction_at")}: ${renderDateTime(plugin.lastInteractionAt)}`)}>
                <Text fz={10} fw={500} c="gray" truncate="end">
                  <IconClock size={12} style={{ marginBottom: -2.5 }} /> {renderFromNow(plugin.lastInteractionAt)}
                </Text>
              </Tooltip>
            )}
          </Stack>
        </Group>
      </Card>
    </>
  );
};

const PlusPluginNode = (props: any) => {
  const { isHasPlugin } = props.data;
  return (
    <>
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
            {isHasPlugin ? t("connect_more") : t("connect_platform")}
          </Text>
        </Group>
      </Card>
    </>
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
        data: { name: m.name, plugin: m, type: "zalaOAs" },
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
    ...pluginsGroup.childNodes.map((p) => ({ id: `${p.id}-root`, source: p.id, target: "root", animated: true })),
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
