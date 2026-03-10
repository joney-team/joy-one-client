import { AppEntity } from "@/types";
import { apiClient } from "../apis";
import { SearchEntityResult, SearchResult } from "./search-types";

export async function search(q: string) {
  return apiClient.get<SearchResult>("/search", { params: { q } });
}

export async function searchGetAvailableEntities() {
  return apiClient.get<AppEntity[]>("/search/available-entities");
}

export async function searchEntity<T = SearchEntityResult>(
  entity: AppEntity,
  q: string,
  filter?: any
) {
  return apiClient.get<T[]>(`/search/entities/${entity}`, { params: { q, ...filter } });
}

export function removeAccents(str: string): string {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

export function searchArray<T>(
  array: T[],
  fieldsToSearch: (keyof T)[],
  query: string,
  index?: (item: T) => string
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
