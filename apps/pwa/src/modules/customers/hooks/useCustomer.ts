"use client";

import { EventType } from "@/graphql/enums.graphql";
import { useEventsListener } from "@/modules/events/event-service";
import { useQuery } from "@apollo/client/react";
import GetCustomerByCodeDocument from "../graphql/getCustomerByCode.graphql";
import GetCustomerByIdDocument from "../graphql/getCustomerById.graphql";

export const useCustomer = (id: string | null | undefined) => {
  const { data, error, loading, refetch } = useQuery(GetCustomerByIdDocument, {
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
  const { data, error, loading, refetch } = useQuery(GetCustomerByCodeDocument, {
    variables: {
      code: code || "",
    },
    skip: !code,
  });

  useEventsListener([EventType.CustomerUpdated], (e) => {
    if (e.ref !== data?.customer?._id) return;
    refetch();
  });

  return {
    customer: data?.customer,
    error: error,
    loading,
    refetch,
  };
};
