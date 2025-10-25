import { ReceiptDetail } from "@/modules/receipts/receipt-detail";
import { ModalTitle } from "@/components/modal-title";
import { tl } from "@/modules/lang/lang-service";
import { modals } from "@mantine/modals";
import { IconCashRegister, IconExternalLink } from "@tabler/icons-react";
import { FC } from "react";
import { ActionIcon, Group } from "@mantine/core";
import { zIndexes } from "@joy-one-client/config/layout";

interface ModalPromptProps {
  id: string;
}

export const ReceiptDetailModal: FC<ModalPromptProps> = (props) => {
  return <ReceiptDetail receiptId={props.id} />;
};

export const OnReceiptDetailModal = (props: ModalPromptProps) => {
  return modals.open({
    modalId: "ReceiptDetailModal",
    zIndex: zIndexes.commonModals,
    title: (
      <ModalTitle
        title={tl("receipt")}
        icon={IconCashRegister}
        rightSection={
          <Group>
            <ActionIcon
              variant="subtle"
              color="gray"
              size="sm"
              component="a"
              href={`/receipts/${props.id}`}
              target="_blank"
            >
              <IconExternalLink size={15} />
            </ActionIcon>
          </Group>
        }
      />
    ),
    children: <ReceiptDetailModal {...props} />,
    size: "lg",
  });
};
