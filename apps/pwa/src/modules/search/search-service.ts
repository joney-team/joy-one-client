import { graphqlClient } from "@/graphql/graphql-client";
import { AppEntity } from "@/types";
import AvailableSearchEntitiesDocument from "./graphql/availableSearchEntities.graphql";
import SearchDocument from "./graphql/search.graphql";
import { SearchEntityResult } from "./search-types";

export async function searchGetAvailableEntities() {
  return graphqlClient
    .query({
      query: AvailableSearchEntitiesDocument,
    })
    .then((result) => result.data?.availableSearchEntities as AppEntity[]);
}

export async function searchEntity<T = SearchEntityResult>(
  entity: AppEntity,
  q: string,
  filter?: any,
) {
  const result = await graphqlClient.query({
    query: SearchDocument,
    variables: {
      query: q,
      entities: [entity],
      filter,
    },
  });

  return result.data?.search as T[];
}

export function removeAccents(str: string): string {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

export function searchArray<T>(
  array: T[],
  fieldsToSearch: (keyof T)[],
  query: string,
  index?: (item: T) => string,
): T[] {
  if (!query || query.length === 0) return array;

  const normalizedQuery = removeAccents(query).toLowerCase();
  const queryWords = normalizedQuery.split(" ").filter((word) => word.trim() !== "");

  return array.filter((item) => {
    if (index) {
      const itemIndex = index(item);
      const normalizedValue = removeAccents(itemIndex).toLowerCase();

      return queryWords.every((word) => normalizedValue.includes(word));
    }

    return fieldsToSearch.some((field) => {
      const fieldValue = item[field];
      if (typeof fieldValue === "string") {
        const normalizedFieldValue = removeAccents(fieldValue).toLowerCase();

        // Kiểm tra từng từ có xuất hiện trong chuỗi nguồn hay không
        return queryWords.every((word) => normalizedFieldValue.includes(word));
      }

      return false;
    });
  });
}
