"use client";

import { useApp } from "@/app.context";
import { useAuth } from "@/modules/auth/auth-context";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { useActivatedWorkspaceModule } from "@/modules/workspaces/workspace-modules";
import config from "@joy-one/config";
import { useDebouncedCallback } from "@mantine/hooks";
import * as Sentry from "@sentry/react";
import { useEffect, type FC } from "react";
import { getClarity, useTracking } from "./hooks-analytics";

export const GeneralAnalytics: FC = () => {
  const app = useApp();
  const auth = useAuth();
  const { member } = useWorkspace();
  const activatedModule = useActivatedWorkspaceModule();
  const { trackEvent } = useTracking();

  const onChangeModule = useDebouncedCallback(() => {
    if (!activatedModule) return;
    trackEvent(`Access module > ${activatedModule?.id}`);
  }, 300);

  useEffect(() => {
    if (app.isInitialized && activatedModule) {
      onChangeModule();
    }
  }, [app.isInitialized, activatedModule]);

  useEffect(() => {
    const clarity = getClarity();
    if (auth.user && clarity && config.ANALYTICS_KEY) {
      clarity("identify", auth.user._id, auth.device._id, undefined, auth.user.name);
    }
  }, [auth.user]);

  useEffect(() => {
    if (member) {
      // Add workspace code and name to Sentry
      Sentry.setExtra("Workspace", {
        code: member.workspace.code,
        name: member.workspace.name,
      });
    }
  }, [member]);

  return null;
};
