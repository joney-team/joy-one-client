import { FC, MouseEventHandler, PropsWithChildren } from "react"
import { ListContext, Column } from "../types"

export type FilterWrapperProps = FC<PropsWithChildren & {
  value?: string,
  onClick?: MouseEventHandler<HTMLElement> | undefined,
  quantity?: number,
  quantityColor?: string,
  onClear?: MouseEventHandler<HTMLElement> | undefined,
  active?: boolean,
}>

export type FilterProps<Config> = ListContext & {
  colKey: string,
  column: Column<any, any>,
  Wrapper: FilterWrapperProps,
  config: Config,
}