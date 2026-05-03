"use client";

import { StorageKey } from "@/constants/storage-key";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { onError } from "@/utils/exceptions.utils";
import { useApolloClient } from "@apollo/client/react";
import { AxiosError } from "axios";
import { type FC, useEffect, useRef } from "react";
import GetMetaPagesInfosDocument from "./graphql/getMetaPagesInfos.graphql";
import { ModalConnectMetaPages, ModalConnectMetaPagesRef } from "./modal-connect-meta-pages";
import { WorkspacePermission } from "@/modules/workspace-roles/workspace-roles-types";

export const TriggerConnectMetaPage: FC = () => {
  const { hasPermission } = useWorkspace();
  const client = useApolloClient();
  const modalRef = useRef<ModalConnectMetaPagesRef>(null);

  const onConnectMetaPages = async (accessToken: string) => {
    try {
      const result = await client.query({
        query: GetMetaPagesInfosDocument,
        variables: { accessToken },
        fetchPolicy: "network-only",
      });
      const pages = result.data?.getMetaPagesInfos ?? [];
      const canConnectPages = pages.filter((v) => v.status !== "CONNECTED");
      if (canConnectPages.length > 0) modalRef.current?.open({ pages: canConnectPages, accessToken });
      else localStorage.removeItem(StorageKey.META_ACCESS_TOKEN);
    } catch (error) {
      if (error instanceof AxiosError && error.status === 400) {
        localStorage.removeItem(StorageKey.META_ACCESS_TOKEN);
      } else {
        onError(error);
      }
    }
  };

  useEffect(() => {
    if (hasPermission(WorkspacePermission.WORKSPACE_SETTINGS)) {
      const accessToken = localStorage.getItem(StorageKey.META_ACCESS_TOKEN);
      if (accessToken) onConnectMetaPages(accessToken);
    }
  }, [hasPermission]);

  return <ModalConnectMetaPages ref={modalRef} />;
};
