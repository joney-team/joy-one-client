import type * as Types from '../../../graphql/types.graphql.d';

export type WorkspaceRolesQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type WorkspaceRolesQuery = { __typename: 'Query', workspaceRoles: Array<{ __typename: 'WorkspaceRole', _id: string, name: string, description: string | null, color: string | null, permissions: Array<string>, isEditable: boolean }> };


import { TypedDocumentNode } from '@apollo/client/core';
export const WorkspaceRolesDocument = (import("graphql").DocumentNode) as TypedDocumentNode<WorkspaceRolesQuery, WorkspaceRolesQueryVariables>;
export default WorkspaceRolesDocument 