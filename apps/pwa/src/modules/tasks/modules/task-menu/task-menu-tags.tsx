"use client";

import { Circle } from "@/components/circle";
import { TagType } from "@/graphql/enums.graphql";
import QUERY_TAGS, {
  type TagsQuery,
  type TagsQueryVariables,
} from "@/modules/tags/queries/queryTags.graphql";
import { useQuery } from "@apollo/client/react";
import { Card, Group, Stack, Text } from "@mantine/core";
import { TaskMenuComponent } from "./task-menu-types";

import { useState } from "react";
import { useUpdateTasks } from "../../hooks/use-update-tasks";
import { TaskDataFragment } from "../../queries/fragmentTask.graphql";
import styles from "./task-menu.module.css";
import { useColor } from "@/modules/theme/use-color";

export const TaskMenuTags: TaskMenuComponent = ({ task, groupVariables }) => {
  const color = useColor();
  const [tempTags, setTempTags] = useState<TaskDataFragment["tags"]>(task.tags);
  const { data } = useQuery<TagsQuery, TagsQueryVariables>(QUERY_TAGS, {
    variables: {
      type: TagType.Task,
    },
  });

  const { updateTasks } = useUpdateTasks();

  return (
    <Card p={0} shadow="md" style={{ overflow: "hidden" }} withBorder>
      <Stack py={5} px={5} gap={0}>
        {data?.tags.data.map((tag) => {
          const isSelected = tempTags.some((t) => t._id === tag._id);
          return (
            <Group
              key={tag._id}
              className={styles.TaskMenuItem}
              gap={8}
              pr={12}
              pl={6}
              py={5}
              align="center"
              onClick={() => {
                const tags = isSelected
                  ? tempTags.filter((t) => t._id !== tag._id)
                  : [...tempTags, tag];

                setTempTags(tags);
                updateTasks({
                  _id: task._id,
                  tags,
                  context: { fromGroupVariables: groupVariables },
                });
              }}
            >
              <Group
                style={{
                  border: `1px solid transparent`,
                  borderColor: isSelected ? color(tag.color || "gray") : "transparent",
                  borderRadius: "50%",
                  padding: 2,
                }}
              >
                <Circle color={tag.color || "gray"} size={12} />
              </Group>
              <Text>{tag.name}</Text>
            </Group>
          );
        })}
      </Stack>
    </Card>
  );
};
