"use client";

import { Errored } from "@/components/errored";
import { useCustomerKyc } from "@/modules/customer-kycs/hooks/use-customer-kyc";
import { Skeleton, Stack } from "@mantine/core";
import { FC } from "react";
import { CustomerDataFragment } from "../graphql/fragmentCustomer.graphql";
import { CustomerKycCard } from "./customer-kyc-card";

interface CustomerKycProps {
  customer: Pick<CustomerDataFragment, "_id">;
}

export const CustomerKyc: FC<CustomerKycProps> = (props) => {
  const { customerKyc, error, loading } = useCustomerKyc(props.customer._id);

  if (loading) return <Skeleton height={150} />;
  if (error) return <Errored error={error} />;
  if (!customerKyc) return null;

  return (
    <Stack maw="100%" w={600}>
      <CustomerKycCard kyc={customerKyc} hideCustomer />
    </Stack>
  );
};
