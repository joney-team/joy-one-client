"use client";

import { StorageKey } from "@/constants/storage-key";
import { getGlobal } from "@/global";
import { getLocalStorage } from "@/hooks/use-local-storage";
import {
  ApolloClient,
  CombinedGraphQLErrors,
  HttpLink,
  InMemoryCache,
  Observable,
} from "@apollo/client";
import { SetContextLink } from "@apollo/client/link/context";
import { ErrorLink } from "@apollo/client/link/error";
import axios from "axios";
import { getClientLocale } from "../lang/lang-service";

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

            axios
              .post(`/api/auth/refresh`)
              .then(() => {
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
              forward(operation).subscribe(observer);
            });
          }
        });
      }
    }
  } else {
    console.warn("[Network error]:", error);
  }

  if (error.stack) {
    console.warn("[Apollo Client Error]:", error, operation);
  }
});

const httpLink = new HttpLink({ uri: "/api/graphql" });

const authMiddleware = new SetContextLink(async ({ headers }) => {
  const workspaceId = getLocalStorage(StorageKey.WORKSPACE_ID);
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
    },
  };
});

export const apolloClient = new ApolloClient({
  link: authMiddleware.concat(errorLink, httpLink),
  cache: new InMemoryCache({
    typePolicies: {
      Task: {
        keyFields: ["_id"],
        fields: {
          assigneeUsers: {
            merge: false,
          },
          tags: {
            merge: false,
          },
          timeTrackings: {
            merge: false,
          },
        },
      },
      Query: {
        fields: {
          workspaceMembersOnlineStatus: {
            merge: false,
          },
        },
      },
    },
  }),
});

export type ApolloClientType = typeof apolloClient;
