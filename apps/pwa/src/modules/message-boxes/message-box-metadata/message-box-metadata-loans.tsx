"use client";

import { Empty } from "@/components/empty";
import { EventType } from "@/graphql/enums.graphql";
import { useEventsListener } from "@/modules/events/event-service";
import { LoanCard } from "@/modules/loans/components/loan-card";
import GetLoansDocument from "@/modules/loans/graphql/getLoans.graphql";
import { useQuery } from "@apollo/client/react";
import { Stack } from "@mantine/core";
import { AccordionItemComponent } from "./message-box-metadata-types";

export const MessageBoxMetadataLoans: AccordionItemComponent = ({ customer }) => {
  const { data: loansData, refetch: refetchLoans } = useQuery(GetLoansDocument, {
    variables: {
      query: {
        customerId: customer._id,
      },
    },
  });

  useEventsListener(
    [
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
    () => {
      refetchLoans();
    },
  );

  const isEmpty = loansData && loansData?.list.results.length === 0;

  return (
    <Stack>
      {isEmpty && <Empty hideBorder />}

      {loansData?.list.results?.map((loan) => {
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
