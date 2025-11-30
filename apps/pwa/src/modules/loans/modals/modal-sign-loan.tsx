"use client";

import { Button } from "@/components/buttons/button";
import { SignatureInput } from "@/components/inputs/signature-input";
import { ModalTitle } from "@/components/modal-title";
import { useUploadFile } from "@/modules/files/hooks/use-upload-file";
import { signLoan } from "@/modules/loans/loans-service";
import { LoanEntity } from "@/modules/loans/loans-types";
import { renderEntityCode } from "@/modules/workspaces/utils";
import { onError } from "@/utils/exceptions.utils";
import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { Center, Modal, Stack } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconCreditCardPay } from "@tabler/icons-react";
import { FC, Fragment, ReactNode, useState } from "react";

interface ModalSignLoanProps {
  loan: LoanEntity;
}

export const ModalSignLoan: FC<{
  children: (open: (props: ModalSignLoanProps) => void) => ReactNode;
}> = ({ children }) => {
  const [opened, { open, close }] = useDisclosure(false);
  const [props, setProps] = useState<ModalSignLoanProps>();
  const [signature, setSignature] = useState<File>();
  const uploadFile = useUploadFile();

  const onClose = async () => close();

  const onSubmit = async () => {
    if (!signature || !props) return;
    try {
      const signatureImage = await uploadFile(signature);
      await signLoan(props.loan.id, { signature: signatureImage.path });
      onClose();
    } catch (error) {
      onError(error);
    }
  };

  return (
    <Fragment>
      {children((p) => {
        setProps(p);
        open();
      })}

      <Modal
        title={
          <ModalTitle
            title={t`Sign loan #${renderEntityCode(props?.loan.code)}`}
            icon={IconCreditCardPay}
          />
        }
        onClose={onClose}
        opened={opened}
        size={1000}
      >
        <Stack gap={16}>
          <SignatureInput onChange={setSignature} />

          <Center>
            <Button disabled={!signature} onClick={onSubmit}>
              <Trans>Sign contract</Trans>
            </Button>
          </Center>
        </Stack>
      </Modal>
    </Fragment>
  );
};
