import { createContext, useContext } from "react";
import type { LangContext } from "./lang-types";

export const Context = createContext<LangContext>({} as LangContext);
export const useLang = () => useContext(Context);