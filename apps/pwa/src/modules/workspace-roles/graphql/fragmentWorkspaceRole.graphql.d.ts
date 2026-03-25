import type * as Types from '../../../graphql/types.graphql.d';

export type WorkspaceRoleFragment = { __typename: 'WorkspaceRole', _id: string, name: string, description: string | null, color: string | null, permissions: Array<string>, isEditable: boolean };


import { TypedDocumentNode } from '@apollo/client/core';
export const WorkspaceRoleDocument = (import("graphql").DocumentNode) as TypedDocumentNode<WorkspaceRoleFragment>;
export default WorkspaceRoleDocument 