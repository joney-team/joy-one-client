"use client";

import { getGlobal } from "@/global";
import { getLocalStorage } from "@/hooks/use-local-storage";
import { StorageKey } from "@/types";
import {
  ApolloClient,
  CombinedGraphQLErrors,
  HttpLink,
  InMemoryCache,
  Observable,
} from "@apollo/client";
import { SetContextLink } from "@apollo/client/link/context";
import { ApolloProvider as ApolloProviderApollo } from "@apollo/client/react";
import { getAccessToken, retrieveAccessToken } from "../auth/auth-service";
import { getClientLocale } from "../lang/lang-service";
import { ErrorLink } from "@apollo/client/link/error";

let isRefreshing = false;
let pendingRequests: (() => Promise<void>)[] = [];

const addPendingRequest = (resolve: () => Promise<void>) => {
  pendingRequests.push(resolve);
};

const resolvePendingRequests = () => {
  pendingRequests.forEach((resolve) => resolve());
  pendingRequests = [];
};

const errorLink = new ErrorLink(({ error, operation, forward }) => {
  if (CombinedGraphQLErrors.is(error)) {
    const extensions = error.errors[0].extensions;

    if (
      extensions &&
      extensions.originalError &&
      typeof extensions.originalError === "object" &&
      "statusCode" in extensions.originalError
    ) {
      const statusCode = extensions.originalError.statusCode;
      if (statusCode === 401) {
        return new Observable((observer) => {
          if (!isRefreshing) {
            isRefreshing = true;

            retrieveAccessToken()
              .then((newAccessToken) => {
                operation.setContext(({ headers = {} }) => ({
                  headers: {
                    ...headers,
                    authorization: `Bearer ${newAccessToken}`,
                  },
                }));

                resolvePendingRequests();
                isRefreshing = false;
                forward(operation).subscribe(observer);
              })
              .catch((error) => {
                isRefreshing = false;
                observer.error(error);
              });
          } else {
            addPendingRequest(async () => {
              const accessToken = await getAccessToken();
              operation.setContext(({ headers = {} }) => ({
                headers: {
                  ...headers,
                  authorization: `Bearer ${accessToken}`,
                },
              }));
              forward(operation).subscribe(observer);
            });
          }
        });
      }
    }

    console.log(error.errors[0].extensions);
  } else {
    console.error("[Network error]:", error);
  }

  if (error.stack) {
    console.log("error", error, operation);
  }
});

const httpLink = new HttpLink({ uri: "/graphql" });

const authMiddleware = new SetContextLink(async ({ headers }) => {
  const workspaceId = getLocalStorage(StorageKey.WORKSPACE_ID);
  const accessToken = await getAccessToken();
  const deviceId = getLocalStorage(StorageKey.DEVICE_ID);
  const sessionId = getGlobal()._sessionId;
  const locale = getClientLocale();

  return {
    headers: {
      ...headers,
      "X-Workspace-Id": workspaceId,
      "X-Device-Id": deviceId,
      "X-Session-Id": sessionId,
      "Accept-Language": locale,
      Authorization: accessToken ? `Bearer ${accessToken}` : undefined,
    },
  };
});

const client = new ApolloClient({
  link: authMiddleware.concat(errorLink, httpLink),
  cache: new InMemoryCache(),
});

export const ApolloProvider = ({ children }: { children: React.ReactNode }) => {
  return <ApolloProviderApollo client={client}>{children}</ApolloProviderApollo>;
};
