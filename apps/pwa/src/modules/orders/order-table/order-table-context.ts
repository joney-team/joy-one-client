import { createContext, useContext } from "react";
import { OrderTableContext } from "./order-table-types";

export const Context = createContext({} as OrderTableContext);
export const useOrderTable = () => useContext(Context);
