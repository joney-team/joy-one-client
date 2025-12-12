"use client";

import { Modal } from "@/components/modal/modal";
import { ReceiptDetail } from "@/modules/receipts/receipt-detail";
import { Trans } from "@lingui/react/macro";
import { IconCashRegister } from "@tabler/icons-react";
import { forwardRef, ReactNode, useImperativeHandle, useState } from "react";

// export const ReceiptDetailModal: FC<ModalPromptProps> = (props) => {
//   return <ReceiptDetail receiptId={props.id} />;
// };

// export const OnReceiptDetailModal = (props: ModalPromptProps) => {
//   return modals.open({
//     modalId: "ReceiptDetailModal",
//     zIndex: zIndexes.commonModals,
//     title: (
//       <ModalHead
//         name={t`Receipt`}
//         icon={IconCashRegister}
//         rightSection={
//           <Group>
//             <ActionIcon
//               variant="subtle"
//               color="gray"
//               size="sm"
//               component="a"
//               href={`/receipts/${props.id}`}
//               target="_blank"
//             >
//               <IconExternalLink size={15} />
//             </ActionIcon>
//           </Group>
//         }
//       />
//     ),
//     children: <ReceiptDetailModal {...props} />,
//     size: "lg",
//   });
// };

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
  );
});
