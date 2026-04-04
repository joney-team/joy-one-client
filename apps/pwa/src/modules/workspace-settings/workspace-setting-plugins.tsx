import { type FC } from "react";

import { WorkspaceSettingCard } from "@/modules/workspace-settings/components/workspace-setting-card";
import { SimpleGrid, Stack } from "@mantine/core";
import { useAvailableWorkspaceModules } from "../workspaces/workspace-modules";

export const WorkspaceSettingPlugins: FC = () => {
  const { availableModules } = useAvailableWorkspaceModules();

  const workspacePluginModules = availableModules.filter(
    (m) => m.id.startsWith("workspacePlugins") && m.id !== "workspacePlugins",
  );

  return (
    <Stack p="md">
      <SimpleGrid cols={{ md: 4 }}>
        {workspacePluginModules.map((mod) => (
          <WorkspaceSettingCard key={mod.id} moduleId={mod.id} />
        ))}
      </SimpleGrid>
    </Stack>
  );
};
