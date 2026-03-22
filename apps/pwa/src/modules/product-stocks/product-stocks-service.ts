import { ResponseList } from "@/types";
import { Icon, IconArrowDownLeft, IconArrowUpRight } from "@tabler/icons-react";
import { restClient } from "../apis/rest-client";
import { ProductStockEntity, ProductStockRecordEntity } from "./product-stocks-entity";
import {
  MultipleProductsStockInDto,
  ProductStockOutDto,
  ProductStockRecordType,
} from "./product-stocks-types";

export async function getProductStockRecords(query?: any) {
  return restClient.get<ResponseList<ProductStockRecordEntity>>("/product-stocks/records", {
    params: query,
  });
}

export async function getProductStocks(query?: any) {
  return restClient.get<ResponseList<ProductStockEntity>>("/product-stocks", { params: query });
}

export async function multipleProductsStockIn(dto: MultipleProductsStockInDto) {
  return restClient.post("/product-stocks/stock-in/multiple", dto);
}

export async function productStockOut(dto: ProductStockOutDto) {
  return restClient.post("/product-stocks/stock-out", dto);
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
