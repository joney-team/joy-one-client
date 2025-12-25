"use client";

import { FC } from "react";
import { ActivityDataFragment } from "./graphql/fragmentActivity.graphql";
import { Card, Group, Stack, Text } from "@mantine/core";
import { Editor } from "@/components/editor/editor";
import { parseEditorJSON } from "@/components/editor/editor-utils";
import { Avatar } from "@/components/avatar";
import { RelativeTimeFormat } from "@/components/format/date-format";

export const ActivityCard: FC<{ activity: ActivityDataFragment }> = ({ activity }) => {
  return (
    <Card>
      <Stack>
        <Group>
          {activity.createdByUser && (
            <Group gap={6}>
              <Avatar user={activity.createdByUser} size={16} hideOnlineStatus />
              <Text fz="sm" fw={500}>
                {activity.createdByUser.name}
              </Text>

              {activity.createdAt && (
                <Text fz="xs" c="gray">
                  <RelativeTimeFormat value={activity.createdAt} />
                </Text>
              )}
            </Group>
          )}
        </Group>
        <Editor
          key={activity._id}
          defaultValue={parseEditorJSON(activity.content)}
          readonly
          isNonWrapped
        />
      </Stack>
    </Card>
  );
};
