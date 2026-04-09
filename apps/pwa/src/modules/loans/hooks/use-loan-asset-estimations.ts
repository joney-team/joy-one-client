import { useQuery } from "@apollo/client/react";
import { removeTypeName } from "@joy-one-client/utils/remove-type-name";
import GetLoanAssetEstimationsDocument from "../graphql/getLoanAssetEstimations.graphql";
import SetLoanAssetEstimationsDocument from "../graphql/setLoanAssetEstimations.graphql";
import { LoanAssetEstimation, LoanAssetEstimations } from "../loans-types";

export const useLoanAssetEstimations = () => {
  const { data, loading, client } = useQuery(GetLoanAssetEstimationsDocument);

  const setAssetEstimations = async (data: LoanAssetEstimations) => {
    client.cache.updateQuery({ query: GetLoanAssetEstimationsDocument }, (oldData) => {
      if (!oldData) return oldData;
      return {
        ...oldData,
        assetEstimations: {
          ...oldData.assetEstimations,
          ...data,
        },
      };
    });

    await client.mutate({
      mutation: SetLoanAssetEstimationsDocument,
      variables: {
        input: removeTypeName({
          brands: data.brands,
          colors: data.colors,
          models: data.models,
          estimations: data.estimations,
        }),
      },
    });
  };

  const removeEstimation = async (id: string) => {
    if (!assetEstimations) return;
    setAssetEstimations({
      ...assetEstimations,
      estimations: assetEstimations.estimations.filter((e) => e.id !== id),
    });
  };

  const updateEstimation = async (data: LoanAssetEstimation) => {
    if (!assetEstimations) return;
    setAssetEstimations({
      ...assetEstimations,
      estimations: assetEstimations.estimations.map((e) => (e.id === data.id ? data : e)),
    });
  };

  const assetEstimations: LoanAssetEstimations | undefined = data?.assetEstimations;

  return {
    updateEstimation,
    assetEstimations,
    setAssetEstimations,
    removeEstimation,
    loading: loading && !assetEstimations,
  };
};
