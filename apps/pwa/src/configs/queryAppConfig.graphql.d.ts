import type * as Types from '../graphql/types.graphql.d';

export type AppConfigQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type AppConfigQuery = { __typename: 'Query', appConfig: { __typename: 'AppConfig', name: string, version: string, timeZone: string, UTC: string, workspaceDomainIP: string, metaAppId: string, metaAppScope: Array<string>, metaAppVersion: string, zaloAppId: string, firebase: { __typename: 'FirebaseClientConfig', appId: string } } };


import { TypedDocumentNode } from '@apollo/client/core';
export const AppConfigDocument = (import("graphql").DocumentNode) as TypedDocumentNode<AppConfigQuery, AppConfigQueryVariables>;
export default AppConfigDocument 