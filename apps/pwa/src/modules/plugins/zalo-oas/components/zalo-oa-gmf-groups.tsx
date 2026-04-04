"use client";

import { Empty } from "@/components/empty";
import { NumberFormat } from "@/components/format/number-format";
import { EventType } from "@/graphql/enums.graphql";
import { useEventsListener } from "@/modules/events/event-service";
import { useWorkspaceSetting } from "@/modules/workspace-settings/hooks/use-workspace-setting";
import { useQuery } from "@apollo/client/react";
import { Trans } from "@lingui/react/macro";
import { ActionIcon, Anchor, Card, Group, Stack, Switch, Text } from "@mantine/core";
import { IconExternalLink } from "@tabler/icons-react";
import { type FC } from "react";
import GetOaGmfGroupsDocument from "../graphql/getOaGmfGroups.graphql";

export const ZaloOaGmfGroups: FC = () => {
  const { workspaceSetting, updateWorkspaceSetting } = useWorkspaceSetting();
  const { data, refetch } = useQuery(GetOaGmfGroupsDocument);

  useEventsListener([EventType.WorkspaceSettingUpdated], () => refetch());

  return (
    <Stack>
      {data?.getOaGmfGroups.map((item) => {
        const setting = workspaceSetting?.zaloOaGmfGroupSettings?.[item.group_id] || {};
        return (
          <Card key={item.group_id} withBorder shadow="none">
            <Stack gap={10}>
              <Group justify="space-between">
                <Anchor href={item.group_link} target="_blank" c="dark">
                  <Group gap={4}>
                    <Text fw={500}>{item.name}</Text>
                    <ActionIcon component="div" color="gray" variant="subtle">
                      <IconExternalLink size={16} />
                    </ActionIcon>
                  </Group>
                </Anchor>

                <Text fz={12} c="gray">
                  <NumberFormat value={item.total_member} /> <Trans>Members</Trans>
                </Text>
              </Group>

              <Switch
                defaultChecked={setting.isAdminNotificationEnabled}
                onChange={(e) => {
                  updateWorkspaceSetting({
                    zaloOaGmfGroupSettings: {
                      ...workspaceSetting?.zaloOaGmfGroupSettings,
                      [item.group_id]: {
                        ...setting,
                        isAdminNotificationEnabled: e.target.checked,
                      },
                    },
                  });
                }}
                label={<Trans>Enable/Disable notifications for admin</Trans>}
              />
            </Stack>
          </Card>
        );
      })}

      {data?.getOaGmfGroups.length === 0 && <Empty />}
    </Stack>
  );
};
