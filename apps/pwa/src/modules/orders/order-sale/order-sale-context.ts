import { createContext, useContext } from "react";
import { OrderSaleContext } from "./order-sale-types";

export const Context = createContext({} as OrderSaleContext);

export const useOrderSale = () => useContext(Context);
