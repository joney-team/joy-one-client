"use client";

import { Circle } from "@/components/circle";
import { TagType } from "@/graphql/enums.graphql";
import QUERY_TAGS, {
  type TagsQuery,
  type TagsQueryVariables,
} from "@/modules/tags/graphql/queryTags.graphql";
import { useQuery } from "@apollo/client/react";
import { Card, Group, Stack, Text } from "@mantine/core";
import { TaskMenuComponent } from "./task-menu-types";

import { Button } from "@/components/buttons/button";
import { ModalTagForm } from "@/modules/tags/modals/modal-tag-form";
import { useColor } from "@/modules/theme/use-color";
import { Trans } from "@lingui/react/macro";
import { IconTagPlus } from "@tabler/icons-react";
import { useState } from "react";
import { TaskDataFragment } from "../../graphql/fragmentTask.graphql";
import styles from "./task-menu.module.css";

export const TaskMenuTags: TaskMenuComponent = ({ task, groupVariables, updateTask }) => {
  const color = useColor();
  const [selected, setSelected] = useState<TaskDataFragment["tags"]>(task.tags);
  const { data } = useQuery<TagsQuery, TagsQueryVariables>(QUERY_TAGS, {
    variables: {
      type: TagType.Task,
    },
  });

  return (
    <ModalTagForm>
      {(openTagForm) => (
        <Card p={0} shadow="md" style={{ overflow: "hidden" }} withBorder>
          <Stack py={5} px={5} gap={0}>
            {data?.tags.data.map((tag) => {
              const isSelected = selected.some((t) => t._id === tag._id);
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
                      ? selected.filter((t) => t._id !== tag._id)
                      : [...selected, tag];

                    setSelected(tags);
                    updateTask({
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
                  <Text fz={14}>{tag.name}</Text>
                </Group>
              );
            })}

            <Button
              leftIcon={IconTagPlus}
              variant="transparent"
              size="compact-sm"
              color="gray"
              fw={400}
              onClick={() =>
                openTagForm({
                  type: TagType.Task,
                  onCreated: (tag) => {
                    setSelected([...selected, tag]);
                    updateTask({
                      _id: task._id,
                      tags: [...selected, tag],
                      context: { fromGroupVariables: groupVariables },
                    });
                  },
                })
              }
            >
              <Trans>Create new tag</Trans>
            </Button>
          </Stack>
        </Card>
      )}
    </ModalTagForm>
  );
};
