"use client";

import { Modal } from "@/components/modal/modal";
import { ReceiptDetail } from "@/modules/receipts/receipt-detail";
import { Trans } from "@lingui/react/macro";
import { IconCashRegister } from "@tabler/icons-react";
import { forwardRef, Fragment, ReactNode, useImperativeHandle, useState } from "react";

export interface ModalReceiptDetailRef {
  open: (receiptId: string) => void;
  close: () => void;
}

export const ModalReceiptDetail = forwardRef<
  ModalReceiptDetailRef,
  { children?: (ref: ModalReceiptDetailRef) => ReactNode }
>((props, ref) => {
  const [receiptId, setReceiptId] = useState<string | null>(null);

  useImperativeHandle(ref, () => ({
    open: (id) => {
      setReceiptId(id);
    },
    close: () => {
      setReceiptId(null);
    },
  }));

  return (
    <Fragment>
      {props.children?.({
        open: (id) => {
          setReceiptId(id);
        },
        close: () => {
          setReceiptId(null);
        },
      })}

      <Modal
        name={<Trans>Receipt</Trans>}
        icon={IconCashRegister}
        opened={!!receiptId}
        onClose={() => setReceiptId(null)}
        size="lg"
        isFullscreenOnMobile
      >
        {receiptId && <ReceiptDetail receiptId={receiptId} />}
      </Modal>
    </Fragment>
  );
});
