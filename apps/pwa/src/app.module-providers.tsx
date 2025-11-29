"use client";

import { useLayout } from "@/layout/layout-context";
import AuthProvider from "@/modules/auth/auth-provider";
import { useLang } from "@/modules/lang/lang-context";
import LoansProvider from "@/modules/loans/loans-provider";
import PluginsProvider from "@/modules/plugins/plugins-provider";
import { ReportsProvider } from "@/modules/reports/reports-provider";
import TagsProvider from "@/modules/tags/tags-provider";
import { generateTheme } from "@/modules/theme/generate-theme";
import WorkspaceProvider from "@/modules/workspaces/workspace-provider";
import { zIndexes } from "@joy-one-client/config/layout";
import { MantineProvider } from "@mantine/core";
import { DatesProvider } from "@mantine/dates";
import { ModalsProvider } from "@mantine/modals";
import dynamic from "next/dynamic";
import { FC, Fragment, PropsWithChildren } from "react";
import { useApp } from "./app.context";
import { useRouteRule } from "./hooks/use-router";
import { LayoutWorkspace } from "./layout/layout-workspace";
import { nonLoading } from "./utils/non-loading";

const Modals = dynamic(() => import("./modals"), {
  ssr: false,
  loading: nonLoading,
});

const PreloadResource = dynamic(() => import("./components/preload-source"), {
  ssr: false,
  loading: nonLoading,
});

const Notifications = dynamic(
  () => import("@mantine/notifications").then((mod) => mod.Notifications),
  {
    ssr: false,
    loading: nonLoading,
  }
);

const SearchEngine = dynamic(
  () => import("@/modules/search/search-engine").then((mod) => mod.SearchEngine),
  {
    ssr: false,
    loading: nonLoading,
  }
);

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
                    <ModalsProvider>
                      {props.children}
                      {lang.isInitialized && (
                        <Fragment>
                          {routeRule.workspace && <LayoutWorkspace />}
                          <Modals />
                          <PreloadResource />
                          <SearchEngine />
                        </Fragment>
                      )}
                    </ModalsProvider>
                  </PluginsProvider>
                </LoansProvider>
              </TagsProvider>
            </ReportsProvider>
          </WorkspaceProvider>
        </AuthProvider>

        <Notifications position="top-right" zIndex={zIndexes.notifications} />
      </DatesProvider>
    </MantineProvider>
  );
};

export default AppModuleProviders;
