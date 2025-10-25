import { Button } from "@/components/buttons/button";
import { Clickable } from "@/components/clickable";
import { BranchesIllustration } from "@/components/illustrations/branches";
import { List } from "@/components/list";
import { EventType } from "@/modules/events/event-types";
import { tl, tMulti } from "@/modules/lang/lang-service";
import { useColor } from "@/modules/theme/use-color";
import { OnWorkspaceBranchModal } from "@/modules/workspace-branches/modals/modal-workspace-branch";
import { WorkspacePermission } from "@/modules/workspace-roles/workspace-roles-types";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
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
                      {tl("branches_desc")}
                    </Title>
                    <Text ta="center" fz={14} c="gray">
                      {tl("branches_desc_2")}
                    </Text>
                  </Stack>

                  <Button
                    action
                    leftIcon={IconPlus}
                    onClick={() => OnWorkspaceBranchModal()}
                    color={color("primary")}
                  >
                    {tMulti(["create"], ["branch"])}
                  </Button>
                </Stack>
              )
            : undefined,
        }}
      />
    </Stack>
  );
};
