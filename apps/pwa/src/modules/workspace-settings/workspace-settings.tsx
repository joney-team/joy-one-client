import { type FC } from "react";
import { workspaceSettingCards } from "@/modules/workspace-settings/workspace-settings-config";
import { WorkspaceSettingCard } from "@/modules/workspace-settings/components/workspace-setting-card";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { SimpleGrid } from "@mantine/core";

export const WorkspaceSettings: FC = () => {
  const workspace = useWorkspace();

  return (
    <SimpleGrid cols={{ md: 4 }} p={16}>
      {workspaceSettingCards
        .filter((v) => !v.workspaceTypes || v.workspaceTypes.includes(workspace.type))
        .map((item, index) => (
          <WorkspaceSettingCard key={index} {...item} />
        ))}
    </SimpleGrid>
  );
};
