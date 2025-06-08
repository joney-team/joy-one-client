import { ResponseList } from "@/types";
import { ProductComboStatus, UseProductComboDto } from "./product-combos-types";
import { MainRequest } from "../requests/main.request";
import { ProductComboEntity } from "./product-combos-entity";

export async function getProductCombos(query?: any) {
  return MainRequest.get<ResponseList<ProductComboEntity>>(`/product-combos`, query)
}

export async function getProductCombo(id: string) {
  return MainRequest.get<ProductComboEntity>(`/ProductCombos/${id}`)
}

export async function getProductCombosByCustomer(customerId: string) {
  return MainRequest.get<ProductComboEntity[]>(`/ProductCombos/customers/${customerId}`)
}

export async function useProductCombo(id: string, dto: UseProductComboDto) {
  return MainRequest.post<ProductComboEntity>(`/ProductCombos/${id}/use`, dto)
}

export async function revertProductComboHistory(historyId: string) {
  return MainRequest.delete(`/ProductCombos/history/${historyId}`)
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