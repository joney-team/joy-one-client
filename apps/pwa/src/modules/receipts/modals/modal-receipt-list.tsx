import { Empty } from "@/components/empty";
import { Errored } from "@/components/errored";
import { ModalTitle } from "@/components/modal-title";
import { ReceiptCard } from "@/modules/receipts/receipt-card";
import { ButtonViewMore } from "@/components/buttons/button-view-more";
import { useEventsListener } from "@/modules/events/event-service";
import { EventType } from "@/modules/events/event-types";
import { getReceipts } from "@/modules/receipts/receipts-service";
import { ReceiptEntity } from "@/modules/receipts/receipts-types";
import { useList } from "@/components/list/use-list";
import { Center, Skeleton, Stack } from "@mantine/core";
import { modals } from "@mantine/modals";
import { IconClockCheck } from "@tabler/icons-react";
import { FC } from "react";

interface ModalListReceiptsProps {
  query?: any;
  title?: string;
}

export const ModalListReceipts: FC<ModalListReceiptsProps> = (props) => {
  const receipts = useList<ReceiptEntity>({
    fetch: (q) =>
      getReceipts({
        ...q,
        ...props.query,
      }),
  });

  useEventsListener(
    [
      EventType.RECEIPT_NEW,
      EventType.RECEIPT_PAID,
      EventType.RECEIPT_DISBURSEMENT,
      EventType.RECEIPT_ARCHIVED,
    ],
    () => receipts.fetch(true, { isSilient: true })
  );

  const isEmpty = receipts.count === 0 && !receipts.isFetching && !receipts.error;

  return (
    <Stack>
      {receipts.isFetching && <Skeleton height={150} />}
      {receipts.error && <Errored error={receipts.error} />}
      {isEmpty && <Empty />}

      {receipts.data.map((receipt) => (
        <ReceiptCard key={receipt.id} receipt={receipt} />
      ))}

      {receipts.isAbleToLoadMore && (
        <Center>
          <ButtonViewMore onClick={() => receipts.fetch()} />
        </Center>
      )}
    </Stack>
  );
};

export const OnModalListReceipts = (props: ModalListReceiptsProps) => {
  return modals.open({
    modalId: "ModalListReceipts",
    title: <ModalTitle title={props.title || "Danh sách hoá đơn"} icon={IconClockCheck} />,
    children: <ModalListReceipts {...props} />,
  });
};
