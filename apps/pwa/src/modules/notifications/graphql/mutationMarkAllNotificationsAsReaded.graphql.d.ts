import type * as Types from '../../../graphql/types.graphql.d';

export type MarkAllNotificationsAsReadedMutationVariables = Types.Exact<{ [key: string]: never; }>;


export type MarkAllNotificationsAsReadedMutation = { __typename: 'Mutation', markAllNotificationsAsReaded: boolean };


import { TypedDocumentNode } from '@apollo/client/core';
export const MarkAllNotificationsAsReadedDocument = (import("graphql").DocumentNode) as TypedDocumentNode<MarkAllNotificationsAsReadedMutation, MarkAllNotificationsAsReadedMutationVariables>;
export default MarkAllNotificationsAsReadedDocument 