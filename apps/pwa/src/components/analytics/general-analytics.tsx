import { useApp } from "@/app.context";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { useAptabase } from "@aptabase/react";
import { useDebouncedCallback } from "@mantine/hooks";
import { useEffect, type FC } from "react";

export const GeneralAnalytics: FC = () => {
  const app = useApp();
  const workspace = useWorkspace();
  const { trackEvent } = useAptabase();

  const onChangeModule = useDebouncedCallback(() => {
    if (!workspace.activatedModule || workspace.activatedModule.id === "dashboard") return;
    trackEvent(`Access module > ${workspace.activatedModule?.id}`);
  }, 300);

  useEffect(() => {
    if (app.isInitialized && workspace.activatedModule) {
      onChangeModule();
    }
  }, [app.isInitialized, workspace.activatedModule]);

  return null;
};
