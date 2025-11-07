import { useList } from "@/components/list/use-list";
import { AccordionItemComponent } from "./message-box-metadata-types";
import { getLoans } from "@/modules/loans/loans-service";
import { EventType } from "@/modules/events/event-types";
import { Stack } from "@mantine/core";
import { Empty } from "@/components/empty";
import { LoanCard } from "@/modules/loans/components/loan-card";

export const MessageBoxMetadataLoans: AccordionItemComponent = ({ customer }) => {
  const loans = useList({
    fetch: async () => getLoans({ customerId: customer._id }),
    events: [
      EventType.LOANS_JUST_CREATED,
      EventType.LOANS_PENDING,
      EventType.LOANS_APPROVED,
      EventType.LOANS_REJECTED,
      EventType.LOANS_UPDATED,
      EventType.LOANS_SYNCED,
      EventType.LOANS_FULFILLED,
      EventType.LOANS_COMPLETED,
      EventType.LOANS_ARCHIVED,
      EventType.LOANS_LIQUIDATION,
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
