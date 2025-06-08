import { Button } from "@/components/buttons/button";
import { Image } from "@/components/image";
import { useLayout } from "@/layout/layout-context";
import { bankTransactionCallback } from "./bank-transaction-service";
import { Center, em, Stack, Title } from "@mantine/core";
import { useSearchParams } from "next/navigation";
import { FC, useEffect } from "react";

export const BankTransactionCallback: FC = () => {
  const viewport = useLayout();
  const searchs = useSearchParams();

  const onClose = () => {
    window.close();
  };

  const callback = async () => {
    await bankTransactionCallback({ paymentLinkId: searchs.get("id") as string }).catch(() => false);
    onClose();
  };

  useEffect(() => {
    callback();
  }, []);

  return (
    <Stack align="center" justify="center" p={16} mih={viewport.height}>
      <Center mb={30}>
        <Image src="/brandname.png" w={100} />
      </Center>
      <Title c="dark" ta="center" fw={400} fz={em(20)}>
        Đang lấy thông tin giao dịch...
      </Title>

      <Center>
        <Button color="dark" onClick={onClose} variant="outline">
          Đóng lại
        </Button>
      </Center>
    </Stack>
  );
};
