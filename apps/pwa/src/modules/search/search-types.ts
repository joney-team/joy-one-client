import { AppEntity } from "@/types";
import { CustomerShortInfo } from "../customers/customer-types";
import { LoanAssetType, LoanPackage, LoanStatus } from "../loans/loans-types";
import { ProductEntity } from "../products/products-types";
import { ReceiptType } from "../receipts/receipts-types";
import { TaskEntity } from "../tasks/tasks-types";

export type SearchEntityResult<E extends AppEntity = AppEntity, T = any> = T & {
  _id: string;
  id?: string;
  _score: number;
  _highlight?: { [key: string]: string[] };
  _entity: E;
};

export type SearchCustomer = SearchEntityResult<AppEntity.CUSTOMERS, CustomerShortInfo>;

export type SearchTask = SearchEntityResult<
  AppEntity.TASKS,
  Pick<TaskEntity, "name" | "description" | "code">
>;

export type SearchProduct = SearchEntityResult<
  AppEntity.PRODUCTS,
  Pick<
    ProductEntity,
    | "name"
    | "type"
    | "minPrice"
    | "maxPrice"
    | "unit"
    | "price"
    | "image"
    | "displayName"
    | "categoryId"
  >
>;

export type SearchLoan = SearchEntityResult<
  AppEntity.LOANS,
  {
    code: string;
    amount: number;
    assetType: LoanAssetType;
    package: LoanPackage;
    status: LoanStatus;
    customerPhone?: string;
    customerName?: string;
    imeil?: string;
  }
>;

export type SearchReceipt = SearchEntityResult<
  AppEntity.RECEIPTS,
  {
    code: string;
    amount: number;
    type: ReceiptType;
    note?: string;
    data?: any;
  }
>;

export type SearchWorkspacePartner = SearchEntityResult<
  AppEntity.PARTNERS,
  {
    name: string;
    phone: string;
    email?: string;
    logo?: string;
  }
>;

export interface SearchResult {
  [AppEntity.CUSTOMERS]: SearchCustomer[];
  [AppEntity.TASKS]: SearchTask[];
  [AppEntity.PRODUCTS]: SearchProduct[];
  [AppEntity.LOANS]: SearchLoan[];
  [AppEntity.RECEIPTS]: SearchReceipt[];
  [AppEntity.PARTNERS]: SearchWorkspacePartner[];
}
