"use client";

import { useApp } from "@/app.context";
import { useAuth } from "@/modules/auth/auth-context";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { useDebouncedCallback } from "@mantine/hooks";
import { useEffect, type FC } from "react";
import { getClarity, useTracking } from "./hooks-analytics";
import config from "@joy-one-client/config";

export const GeneralAnalytics: FC = () => {
  const app = useApp();
  const auth = useAuth();
  const workspace = useWorkspace();
  const { trackEvent } = useTracking();

  const onChangeModule = useDebouncedCallback(() => {
    if (!workspace.activatedModule) return;
    trackEvent(`Access module > ${workspace.activatedModule?.id}`);
  }, 300);

  useEffect(() => {
    if (app.isInitialized && workspace.activatedModule) {
      onChangeModule();
    }
  }, [app.isInitialized, workspace.activatedModule]);

  useEffect(() => {
    const clarity = getClarity();
    if (auth.user && clarity && !config.isDevelopment) {
      clarity("identify", auth.user._id, auth.device._id, undefined, auth.user.name);
    }
  }, [auth.user]);

  return null;
};
