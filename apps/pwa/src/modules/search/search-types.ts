import { AppEntity } from "@/types";
import { ProductType } from "../products/products-types";
import { LoanAssetType, LoanPackage, LoanStatus } from "../loans/loans-types";
import { ReceiptType } from "../receipts/receipts-types";

export type SearchEntityResult<T = any> = T & {
  _id: string;
  id?: string;
  _score: number;
  _highlight?: { [key: string]: string[] };
};

export type SearchCustomer = SearchEntityResult<{
  name: string;
  code: string;
  email?: string;
  phone?: string;
  avatar?: string;
  workspaceId: string;
  plainCode?: string;
}>

export type SearchTask = SearchEntityResult<{
  name: string;
  description?: string;
  code: string;
}>

export type SearchProduct = SearchEntityResult<{
  name: string;
  type: ProductType;
  price: number;
  image?: string;
  categoryId?: string;
  unit?: string;
  displayName?: string;
}>

export type SearchLoan = SearchEntityResult<{
  code: string;
  amount: number;
  assetType: LoanAssetType;
  package: LoanPackage;
  status: LoanStatus;
  customerPhone?: string;
  customerName?: string;
  imeil?: string;
}>

export type SearchReceipt = SearchEntityResult<{
  code: string;
  amount: number;
  type: ReceiptType;
  note?: string;
  data?: any;
}>

export type SearchWorkspacePartner = SearchEntityResult<{
  name: string;
  phone: string;
  email?: string;
  logo?: string;
}>

export interface SearchResult {
  [AppEntity.CUSTOMERS]: SearchCustomer[],
  [AppEntity.TASKS]: SearchTask[],
  [AppEntity.PRODUCTS]: SearchProduct[],
  [AppEntity.LOANS]: SearchLoan[],
  [AppEntity.RECEIPTS]: SearchReceipt[],
  [AppEntity.PARTNERS]: SearchWorkspacePartner[],
}