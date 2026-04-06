"use client";

import { Fullscreen } from "@/components/fullscreen";
import { StorageKey } from "@/constants/storage-key";
import { nonLoading } from "@/utils/non-loading";
import { zIndexes } from "@joy-one-client/config/layout";
import { AxiosError } from "axios";
import dynamic from "next/dynamic";
import { useParams } from "next/navigation";
import { Fragment, useEffect, useMemo, type FC } from "react";
import { useAuth } from "../auth/auth-context";
import type { OnModalConnectMetaPages } from "../plugins/meta-pages/modal-connect-meta-pages";
import { WorkspacePermission } from "../workspace-roles/workspace-roles-types";
import { useWorkspace } from "./workspace-context";
import { useApolloClient } from "@apollo/client/react";
import GetMetaPagesInfosDocument from "../plugins/meta-pages/graphql/getMetaPagesInfos.graphql";

const WorkspaceInvitation = dynamic(() => import("./workspace-invitation"), {
  ssr: false,
  loading: nonLoading,
});

const WorkspaceRequire = dynamic(
  () => import("./workspace-require").then((mod) => mod.WorkspaceRequire),
  {
    ssr: false,
    loading: nonLoading,
  },
);

const WorkspaceArchived = dynamic(
  () => import("./components/workspace-archived").then((mod) => mod.WorkspaceArchived),
  {
    ssr: false,
    loading: nonLoading,
  },
);

const WorkspaceRequireBranches = dynamic(
  () =>
    import("./components/workspace-require-branches").then((mod) => mod.WorkspaceRequireBranches),
  {
    ssr: false,
    loading: nonLoading,
  },
);

const ModalConnectMetaPages = dynamic(
  () =>
    import("@/modules/plugins/meta-pages/modal-connect-meta-pages").then(
      (mod) => mod.ModalConnectMetaPages,
    ),
  {
    ssr: false,
    loading: nonLoading,
  },
);

const TriggerConnectMetaPage: FC<{ open: OnModalConnectMetaPages }> = (props) => {
  const { hasPermission } = useWorkspace();
  const client = useApolloClient();

  const onConnectMetaPages = async (accessToken: string) => {
    try {
      const result = await client.query({
        query: GetMetaPagesInfosDocument,
        variables: { accessToken },
        fetchPolicy: "network-only",
      });
      const pages = result.data?.getMetaPagesInfos ?? [];
      const canConnectPages = pages.filter((v) => v.status !== "CONNECTED");
      if (canConnectPages.length > 0) props.open({ pages: canConnectPages, accessToken });
      else localStorage.removeItem(StorageKey.META_ACCESS_TOKEN);
    } catch (error) {
      if (error instanceof AxiosError && error.status === 400) {
        localStorage.removeItem(StorageKey.META_ACCESS_TOKEN);
      } else {
        console.error(error);
      }
    }
  };

  useEffect(() => {
    if (hasPermission(WorkspacePermission.WORKSPACE_SETTINGS)) {
      const accessToken = localStorage.getItem(StorageKey.META_ACCESS_TOKEN);
      if (accessToken) onConnectMetaPages(accessToken);
    }
  }, [hasPermission]);

  return null;
};

export const WorkspaceAuthorization: FC = () => {
  const auth = useAuth();
  const { isInitialized, member, hasPermission } = useWorkspace();
  const params = useParams<{ inviteCode: string }>();

  const isRequireBranches =
    member &&
    member?.workspace.branches > 0 &&
    !member.workspaceBranches.length &&
    !hasPermission(WorkspacePermission.WORKSPACE_BRANCHES_FULL_ACCESS);

  const Component = useMemo(() => {
    if (!isInitialized || !auth.user) return null;
    if (params.inviteCode) return <WorkspaceInvitation inviteCode={params.inviteCode} />;
    if (!member) return <WorkspaceRequire />;
    if (isRequireBranches) return <WorkspaceRequireBranches />;
    if (member.workspace.isArchived) return <WorkspaceArchived />;
  }, [isInitialized, params.inviteCode, member, isRequireBranches, auth.user]);

  return (
    <Fragment>
      {Component && <Fullscreen zIndex={zIndexes.requireWorkspace}>{Component}</Fullscreen>}

      <ModalConnectMetaPages>
        {(open) => <TriggerConnectMetaPage open={open} />}
      </ModalConnectMetaPages>
    </Fragment>
  );
};
