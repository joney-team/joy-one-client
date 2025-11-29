"use client";

import { Skeleton, Stack } from "@mantine/core";
import { NextPage } from "next";
import dynamic from "next/dynamic";

const Content = dynamic(
  () => import("@/modules/loans/loan-list-tabs").then((m) => m.LoanListTabs),
  {
    ssr: false,
    loading: () => (
      <Stack p={16}>
        <Skeleton height={500} />
      </Stack>
    ),
  }
);

const Page: NextPage = () => {
  return (
    <Stack>
      <Content />
    </Stack>
  );
};

export default Page;
