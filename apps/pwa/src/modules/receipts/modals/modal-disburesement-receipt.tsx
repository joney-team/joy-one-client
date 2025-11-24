"use client";

import { Button } from "@/components/buttons/button";
import { ModalTitle } from "@/components/modal-title";
import { FilesBox } from "@/modules/files/files-box";
import { disburseReceipt, getPaymentMethodIcon } from "@/modules/receipts/receipts-service";
import {
  ReceiptEntity,
  ReceiptPaymentMethod,
  ReceiptType,
} from "@/modules/receipts/receipts-types";
import { UserCard } from "@/modules/users/components/user-card";
import { onError } from "@/utils/exceptions.utils";
import { String } from "@/utils/string.utils";
import { t } from "@lingui/core/macro";
import { Group, Stack, Text, em } from "@mantine/core";
import { modals } from "@mantine/modals";
import { IconCheck, IconTag } from "@tabler/icons-react";
import { FC, useState } from "react";
import { receiptPaymentMethods } from "../receipt-constants";
import { AppEntity } from "@/types";
import { Trans } from "@lingui/react/macro";

interface ModalDisburesementReceiptProps {
  receipt: ReceiptEntity;
}

export const ModalDisburesementReceipt: FC<ModalDisburesementReceiptProps> = (props) => {
  const { receipt } = props;
  const [paymentMethod, setPaymentMethod] = useState(ReceiptPaymentMethod.CASH);

  const onSubmit = async () => {
    await disburseReceipt(props.receipt.id, { paymentMethod })
      .then(async () => {
        modals.close("ModalDisburesementReceipt");
      })
      .catch(onError);
  };

  const color = props.receipt.type === ReceiptType.EXPENSE ? "red" : "green";

  return (
    <Stack gap={30}>
      <Text mb={-20} fw={500} fz={em(14)}>
        <Trans>Proposed by</Trans>
      </Text>
      {receipt.cashierUser && (
        <Group>
          <UserCard user={receipt.cashierUser} />
        </Group>
      )}

      <Text mb={-20} fw={500} fz={em(14)}>
        <Trans>Content</Trans>
      </Text>
      {receipt.note ? (
        <Text
          dangerouslySetInnerHTML={{ __html: String.replaceLineBreaksToHTML(receipt.note) }}
          fw={700}
        />
      ) : (
        <Text fz={em(12)}>
          <Trans>No content</Trans>
        </Text>
      )}

      <Text mb={-20} fw={500} fz={em(14)}>
        <Trans>Images / Documents</Trans>
      </Text>
      <Group>
        <FilesBox
          disabled
          refs={[`${AppEntity.RECEIPTS}:${receipt.id}`]}
          filesWrapperProps={{ justify: "end" }}
          empty={
            <Text fz={em(12)}>
              <Trans>No images</Trans>
            </Text>
          }
        />
      </Group>

      <Text mb={-20} fw={500} fz={em(14)}>
        <Trans>Payment Method</Trans>
      </Text>
      <Group gap={10}>
        {Object.values(ReceiptPaymentMethod).map((method) => {
          const Icon = getPaymentMethodIcon(method);

          return (
            <Button
              key={method}
              leftSection={<Icon size={18} />}
              variant={paymentMethod === method ? "filled" : "outline"}
              onClick={() => setPaymentMethod(method)}
              color="dark"
            >
              {receiptPaymentMethods[method].label()}
            </Button>
          );
        })}
      </Group>

      <Button
        onClick={onSubmit}
        leftSection={<IconCheck strokeWidth={1.2} />}
        type="submit"
        color={color}
      >
        <Trans>Approve</Trans>
      </Button>
    </Stack>
  );
};

export const OnModalDisburesementReceipt = (props: ModalDisburesementReceiptProps) => {
  return modals.open({
    modalId: "ModalDisburesementReceipt",
    title: (
      <ModalTitle
        title={<Trans>Approve Receipt</Trans>}
        icon={IconTag}
        color={props.receipt.type === ReceiptType.EXPENSE ? "red" : "primary"}
      />
    ),
    children: <ModalDisburesementReceipt {...props} />,
  });
};
