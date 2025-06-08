import { AppEntity } from "./general";
import { ProductType } from "./products";
import { ReceiptType } from "./receipts";

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
  [AppEntity.RECEIPTS]: SearchReceipt[],
  [AppEntity.PARTNERS]: SearchWorkspacePartner[],
}