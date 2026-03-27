import type * as Types from '../../../graphql/types.graphql.d';

export type MarkNotificationAsReadedMutationVariables = Types.Exact<{
  markNotificationAsReadedId: Types.Scalars['String']['input'];
}>;


export type MarkNotificationAsReadedMutation = { __typename: 'Mutation', markNotificationAsReaded: { __typename: 'Notification', _id: string, icon: Types.NotificationIcon | null, title: string, titleParams: any | null, body: string, bodyParams: any | null, route: string | null, image: string | null, type: Types.NotificationType, status: Types.NotificationStatus, createdAt: number | null } };


import { TypedDocumentNode } from '@apollo/client/core';
export const MarkNotificationAsReadedDocument = (import("graphql").DocumentNode) as TypedDocumentNode<MarkNotificationAsReadedMutation, MarkNotificationAsReadedMutationVariables>;
export default MarkNotificationAsReadedDocument 