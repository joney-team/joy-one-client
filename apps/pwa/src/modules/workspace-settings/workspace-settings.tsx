"use client";

import { WorkspaceSettingCard } from "@/modules/workspace-settings/components/workspace-setting-card";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { SimpleGrid } from "@mantine/core";
import { type FC } from "react";
import { useAvailableWorkspaceModules } from "../workspaces/workspace-modules";

export const WorkspaceSettings: FC = () => {
  const workspace = useWorkspace();
  const { availableModules } = useAvailableWorkspaceModules();
  const workspaceSettingModules = availableModules.filter(
    (m) => m.id.startsWith("workspaceSettings") && m.id !== "workspaceSettings"
  );

  return (
    <SimpleGrid cols={{ md: 4 }} p={16}>
      {workspaceSettingModules
        .filter((v) => !v.workspaceTypes || v.workspaceTypes.includes(workspace.type))
        .map((mod) => (
          <WorkspaceSettingCard key={mod.id} moduleId={mod.id} />
        ))}
    </SimpleGrid>
  );
};
