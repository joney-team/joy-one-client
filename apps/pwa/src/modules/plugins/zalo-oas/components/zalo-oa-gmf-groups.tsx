import { api } from "@/modules/apis";
import { ResponseList } from "@/types";
import { useList } from "@/components/list/use-list";
import { ActionIcon, Anchor, Card, Group, Stack, Switch, Text } from "@mantine/core";
import { type FC } from "react";
import { ZaloOaGmfGroup } from "../zalo-oas-types";
import { Empty } from "@/components/empty";
import { num, tl } from "@/modules/lang/lang-service";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { EventType } from "@/modules/events/event-types";
import { IconExternalLink } from "@tabler/icons-react";

export const ZaloOaGmfGroups: FC = () => {
  const workspace = useWorkspace();

  const { data, count } = useList({
    fetch: async () => api.get<ResponseList<ZaloOaGmfGroup>>("/plugins/zalo-oas/gmf-groups"),
    events: [EventType.WORKSPACE_SETTING_UPDATED],
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
                  {num(item.total_member)} {tl("members")}
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
                label={tl("admin_notifications_switch")}
              />
            </Stack>
          </Card>
        );
      })}

      {count === 0 && <Empty />}
    </Stack>
  );
};
