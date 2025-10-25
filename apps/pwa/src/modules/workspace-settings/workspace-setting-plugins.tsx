import { type FC } from "react";

import { WorkspaceSettingCard } from "@/modules/workspace-settings/components/workspace-setting-card";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { SimpleGrid, Stack } from "@mantine/core";

export const WorkspaceSettingPlugins: FC = () => {
  const workspace = useWorkspace();

  const workspacePluginModules = workspace.availableModules.filter(
    (m) => m.id.startsWith("workspacePlugins") && m.id !== "workspacePlugins"
  );

  return (
    <Stack p={16}>
      <SimpleGrid cols={{ md: 4 }}>
        {workspacePluginModules
          .filter((v) => !v.workspaceTypes || v.workspaceTypes.includes(workspace.type))
          .map((mod) => (
            <WorkspaceSettingCard key={mod.id} moduleId={mod.id} />
          ))}
      </SimpleGrid>
    </Stack>
  );
};
