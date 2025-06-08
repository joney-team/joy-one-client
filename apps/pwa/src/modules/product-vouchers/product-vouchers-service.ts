import { ResponseList } from "@/types";
import { MainRequest } from "../requests/main.request";
import { ProductVoucherEntity, ProductVoucherStatus } from "./product-vouchers-types";

export async function getProductVouchers(query?: any) {
  return MainRequest.get<ResponseList<ProductVoucherEntity>>(`/product-vouchers`, query)
}

export const productVoucherStatusColor: { [key in ProductVoucherStatus]: string } = {
  [ProductVoucherStatus.ACTIVE]: 'green',
  [ProductVoucherStatus.INACTIVE]: 'gray',
  [ProductVoucherStatus.EXPIRED]: 'red',
  [ProductVoucherStatus.OUT_OF_AMOUNT]: 'gray',
}