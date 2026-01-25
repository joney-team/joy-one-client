"use client";

import { useList } from "@/components/list/use-list";
import { getCustomerKycs } from "@/modules/customer-kycs/customer-kycs-service";
import { CustomerEntity } from "@/modules/customers/customer-types";
import { Skeleton, Stack } from "@mantine/core";
import { FC } from "react";
import { Empty } from "../../../components/empty";
import { CustomerKycCard } from "./customer-kyc-card";

interface CustomerKycProps {
  customer: CustomerEntity;
}

export const CustomerKyc: FC<CustomerKycProps> = (props) => {
  const kyc = useList({
    fetch: () => getCustomerKycs({ customerId: props.customer._id }),
  });

  if (kyc.isFetching) return <Skeleton height={150} />;
  if (kyc.isEmpty) return <Empty />;

  return (
    <Stack maw="100%" w={600}>
      <CustomerKycCard kyc={kyc.data[0]} hideCustomer />
    </Stack>
  );
};
