"use client";

import { onActionLoad } from "@/utils/actions";
import { useMutation } from "@apollo/client/react";
import { Trans } from "@lingui/react/macro";
import { Card, Group, Stack, Switch, Text, ThemeIcon } from "@mantine/core";
import { IconAccessible, IconApiApp, IconId } from "@tabler/icons-react";
import { FC } from "react";
import { WorkspaceMemberRoleName } from "../workspace-roles/components/workspace-role-name";
import { WorkspaceApiAppFragment } from "./graphql/fragmentWorkspaceApiApp.graphql";
import UpdateWorkspaceApiAppDocument from "./graphql/updateWorkspaceApiApp.graphql";
import { OnModalWorkspaceApiApp } from "./workspace-api-app-modal";

interface WorkspaceApiAppCardProps {
  app: WorkspaceApiAppFragment;
}

export const WorkspaceApiAppCard: FC<WorkspaceApiAppCardProps> = ({ app }) => {
  const [update] = useMutation(UpdateWorkspaceApiAppDocument);

  return (
    <Card
      withBorder
      shadow="none"
      className="clickable"
      onClick={() => OnModalWorkspaceApiApp(app)}
    >
      <Group align="start">
        <ThemeIcon size="xl" variant="light">
          <IconApiApp />
        </ThemeIcon>

        <Stack gap="md" flex={1}>
          <Group gap={5} justify="space-between" align="center" w="100%">
            <Text fw={500}>{app.member.name}</Text>

            <Group
              className="clickable"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                onActionLoad({
                  name: <Trans>Update workspace API app</Trans>,
                  process: () =>
                    update({
                      variables: {
                        appId: app._id,
                        input: {
                          name: app.member.name,
                          roleIds: app.member.roles.map((v) => v._id),
                          enabled: !app.enabled,
                        },
                      },
                    }),
                });
              }}
            >
              <Switch checked={app.enabled} />
            </Group>
          </Group>
          <Stack gap={5}>
            <Group gap={5}>
              <ThemeIcon size="xs" variant="transparent" color="gray">
                <IconId size={14} />
              </ThemeIcon>
              <Text fz={12} c="gray">
                ID: {app._id}
              </Text>
            </Group>

            <Group gap={5}>
              <ThemeIcon size="xs" variant="transparent" color="gray">
                <IconAccessible size={14} />
              </ThemeIcon>
              <Text fz={12} c="gray">
                <Trans>Role</Trans>: <WorkspaceMemberRoleName member={app.member} />
              </Text>
            </Group>
          </Stack>
        </Stack>
      </Group>
    </Card>
  );
};
