import type * as Types from '../graphql/types.graphql.d';

export type AppConfigFragment = { __typename: 'AppConfig', name: string, version: string, timeZone: string, UTC: string, workspaceDomainIP: string, metaAppId: string, metaAppScope: Array<string>, metaAppVersion: string, zaloAppId: string };


import { TypedDocumentNode } from '@apollo/client/core';
export const AppConfigDocument = (import("graphql").DocumentNode) as TypedDocumentNode<AppConfigFragment>;
export default AppConfigDocument 