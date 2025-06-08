import { t } from "@/modules/lang/lang-service";
import { Card, Group, Text } from "@mantine/core";
import { Node } from "@xyflow/react";

interface GroupNode {
  id: string;
  title: string;
  x?: number;
  y?: number;
  bg?: string;
  direction?: "vertical" | "horizontal";
  spacing?: number;
}

export const GroupNode = (props: any) => {
  const { bg, title } = props.data as GroupNode;

  return (
    <Group w={props.width} h={props.height} p={0} style={{ position: "relative" }}>
      <Card
        withBorder
        shadow="none"
        pl={10}
        pt={5}
        pb={0}
        style={{
          position: "absolute",
          top: -40,
          left: -10,
          right: -10,
          bottom: -10,
          borderStyle: "dashed",
          zIndex: -1,
          cursor: "default",
        }}
        bg={bg || "transparent"}
      >
        <Text fz={14} fw={500} truncate="end">
          {t(title)}
        </Text>
      </Card>
    </Group>
  );
};

export const groupNodes = (params: {
  group: GroupNode;
  nodes: Node[];
}): {
  childNodes: Node[];
  nodes: Node[];
  group: GroupNode & { x: number; y: number; width: number; height: number };
} => {
  const { group, nodes } = params;
  const itemWidth = nodes[0].width || 0;
  const itemHeight = nodes[0].height || 0;
  const direction = group.direction || "vertical";

  const spacing = group.spacing || 0;
  const groupX = group.x || 0;
  const groupY = group.y || 0;

  let outputNodes: Node[] = [];
  let outputChildNodes: Node[] = [];
  let outputGroup: GroupNode & { x: number; y: number; width: number; height: number } = {
    ...group,
    x: groupX,
    y: groupY,
    width: 0,
    height: 0,
  };

  if (direction === "horizontal") {
    const groupWidth = nodes.length * itemWidth + (nodes.length - 1) * spacing;
    const groupHeight = itemHeight;

    const groupX = group.x || 0;
    const groupY = group.y || 0;

    outputGroup = {
      ...outputGroup,
      width: groupWidth,
      height: groupHeight,
    };

    outputChildNodes = nodes.map((n, i) => ({
      ...n,
      position: {
        x: groupX + i * itemWidth + i * spacing,
        y: groupY,
      },
    }));

    outputNodes = [
      {
        id: group.id,
        type: "_group",
        width: groupWidth,
        height: groupHeight,
        position: {
          x: groupX,
          y: groupY,
        },
        data: outputGroup as any,
      },
      ...outputChildNodes,
    ];
  } else {
    const groupWidth = itemWidth;
    const groupHeight = nodes.length * itemHeight + (nodes.length - 1) * spacing;

    outputGroup = {
      ...outputGroup,
      width: groupWidth,
      height: groupHeight,
    };

    outputChildNodes = nodes.map((n, i) => ({
      ...n,
      position: {
        x: groupX,
        y: groupY + i * itemHeight + i * spacing,
      },
    }));

    outputNodes = [
      {
        id: group.id,
        type: "_group",
        width: groupWidth,
        height: groupHeight,
        position: {
          x: groupX,
          y: groupY,
        },
        data: outputGroup as any,
      },
      ...outputChildNodes,
    ];
  }

  return {
    childNodes: outputChildNodes,
    nodes: outputNodes,
    group: outputGroup,
  };
};

export const moveNodes = (nodes: Node[], offset: { x: number; y: number }) => {
  return nodes.map((n) => ({
    ...n,
    position: {
      x: n.position.x + offset.x,
      y: n.position.y + offset.y,
    },
  }));
};

export const defaultNodeTypes = {
  _group: GroupNode,
};
