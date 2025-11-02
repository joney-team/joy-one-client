import { BaseData } from "@/components/list/types";
import { FC, MouseEventHandler, PropsWithChildren } from "react";
import { ListContext, TableColumn } from "../types";

export type FilterWrapperProps = FC<
  PropsWithChildren & {
    active: boolean;
    value?: string;
    onClick?: MouseEventHandler<HTMLElement> | undefined;
    quantity?: number;
    quantityColor?: string;
    onClear?: () => void | undefined;
  }
>;

export type FilterProps<Config, T extends BaseData = any> = ListContext<T> & {
  column: TableColumn<T>;
  Wrapper: FilterWrapperProps;
  config: Config;
  isReadonly: boolean;
};
