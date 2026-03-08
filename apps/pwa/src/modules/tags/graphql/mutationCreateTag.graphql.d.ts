import type * as Types from '../../../graphql/types.graphql.d';

export type CreateTagMutationVariables = Types.Exact<{
  input: Types.TagInput;
}>;


export type CreateTagMutation = { __typename: 'Mutation', createTag: { __typename: 'Tag', _id: string, name: string, color: string | null, type: Types.TagType, slug: string, order: number } };


import { TypedDocumentNode } from '@apollo/client/core';
export const CreateTagDocument = (import("graphql").DocumentNode) as TypedDocumentNode<CreateTagMutation, CreateTagMutationVariables>;
export default CreateTagDocument 