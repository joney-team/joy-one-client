import { ResponseList } from "@/types";
import { restClient } from "../apis/rest-client";
import { ProductVoucherEntity, ProductVoucherStatus } from "./product-vouchers-types";

export async function getProductVouchers(query?: any) {
  return restClient.get<ResponseList<ProductVoucherEntity>>(`/product-vouchers`, { params: query });
}

export const productVoucherStatusColor: { [key in ProductVoucherStatus]: string } = {
  [ProductVoucherStatus.ACTIVE]: "green",
  [ProductVoucherStatus.INACTIVE]: "gray",
  [ProductVoucherStatus.EXPIRED]: "red",
  [ProductVoucherStatus.OUT_OF_AMOUNT]: "gray",
};
