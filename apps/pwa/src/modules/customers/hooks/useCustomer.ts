import { useQuery } from "@apollo/client/react";
import QUERY_CUSTOMER from "../graphql/queryCustomer.graphql";
import QUERY_CUSTOMER_BY_CODE from "../graphql/queryCustomerByCode.graphql";
import { useEventsListener } from "@/modules/events/event-service";
import { EventType } from "@/graphql/enums.graphql";

export const useCustomer = (id: string | null | undefined) => {
  const { data, error, loading, refetch } = useQuery(QUERY_CUSTOMER, {
    variables: {
      id: id || "",
    },
    skip: !id,
  });

  useEventsListener([EventType.CustomerUpdated], (e) => {
    if (e.ref !== id) return;
    refetch();
  });

  return {
    customer: data?.customer,
    error,
    loading,
    refetch,
  };
};

export const useCustomerByCode = (code: string | null | undefined) => {
  const { data, error, loading, refetch } = useQuery(QUERY_CUSTOMER_BY_CODE, {
    variables: {
      code: code || "",
    },
    skip: !code,
  });

  useEventsListener([EventType.CustomerUpdated], (e) => {
    if (e.ref !== data?.customerByCode?._id) return;
    refetch();
  });

  return {
    customer: data?.customerByCode,
    error: error,
    loading,
    refetch,
  };
};
