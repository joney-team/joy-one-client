import type * as Types from '../../../graphql/types.graphql.d';

export type UpdateActivityMutationVariables = Types.Exact<{
  id: Types.Scalars['String']['input'];
  content?: Types.InputMaybe<Types.Scalars['String']['input']>;
}>;


export type UpdateActivityMutation = { __typename: 'Mutation', updateActivity: { __typename: 'Activity', _id: string } };


import { TypedDocumentNode } from '@apollo/client/core';
export const UpdateActivityDocument = (import("graphql").DocumentNode) as TypedDocumentNode<UpdateActivityMutation, UpdateActivityMutationVariables>;
export default UpdateActivityDocument 