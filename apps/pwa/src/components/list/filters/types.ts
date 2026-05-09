import type { BaseData } from "@joy-one/utils/base-data";
import { FC, MouseEventHandler, PropsWithChildren, ReactNode } from "react";
import { TableColumn } from "../types";

export type FilterWrapperProps = {
  active: boolean;
  value?: string;
  onClick?: MouseEventHandler<HTMLElement> | undefined;
  quantity?: number;
  quantityColor?: string;
  onClear?: () => void | undefined;
  selectedContent?: ReactNode;
};

export type FilterWrapper = FC<PropsWithChildren & FilterWrapperProps>;

export type FilterProps<T extends BaseData = any> = {
  column: TableColumn<T>;
  wrapper: FilterWrapper;
};
