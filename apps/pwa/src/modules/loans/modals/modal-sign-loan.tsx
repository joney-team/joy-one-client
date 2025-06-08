"use client";

import { Button } from "@/components/buttons/button";
import { SignatureInput } from "@/components/inputs/signature-input";
import { ModalTitle } from "@/components/modal-title";
import { onUploadFile } from "@/modules/files/file-service";
import { t } from "@/modules/lang/lang-service";
import { signLoan } from "@/modules/loans/loans-service";
import { LoanEntity } from "@/modules/loans/loans-types";
import { renderEntityCode } from "@/modules/workspaces/utils";
import { onError } from "@/utils/exceptions.utils";
import { Center, Modal, Stack } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconCreditCardPay } from "@tabler/icons-react";
import { FC, useState } from "react";

interface ModalSignLoanProps {
  loan: LoanEntity;
}

export let OnModalSignLoan: (props: ModalSignLoanProps) => void = () => {};

export const ModalSignLoan: FC = () => {
  const [opened, { open, close }] = useDisclosure(false);
  const [props, setProps] = useState<ModalSignLoanProps>();
  const [signature, setSignature] = useState<File>();

  const onClose = async () => close();

  const onSubmit = async () => {
    if (!signature || !props) return;
    try {
      const signatureImage = await onUploadFile({ file: signature });
      await signLoan(props.loan.id, { signature: signatureImage.relativePath });
      onClose();
    } catch (error) {
      onError(error);
    }
  };

  OnModalSignLoan = async (p) => {
    setProps(p);
    open();
  };

  return (
    <Modal
      title={<ModalTitle title={`Ký khoản vay #${renderEntityCode(props?.loan.code)}`} icon={IconCreditCardPay} />}
      onClose={onClose}
      opened={opened}
      size={1000}
    >
      <Stack gap={16}>
        <SignatureInput onChange={setSignature} />

        <Center>
          <Button disabled={!signature} onClick={onSubmit}>
            {t("sign_contract")}
          </Button>
        </Center>
      </Stack>
    </Modal>
  );
};
