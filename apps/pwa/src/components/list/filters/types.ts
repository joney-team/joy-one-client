import { BaseData } from "@/components/list/types";
import { FC, MouseEventHandler, PropsWithChildren } from "react";
import { TableColumn } from "../types";

export type FilterWrapperProps = {
  active: boolean;
  value?: string;
  onClick?: MouseEventHandler<HTMLElement> | undefined;
  quantity?: number;
  quantityColor?: string;
  onClear?: () => void | undefined;
};

export type FilterWrapper = FC<PropsWithChildren & FilterWrapperProps>;

export type FilterProps<T extends BaseData = any> = {
  column: TableColumn<T>;
  wrapper: FilterWrapper;
};
