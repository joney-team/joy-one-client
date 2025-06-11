import { ResponseList } from "@/types";
import { useEffect, useState } from "react";
import { api } from "../apis";
import { useEventsListener } from "../events/event-service";
import { EventType } from "../events/event-types";
import { ProductCategoryDto, ProductCategoryEntity } from "./product-category-types";

export async function createProductCategory(dto: ProductCategoryDto) {
  return api.post<ProductCategoryEntity>(`/product-categories`, dto);
}

export async function updateProductCategory(id: string, dto: ProductCategoryDto) {
  return api.put<ProductCategoryEntity>(`/product-categories/${id}`, dto);
}

export async function removeProductCategory(id: string) {
  return api.delete(`/product-categories/${id}`);
}

export async function getProductCategories(query?: any) {
  return api.get<ResponseList<ProductCategoryEntity>>(`/product-categories`, { params: query });
}

let cached: ProductCategoryEntity[] = [];

export const useCategories = () => {
  const [categories, setCategories] = useState<ProductCategoryEntity[]>(cached);

  const fetch = async () => [
    await getProductCategories()
      .then((res) => {
        cached = res.data;
        setCategories(res.data);
      })
      .catch(() => false)
  ]

  useEventsListener([
    EventType.PRODUCT_CATEGORIES_NEW,
    EventType.PRODUCT_CATEGORIES_REMOVED,
    EventType.PRODUCT_CATEGORIES_UPDATED,
  ], () => fetch())

  useEffect(() => {
    fetch();
  }, [])

  return [categories, fetch] as const;
}