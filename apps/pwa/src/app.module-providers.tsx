"use client";

import CameraProvider from "@/components/camera/camera-context";
import OverlayResizing from "@/components/overlay-resizing";
import PreloadResource from "@/components/preload-source";
import { useLayout } from "@/layout/layout-context";
import { LayoutWorkspace } from "@/layout/layout-workspace";
import AuthProvider from "@/modules/auth/auth-provider";
import { useLang } from "@/modules/lang/lang-context";
import LoansProvider from "@/modules/loans/loans-provider";
import PluginsProvider from "@/modules/plugins/plugins-provider";
import { ReportsProvider } from "@/modules/reports/reports-provider";
import { SearchEngine } from "@/modules/search/search-engine";
import TagsProvider from "@/modules/tags/tags-provider";
import { generateTheme } from "@/modules/theme/generate-theme";
import WorkspaceProvider from "@/modules/workspaces/workspace-provider";
import { zIndexes } from "@joy-one-client/config/layout";
import { MantineProvider } from "@mantine/core";
import { DatesProvider } from "@mantine/dates";
import { ModalsProvider } from "@mantine/modals";
import { Notifications } from "@mantine/notifications";
import { FC, PropsWithChildren, Suspense } from "react";
import { useApp } from "./app.context";
import { useRouteRule } from "./hooks/use-router";
import Modals from "./modals";

const AppModuleProviders: FC<PropsWithChildren> = (props) => {
  const app = useApp();
  const lang = useLang();
  const layout = useLayout();
  const routeRule = useRouteRule();

  return (
    <MantineProvider
      theme={generateTheme(app.metadata, layout, lang.locale)}
      defaultColorScheme="auto"
    >
      <DatesProvider settings={{ locale: lang.locale }}>
        <AuthProvider>
          <WorkspaceProvider>
            <ReportsProvider>
              <TagsProvider>
                <LoansProvider>
                  <PluginsProvider>
                    <CameraProvider>
                      <ModalsProvider>
                        {props.children}
                        {lang.isInitialized && (
                          <Suspense>
                            {routeRule.workspace && <LayoutWorkspace />}
                            <Modals />
                            <PreloadResource />
                            <SearchEngine />
                          </Suspense>
                        )}
                      </ModalsProvider>
                    </CameraProvider>
                  </PluginsProvider>
                </LoansProvider>
              </TagsProvider>
            </ReportsProvider>
          </WorkspaceProvider>
        </AuthProvider>

        <OverlayResizing />
        <Notifications position="top-right" zIndex={zIndexes.notifications} />
      </DatesProvider>
    </MantineProvider>
  );
};

export default AppModuleProviders;
