import { createContext, useContext } from "react";
import { ListContext } from "./types";

export const Context = createContext<ListContext>({} as ListContext);

export function useListContext() {
  return useContext(Context);
}
