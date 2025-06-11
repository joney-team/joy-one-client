"use client";

import { Stack } from "@mantine/core";
import { NextPage } from "next";
import { lazy, Suspense } from "react";

const Content = lazy(() =>
  import("@/modules/loans/loan-list-tabs").then((m) => ({ default: m.LoanListTabs }))
);

const Page: NextPage = () => {
  return (
    <Stack>
      <Suspense>
        <Content />
      </Suspense>
    </Stack>
  );
};

export default Page;
