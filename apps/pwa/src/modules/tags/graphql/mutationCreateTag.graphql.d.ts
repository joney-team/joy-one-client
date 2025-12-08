import type * as Types from '../../../graphql/types.graphql.d';

export type CreateTagMutationVariables = Types.Exact<{
  input: Types.TagDto;
}>;


export type CreateTagMutation = { __typename: 'Mutation', createTag: { __typename: 'Tag', _id: string, slug: string } };

declare const Document: import("graphql").DocumentNode; export default Document;