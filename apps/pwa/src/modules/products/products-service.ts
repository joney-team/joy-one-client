import { ResponseList } from "@/types";
import { Icon, IconBox, IconCategory2, IconGiftCard, IconPackage } from "@tabler/icons-react";
import { api } from "../apis";
import { ProductDto, ProductEntity, ProductType, ProductsQuery } from "./products-types";

export async function getProducts(query?: ProductsQuery): Promise<ResponseList<ProductEntity>> {
  return api.get<ResponseList<ProductEntity>>(`/products`, { params: query })
}

export async function getProductByIds(ids: string[]): Promise<ProductEntity[]> {
  return api.get<ProductEntity[]>(`/products/ids`, { params: { ids } })
}

export async function createProduct(dto: ProductDto): Promise<ProductEntity> {
  return api.post<ProductEntity>(`/products`, dto)
}

export async function updateProduct(_id: string, dto: ProductDto) {
  return api.put<ProductEntity>(`/products/${_id}`, dto)
}

export async function getProduct(_id: string): Promise<ProductEntity> {
  return api.get<ProductEntity>(`/products/${_id}`)
}

export async function archiveProduct(_id: string) {
  return api.delete(`/products/${_id}/archive`)
}

export async function interactProduct(_id: string) {
  return api.patch(`/products/${_id}/interact`)
    .catch(() => false)
}

export function getProductIcon(type: ProductType) {
  return {
    [ProductType.PRODUCT]: IconBox,
    [ProductType.SERVICE]: IconCategory2,
    [ProductType.COMBO]: IconPackage,
    [ProductType.VOUCHER]: IconGiftCard,
  }[type]
}

export const productTypeOptions: {
  [key in ProductType]: {
    icon: Icon;
  }
} = {
  [ProductType.PRODUCT]: { icon: IconBox },
  [ProductType.SERVICE]: { icon: IconCategory2 },
  [ProductType.COMBO]: { icon: IconPackage },
  [ProductType.VOUCHER]: { icon: IconGiftCard },
}