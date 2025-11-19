import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { FC, PropsWithChildren } from "react";

export const restQueryClient = new QueryClient();

export const RestQueryProvider: FC<PropsWithChildren> = ({ children }) => {
  return <QueryClientProvider client={restQueryClient}>{children}</QueryClientProvider>;
};
