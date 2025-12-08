import type * as Types from '../../../graphql/types.graphql.d';

export type TagDataFragment = { __typename: 'Tag', _id: string, name: string, color: string | null, type: Types.TagType, slug: string, order: number };

declare const Document: import("graphql").DocumentNode; export default Document;