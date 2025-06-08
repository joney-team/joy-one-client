import { type FC } from "react";
import { workspaceSettingNavs } from "@/configs/workspace.config";
import { WorkspaceSettingCard } from "@/modules/workspace-settings/components/workspace-setting-card";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { SimpleGrid } from "@mantine/core";

export const WorkspaceSettings: FC = () => {
  const workspace = useWorkspace();

  return (
    <SimpleGrid cols={{ md: 4 }} p={16}>
      {workspaceSettingNavs
        .filter((v) => !v.workspaceTypes || v.workspaceTypes.includes(workspace.type))
        .map((item) => (
          <WorkspaceSettingCard key={item.name} {...item} />
        ))}
    </SimpleGrid>
  );
};
