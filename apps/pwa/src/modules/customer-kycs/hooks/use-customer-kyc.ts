import { useQuery } from "@apollo/client/react";

import QUERY_CUSTOMER_KYC from "../graphql/queryCustomerKyc.graphql";
import { useEventsListener } from "@/modules/events/event-service";
import { EventType } from "@/graphql/enums.graphql";

export const useCustomerKyc = (customerId?: string | null) => {
  const { data, loading, error, refetch } = useQuery(QUERY_CUSTOMER_KYC, {
    variables: { customerId: customerId ?? "" },
    skip: !customerId,
  });

  useEventsListener(
    [EventType.CustomerKycApproved, EventType.CustomerKycRejected, EventType.CustomerKycPending],
    (e) => {
      if (e.ref === data?.customerKyc?._id) {
        refetch();
      }
    },
    [customerId]
  );

  return {
    customerKyc: data?.customerKyc,
    loading,
    error,
  };
};
