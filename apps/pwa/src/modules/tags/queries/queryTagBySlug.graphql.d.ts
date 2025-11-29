import type * as Types from '../../../graphql/types.graphql.d';

export type TagBySlugQueryVariables = Types.Exact<{
  slug: Types.Scalars['String']['input'];
}>;


export type TagBySlugQuery = { __typename: 'Query', tagBySlug: { __typename: 'TagEntity', _id: string, name: string, color: string | null, type: Types.TagType, slug: string, order: number | null } };

declare const Document: import("graphql").DocumentNode; export default Document;