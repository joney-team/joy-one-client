import type * as Types from '../../../graphql/types.graphql.d';

export type TagsQueryVariables = Types.Exact<{
  type?: Types.InputMaybe<Types.Scalars['String']['input']>;
}>;


export type TagsQuery = { __typename: 'Query', tags: { __typename: 'Tags', count: number, data: Array<{ __typename: 'TagEntity', _id: string, name: string, color: string | null, type: Types.TagType, slug: string, order: number | null }> } };

declare const Document: import("graphql").DocumentNode; export default Document;