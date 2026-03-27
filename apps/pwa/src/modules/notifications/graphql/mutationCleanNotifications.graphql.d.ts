import type * as Types from '../../../graphql/types.graphql.d';

export type CleanNotificationsMutationVariables = Types.Exact<{ [key: string]: never; }>;


export type CleanNotificationsMutation = { __typename: 'Mutation', cleanNotifications: boolean };


import { TypedDocumentNode } from '@apollo/client/core';
export const CleanNotificationsDocument = (import("graphql").DocumentNode) as TypedDocumentNode<CleanNotificationsMutation, CleanNotificationsMutationVariables>;
export default CleanNotificationsDocument 