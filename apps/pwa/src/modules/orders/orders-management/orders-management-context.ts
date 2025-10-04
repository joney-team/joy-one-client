import { createContext, useContext } from "react";
import { OrdersManagementContext } from "./orders-management-types";

export const Context = createContext({} as OrdersManagementContext);

export const userOrdersManagement = () => useContext(Context);
