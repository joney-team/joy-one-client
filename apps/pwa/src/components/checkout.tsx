"use client";

import {
  BankTransactionEntity,
  BankTransactionPaymentGateway,
  BankTransactionStatus,
} from "@/modules/bank-transactions/bank-transaction-types";
import { Anchor, Center, em, Stack, Text, Title } from "@mantine/core";
import { FC, useEffect } from "react";
import { Button } from "./buttons/button";
import { Loading } from "./loading";
interface CheckoutProps {
  tx: BankTransactionEntity;
  onBack: () => void;
}

export const Checkout: FC<CheckoutProps> = (props) => {
  const { status } = props.tx;

  useEffect(() => {
    if (
      props.tx.status === BankTransactionStatus.PENDING &&
      props.tx.paymentGateway === BankTransactionPaymentGateway.PAY_OS
    ) {
      window.open(props.tx.paymentData?.checkoutUrl, "_blank");
    }
  }, [props.tx._id, status]);

  useEffect(() => {
    if (status === BankTransactionStatus.CANCELLED) {
      props.onBack();
    }
  }, [status]);

  if (status === BankTransactionStatus.PAID) {
    return (
      <Stack align="center" justify="center" p={16}>
        <Title order={3} c="primary" ta="center" fw={700}>
          JoyOne đã nhận thanh toán
        </Title>
        <Text ta="center">Bạn vui lòng đợi hệ thống trong giây lát.</Text>

        <Center>
          <Loading message="Đang xử lí..." />
        </Center>
      </Stack>
    );
  }

  if (status === BankTransactionStatus.FAILED) {
    return (
      <Stack align="center" justify="center" p={16}>
        <Title order={3} c="primary" ta="center" fw={700}>
          Giao dịch không thành công
        </Title>
        <Text ta="center">Bạn vui lòng thữ lại sau ạ.</Text>

        <Center>
          <Button onClick={props.onBack} variant="outline">
            Quay lại
          </Button>
        </Center>
      </Stack>
    );
  }

  if (props.tx.paymentGateway === BankTransactionPaymentGateway.PAY_OS) {
    return (
      <Stack align="center" justify="center" p={16}>
        <Title order={3} fz={em(20)} c="primary" ta="center" fw={700}>
          Giao dịch đang được thực hiện bởi PayOs
        </Title>
        <Text ta="center">Vui lòng click vào link thanh toán nếu Ứng dụng không tự mở.</Text>

        <Anchor ta="center" href={props.tx.paymentData?.checkoutUrl} target="_blank">
          Mở Link
        </Anchor>
      </Stack>
    );
  }

  return (
    <Stack align="center" justify="center" p={16}>
      <Title order={3} c="primary" ta="center" fw={700}>
        Giao dịch chưa được hỗ trợ
      </Title>
      <Text ta="center">Bạn vui lòng thữ lại sau ạ.</Text>

      <Center>
        <Button onClick={props.onBack} variant="outline">
          Quay lại
        </Button>
      </Center>
    </Stack>
  );
};
