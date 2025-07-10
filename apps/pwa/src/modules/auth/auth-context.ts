import { createContext, useContext } from "react";
import { AuthContext } from "./auth-types";

export const Context = createContext<AuthContext>({} as AuthContext);
export const useAuth = () => useContext(Context);
