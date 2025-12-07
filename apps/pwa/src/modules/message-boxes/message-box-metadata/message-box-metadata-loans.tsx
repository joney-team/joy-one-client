"use client";

import { Empty } from "@/components/empty";
import { useList } from "@/components/list/use-list";
import { EventType } from "@/graphql/enums.graphql";
import { LoanCard } from "@/modules/loans/components/loan-card";
import { getLoans } from "@/modules/loans/loans-service";
import { Stack } from "@mantine/core";
import { AccordionItemComponent } from "./message-box-metadata-types";

export const MessageBoxMetadataLoans: AccordionItemComponent = ({ customer }) => {
  const loans = useList({
    fetch: async () => getLoans({ customerId: customer._id }),
    events: [
      EventType.LoansJustCreated,
      EventType.LoansPending,
      EventType.LoansApproved,
      EventType.LoansRejected,
      EventType.LoansUpdated,
      EventType.LoansSynced,
      EventType.LoansFulfilled,
      EventType.LoansCompleted,
      EventType.LoansArchived,
      EventType.LoansLiquidation,
    ],
  });

  return (
    <Stack>
      {loans.isEmpty && <Empty hideBorder />}

      {loans.data?.map((loan) => {
        return (
          <LoanCard
            key={loan.id}
            data={loan}
            cardProps={{
              withBorder: true,
              shadow: "none",
            }}
          />
        );
      })}
    </Stack>
  );
};
