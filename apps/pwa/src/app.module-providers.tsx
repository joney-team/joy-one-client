"use client";

import { useLang } from "@/modules/lang/lang-context";
import LoansProvider from "@/modules/loans/loans-provider";
import PluginsProvider from "@/modules/plugins/plugins-provider";
import { ReportsProvider } from "@/modules/reports/reports-provider";
import TagsProvider from "@/modules/tags/tags-provider";
import { generateTheme } from "@/modules/theme/generate-theme";
import { zIndexes } from "@joy-one-client/config/layout";
import { MantineProvider } from "@mantine/core";
import { DatesProvider } from "@mantine/dates";
import { ModalsProvider } from "@mantine/modals";
import dynamic from "next/dynamic";
import { FC, PropsWithChildren, useMemo } from "react";
import { useApp } from "./app.context";
import { nonLoading } from "./utils/non-loading";

const AuthRequire = dynamic(
  () => import("./modules/auth/auth-require").then((mod) => mod.AuthRequire),
  {
    ssr: false,
    loading: nonLoading,
  },
);

const WorkspaceAuthorization = dynamic(
  () =>
    import("./modules/workspaces/workspace-authorization").then(
      (mod) => mod.WorkspaceAuthorization,
    ),
  {
    ssr: false,
    loading: nonLoading,
  },
);

const PreloadResource = dynamic(() => import("./components/preload-source"), {
  ssr: false,
  loading: nonLoading,
});

const Notifications = dynamic(
  () => import("@mantine/notifications").then((mod) => mod.Notifications),
  {
    ssr: false,
    loading: nonLoading,
  },
);

const SearchEngine = dynamic(
  () => import("@/modules/search/search-engine").then((mod) => mod.SearchEngine),
  {
    ssr: false,
    loading: nonLoading,
  },
);

const ModalUpgradeVersion = dynamic(
  () => import("@/modals/modal-upgrade-version").then((mod) => mod.ModalUpgradeVersion),
  {
    ssr: false,
    loading: nonLoading,
  },
);

const ModalInstallWebAppTutorial = dynamic(
  () =>
    import("@/modals/modal-install-web-app-tutorial").then((mod) => mod.ModalInstallWebAppTutorial),
  {
    ssr: false,
    loading: nonLoading,
  },
);

const InAppNotification = dynamic(
  () => import("@/modules/notifications/in-app-notification").then((mod) => mod.InAppNotification),
  {
    ssr: false,
    loading: nonLoading,
  },
);

const LayoutWorkspace = dynamic(
  () => import("./layout/layout-workspace").then((mod) => mod.LayoutWorkspace),
  {
    ssr: false,
    loading: nonLoading,
  },
);

const AppModuleProviders: FC<PropsWithChildren> = (props) => {
  const app = useApp();
  const lang = useLang();

  const theme = useMemo(
    () => generateTheme({ metadata: app.metadata, locale: lang.locale }),
    [app.metadata, lang.locale],
  );

  return (
    <MantineProvider theme={theme} defaultColorScheme="auto">
      <DatesProvider settings={{ locale: lang.locale }}>
        <ReportsProvider>
          <TagsProvider>
            <LoansProvider>
              <PluginsProvider>
                <ModalsProvider>
                  {props.children}

                  <LayoutWorkspace />
                  <ModalUpgradeVersion />
                  <ModalInstallWebAppTutorial />
                  <PreloadResource />
                  <SearchEngine />
                  <InAppNotification />
                  <WorkspaceAuthorization />
                  <AuthRequire />
                </ModalsProvider>
              </PluginsProvider>
            </LoansProvider>
          </TagsProvider>
        </ReportsProvider>

        <Notifications position="top-right" zIndex={zIndexes.notifications} />
      </DatesProvider>
    </MantineProvider>
  );
};

export default AppModuleProviders;
