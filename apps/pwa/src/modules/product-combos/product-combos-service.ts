import { ResponseList } from "@/types";
import { api } from "../apis";
import { ProductComboEntity } from "./product-combos-entity";
import { ProductComboStatus, UseProductComboDto } from "./product-combos-types";

export async function getProductCombos(query?: any) {
  return api.get<ResponseList<ProductComboEntity>>(`/product-combos`, { params: query })
}

export async function getProductCombo(id: string) {
  return api.get<ProductComboEntity>(`/product-combos/${id}`)
}

export async function getProductCombosByCustomer(customerId: string) {
  return api.get<ProductComboEntity[]>(`/product-combos/customers/${customerId}`)
}

export async function useProductCombo(id: string, dto: UseProductComboDto) {
  return api.post<ProductComboEntity>(`/product-combos/${id}/use`, dto)
}

export async function revertProductComboHistory(historyId: string) {
  return api.delete(`/product-combos/history/${historyId}`)
}

export const productComboStatusOptions: {
  [key in ProductComboStatus]: {
    color: string;
  }
} = {
  [ProductComboStatus.ACTIVE]: {
    color: 'green',
  },
  [ProductComboStatus.INACTIVE]: {
    color: 'gray',
  },
  [ProductComboStatus.EXPIRED]: {
    color: 'red',
  },
  [ProductComboStatus.OUT_OF_STOCK]: {
    color: 'gray',
  },
  [ProductComboStatus.SOURCE_UNAVAILABLE]: {
    color: 'red',
  },
}