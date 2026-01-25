import type * as Types from '../../../graphql/types.graphql.d';

export type WorkspaceRoleDataFragment = { __typename: 'WorkspaceRole', _id: string, name: string, description: string | null, color: string | null, permissions: Array<string>, isEditable: boolean };


import { TypedDocumentNode } from '@apollo/client/core';
export const WorkspaceRoleDataDocument = (import("graphql").DocumentNode) as TypedDocumentNode<WorkspaceRoleDataFragment>;
export default WorkspaceRoleDataDocument 