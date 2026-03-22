import { OperationVariables, TypedDocumentNode } from "@apollo/client";
import { useLazyQuery } from "@apollo/client/react";
import { DocumentNode } from "graphql";
import { useEffect } from "react";

export const useVariablesQuery = <
  TData = unknown,
  TVariables extends OperationVariables = OperationVariables,
>(
  query: DocumentNode | TypedDocumentNode<TData, TVariables>,
  variables: TVariables,
  options?: useLazyQuery.Options<NoInfer<TData>, NoInfer<TVariables>>,
) => {
  const [fetch, result] = useLazyQuery<TData, TVariables>(query, options);

  useEffect(() => {
    fetch({ variables });
  }, [variables]);

  return result;
};
