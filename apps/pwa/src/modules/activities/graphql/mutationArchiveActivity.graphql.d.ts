import type * as Types from '../../../graphql/types.graphql.d';

export type ArchiveActivityMutationVariables = Types.Exact<{
  id: Types.Scalars['String']['input'];
}>;


export type ArchiveActivityMutation = { __typename: 'Mutation', archiveActivity: { __typename: 'Activity', _id: string } };

declare const Document: import("graphql").DocumentNode; export default Document;