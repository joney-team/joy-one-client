import { createContext, useContext } from "react";
import type { UseLang } from "./lang-types";

export const Context = createContext<UseLang>({} as UseLang);
export const useLang = () => useContext(Context);