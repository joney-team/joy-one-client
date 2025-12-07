import type * as Types from '../../../graphql/types.graphql.d';

export type BulkUpdateTagsMutationVariables = Types.Exact<{
  items: Array<Types.UpdateTagInput>;
}>;


export type BulkUpdateTagsMutation = { __typename: 'Mutation', bulkUpdateTags: Array<{ __typename: 'Tag', _id: string }> };

declare const Document: import("graphql").DocumentNode; export default Document;