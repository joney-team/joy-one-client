"use client";

import { Empty } from "@/components/empty";
import { NumberFormat } from "@/components/format/number-format";
import { useList } from "@/components/list/use-list";
import { EventType } from "@/graphql/enums.graphql";
import { api } from "@/modules/apis";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { ResponseList } from "@/types";
import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { ActionIcon, Anchor, Card, Group, Stack, Switch, Text } from "@mantine/core";
import { IconExternalLink } from "@tabler/icons-react";
import { type FC } from "react";
import { ZaloOaGmfGroup } from "../zalo-oas-types";

export const ZaloOaGmfGroups: FC = () => {
  const workspace = useWorkspace();

  const { data, count } = useList({
    fetch: async () => api.get<ResponseList<ZaloOaGmfGroup>>("/plugins/zalo-oas/gmf-groups"),
    events: [EventType.WorkspaceSettingUpdated],
  });

  return (
    <Stack>
      {data.map((item) => {
        const setting = workspace.settings.zaloOaGmfGroupSettings?.[item.group_id] || {};
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
                  workspace.setSettings({
                    zaloOaGmfGroupSettings: {
                      ...workspace.settings.zaloOaGmfGroupSettings,
                      [item.group_id]: {
                        ...setting,
                        isAdminNotificationEnabled: e.target.checked,
                      },
                    },
                  });
                }}
                label={t`Enable/Disable notifications for admin`}
              />
            </Stack>
          </Card>
        );
      })}

      {count === 0 && <Empty />}
    </Stack>
  );
};
