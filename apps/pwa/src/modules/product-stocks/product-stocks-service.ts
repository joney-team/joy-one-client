import { ResponseList } from "@/types";
import { Icon, IconArrowDownLeft, IconArrowUpRight } from "@tabler/icons-react";
import { apiClient } from "../apis";
import { ProductStockEntity, ProductStockRecordEntity } from "./product-stocks-entity";
import {
  MultipleProductsStockInDto,
  ProductStockOutDto,
  ProductStockRecordType,
} from "./product-stocks-types";

export async function getProductStockRecords(query?: any) {
  return apiClient.get<ResponseList<ProductStockRecordEntity>>("/product-stocks/records", {
    params: query,
  });
}

export async function getProductStocks(query?: any) {
  return apiClient.get<ResponseList<ProductStockEntity>>("/product-stocks", { params: query });
}

export async function multipleProductsStockIn(dto: MultipleProductsStockInDto) {
  return apiClient.post("/product-stocks/stock-in/multiple", dto);
}

export async function productStockOut(dto: ProductStockOutDto) {
  return apiClient.post("/product-stocks/stock-out", dto);
}

export const productStockRecordTypeOptions: {
  [key in ProductStockRecordType]: {
    color: string;
    icon: Icon;
  };
} = {
  [ProductStockRecordType.STOCK_IN]: {
    color: "primary",
    icon: IconArrowDownLeft,
  },
  [ProductStockRecordType.STOCK_OUT]: {
    color: "red",
    icon: IconArrowUpRight,
  },
};
