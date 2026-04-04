import { useQuery } from "@apollo/client/react";

import { EventType } from "@/graphql/enums.graphql";
import { useEventsListener } from "@/modules/events/event-service";
import GetCustomerKycDocument from "../graphql/getCustomerKyc.graphql";

export const useCustomerKyc = (customerId?: string | null) => {
  const { data, loading, error, refetch } = useQuery(GetCustomerKycDocument, {
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
    [customerId],
  );

  return {
    customerKyc: data?.customerKyc,
    loading,
    error,
  };
};
