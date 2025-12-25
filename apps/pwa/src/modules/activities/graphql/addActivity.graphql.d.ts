import type * as Types from '../../../graphql/types.graphql.d';

export type AddActivityMutationVariables = Types.Exact<{
  contextType: Types.ActivityContextType;
  contextId: Types.Scalars['String']['input'];
  type: Types.ActivityType;
  content?: Types.InputMaybe<Types.Scalars['String']['input']>;
  parentId?: Types.InputMaybe<Types.Scalars['String']['input']>;
}>;


export type AddActivityMutation = { __typename: 'Mutation', addActivity: { __typename: 'Activity', _id: string } };

declare const Document: import("graphql").DocumentNode; export default Document;