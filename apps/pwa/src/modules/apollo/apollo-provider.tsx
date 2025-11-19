"use client";

import { getGlobal } from "@/global";
import { getLocalStorage } from "@/hooks/use-local-storage";
import { StorageKey } from "@/types";
import { ApolloClient, ApolloLink, HttpLink, InMemoryCache } from "@apollo/client";
import { ApolloProvider as ApolloProviderApollo } from "@apollo/client/react";
import { getClientLocale } from "../lang/lang-service";

const httpLink = new HttpLink({ uri: "/graphql" });

const authMiddleware = new ApolloLink((operation, forward) => {
  const workspaceId = getLocalStorage(StorageKey.WORKSPACE_ID);
  const accessToken = getLocalStorage(StorageKey.ACCESS_TOKEN);
  const deviceId = getLocalStorage(StorageKey.DEVICE_ID);
  const sessionId = getGlobal()._sessionId;
  const locale = getClientLocale();

  const headers = {
    "X-Workspace-Id": workspaceId,
    Authorization: accessToken ? `Bearer ${accessToken}` : undefined,
    "X-Device-Id": deviceId,
    "X-Session-Id": sessionId,
    "Accept-Language": locale,
  };

  operation.setContext({
    headers: Object.fromEntries(
      Object.entries(headers).filter(([_, value]) => value !== undefined)
    ),
  });

  return forward(operation);
});

const client = new ApolloClient({
  link: httpLink.concat(authMiddleware),
  cache: new InMemoryCache(),
});

export const ApolloProvider = ({ children }: { children: React.ReactNode }) => {
  return <ApolloProviderApollo client={client}>{children}</ApolloProviderApollo>;
};
