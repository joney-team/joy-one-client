"use client";

import { Button } from "@/components/buttons/button";
import { FilesBox } from "@/modules/files/files-box";
import { ModalTitle } from "@/components/modal-title";
import { UserCard } from "@/modules/users/user-card";
import { t } from "@/modules/lang/lang-service";
import { disburseReceipt, getPaymentMethodIcon } from "@/modules/receipts/receipts-service";
import { ReceiptEntity, ReceiptPaymentMethod, ReceiptType } from "@/modules/receipts/receipts-types";
import { onError } from "@/utils/exceptions.utils";
import { StringUtils } from "@/utils/string.utils";
import { Group, Stack, Text, em } from "@mantine/core";
import { modals } from "@mantine/modals";
import { IconCheck, IconTag } from "@tabler/icons-react";
import { FC, useState } from "react";

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
        Đề xuất bởi
      </Text>
      {receipt.cashierUser && (
        <Group>
          <UserCard user={receipt.cashierUser} />
        </Group>
      )}

      <Text mb={-20} fw={500} fz={em(14)}>
        Nội dung
      </Text>
      {receipt.note ? (
        <Text dangerouslySetInnerHTML={{ __html: StringUtils.replaceLineBreaksToHTML(receipt.note) }} fw={700} />
      ) : (
        <Text fz={em(12)}>Không có nội dung</Text>
      )}

      <Text mb={-20} fw={500} fz={em(14)}>
        Hình ảnh / tài liệu
      </Text>
      <Group>
        <FilesBox
          disabled
          query={{ relatedReceiptId: receipt.id }}
          filesWrapperProps={{ justify: "end" }}
          empty={<Text fz={em(12)}>Không có hình ảnh</Text>}
        />
      </Group>

      <Text mb={-20} fw={500} fz={em(14)}>
        Phương thức thanh toán
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
              {t(`payment_method_${method}`)}
            </Button>
          );
        })}
      </Group>

      <Button onClick={onSubmit} leftSection={<IconCheck strokeWidth={1.2} />} type="submit" color={color}>
        Duyệt
      </Button>
    </Stack>
  );
};

export const OnModalDisburesementReceipt = (props: ModalDisburesementReceiptProps) => {
  return modals.open({
    modalId: "ModalDisburesementReceipt",
    title: (
      <ModalTitle
        title="Duyệt hoá đơn"
        icon={IconTag}
        color={props.receipt.type === ReceiptType.EXPENSE ? "red" : "primary"}
      />
    ),
    children: <ModalDisburesementReceipt {...props} />,
  });
};
