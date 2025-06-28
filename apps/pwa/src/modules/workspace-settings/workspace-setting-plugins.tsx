import { type FC } from "react";

import { workspacePluginCards } from "@/modules/workspace-settings/workspace-settings-config";
import { WorkspaceSettingCard } from "@/modules/workspace-settings/components/workspace-setting-card";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { SimpleGrid, Stack } from "@mantine/core";

export const WorkspaceSettingPlugins: FC = () => {
  const workspace = useWorkspace();

  return (
    <Stack p={16}>
      <SimpleGrid cols={{ md: 4 }}>
        {workspacePluginCards
          .filter((v) => !v.workspaceTypes || v.workspaceTypes.includes(workspace.type))
          .map((item) => (
            <WorkspaceSettingCard key={item.name} {...item} />
          ))}
      </SimpleGrid>
    </Stack>
  );
};
