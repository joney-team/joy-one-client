import { ResponseList } from "@/types";
import { apiClient } from "../apis";
import { ProductDto, ProductEntity } from "./products-types";

export async function getProducts(query?: any): Promise<ResponseList<ProductEntity>> {
  return apiClient.get<ResponseList<ProductEntity>>(`/products`, { params: query });
}

export async function getProductByIds(ids: string[]): Promise<ProductEntity[]> {
  return apiClient.get<ProductEntity[]>(`/products/ids`, { params: { ids } });
}

export async function createProduct(dto: ProductDto): Promise<ProductEntity> {
  return apiClient.post<ProductEntity>(`/products`, dto);
}

export async function updateProduct(_id: string, dto: ProductDto) {
  return apiClient.put<ProductEntity>(`/products/${_id}`, dto);
}

export async function getProduct(_id: string): Promise<ProductEntity> {
  return apiClient.get<ProductEntity>(`/products/${_id}`);
}

export async function archiveProduct(_id: string) {
  return apiClient.delete(`/products/${_id}/archive`);
}

export async function interactProduct(_id: string) {
  return apiClient.patch(`/products/${_id}/interact`).catch(() => false);
}
