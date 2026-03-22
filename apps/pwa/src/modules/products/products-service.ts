import { ResponseList } from "@/types";
import { restClient } from "../apis/rest-client";
import { ProductDto, ProductEntity } from "./products-types";

export async function getProducts(query?: any): Promise<ResponseList<ProductEntity>> {
  return restClient.get<ResponseList<ProductEntity>>(`/products`, { params: query });
}

export async function getProductByIds(ids: string[]): Promise<ProductEntity[]> {
  return restClient.get<ProductEntity[]>(`/products/ids`, { params: { ids } });
}

export async function createProduct(dto: ProductDto): Promise<ProductEntity> {
  return restClient.post<ProductEntity>(`/products`, dto);
}

export async function updateProduct(_id: string, dto: ProductDto) {
  return restClient.put<ProductEntity>(`/products/${_id}`, dto);
}

export async function getProduct(_id: string): Promise<ProductEntity> {
  return restClient.get<ProductEntity>(`/products/${_id}`);
}

export async function archiveProduct(_id: string) {
  return restClient.delete(`/products/${_id}/archive`);
}

export async function interactProduct(_id: string) {
  return restClient.patch(`/products/${_id}/interact`).catch(() => false);
}
