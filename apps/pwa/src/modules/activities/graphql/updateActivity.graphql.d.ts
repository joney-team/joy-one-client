import type * as Types from '../../../graphql/types.graphql.d';

export type UpdateActivityMutationVariables = Types.Exact<{
  updateActivityId: Types.Scalars['String']['input'];
  content?: Types.InputMaybe<Types.Scalars['String']['input']>;
}>;


export type UpdateActivityMutation = { __typename: 'Mutation', updateActivity: { __typename: 'Activity', _id: string } };

declare const Document: import("graphql").DocumentNode; export default Document;