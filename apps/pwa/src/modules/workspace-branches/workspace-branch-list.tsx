"use client";

import { Button } from "@/components/buttons/button";
import { Clickable } from "@/components/clickable";
import { BranchesIllustration } from "@/components/illustrations/branches";
import { List } from "@/components/list";
import { EventType } from "@/modules/events/event-types";
import { useColor } from "@/modules/theme/use-color";
import { OnWorkspaceBranchModal } from "@/modules/workspace-branches/modals/modal-workspace-branch";
import { WorkspacePermission } from "@/modules/workspace-roles/workspace-roles-types";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { Trans } from "@lingui/react/macro";
import { Stack, Text, Title } from "@mantine/core";
import { IconEdit, IconPlus } from "@tabler/icons-react";
import { type FC } from "react";
import { useLocations } from "../locations/locations-context";
import { WorkspaceBranchEntity } from "./workspace-branches-types";

export const WorkspaceBranchList: FC = () => {
  const color = useColor();
  const workspace = useWorkspace();
  const { renderVnLocation: renderLocation } = useLocations();

  return (
    <Stack p={16}>
      <List<WorkspaceBranchEntity>
        creatable={{
          onCreate: () => OnWorkspaceBranchModal(),
          permission: WorkspacePermission.WORKSPACE_SETTINGS,
        }}
        route="/workspace-branches"
        id="workspace-branches"
        columns={{
          name: {
            filter: { text: true },
            render: ({ data }) => {
              return (
                <Clickable onClick={() => OnWorkspaceBranchModal(data)}>
                  <Text>{data.name}</Text>
                </Clickable>
              );
            },
          },
          hotline: { filter: { text: true } },
          location: {
            name: "address",
            render: ({ value }) => {
              return renderLocation(value);
            },
          },
        }}
        actions={[
          {
            label: "edit",
            icon: IconEdit,
            onClick: (data) => OnWorkspaceBranchModal(data),
          },
        ]}
        events={[EventType.WORKSPACE_BRANCH_NEW, EventType.WORKSPACE_BRANCH_UPDATED]}
        components={{
          empty: workspace.hasPermission(WorkspacePermission.WORKSPACE_SETTINGS)
            ? () => (
                <Stack align="center" justify="center" p={30} gap={30}>
                  <BranchesIllustration width={160} />
                  <Stack gap={3}>
                    <Title ta="center" order={4}>
                      <Trans>Manage the branches of the Workspace</Trans>
                    </Title>
                    <Text ta="center" fz={14} c="gray">
                      <Trans>
                        The branches are independent and managed by the main office. Timekeeping is
                        deployed according to the branch
                      </Trans>
                    </Text>
                  </Stack>

                  <Button
                    action
                    leftIcon={IconPlus}
                    onClick={() => OnWorkspaceBranchModal()}
                    color={color("primary")}
                  >
                    <Trans>Create new</Trans>
                  </Button>
                </Stack>
              )
            : undefined,
        }}
      />
    </Stack>
  );
};
