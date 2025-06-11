import { ResponseList } from "@/types";
import { api } from "../apis";
import { ProductVoucherEntity, ProductVoucherStatus } from "./product-vouchers-types";

export async function getProductVouchers(query?: any) {
  return api.get<ResponseList<ProductVoucherEntity>>(`/product-vouchers`, { params: query })
}

export const productVoucherStatusColor: { [key in ProductVoucherStatus]: string } = {
  [ProductVoucherStatus.ACTIVE]: 'green',
  [ProductVoucherStatus.INACTIVE]: 'gray',
  [ProductVoucherStatus.EXPIRED]: 'red',
  [ProductVoucherStatus.OUT_OF_AMOUNT]: 'gray',
}