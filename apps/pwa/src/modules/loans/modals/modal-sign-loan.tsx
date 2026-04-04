"use client";

import { Button } from "@/components/buttons/button";
import { SignatureInput } from "@/components/inputs/signature-input";
import { ModalHead } from "@/components/modal/modal-head";
import { useUploadFile } from "@/modules/files/hooks/use-upload-file";
import { renderEntityCode } from "@/modules/workspaces/utils";
import { onError } from "@/utils/exceptions.utils";
import { useMutation } from "@apollo/client/react";
import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { Center, Modal, Stack } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconCreditCardPay } from "@tabler/icons-react";
import { FC, Fragment, ReactNode, useState } from "react";
import { LoanFragment } from "../graphql/fragmentLoan.graphql";
import SignLoanDocument from "../graphql/signLoan.graphql";

interface ModalSignLoanProps {
  loan: Pick<LoanFragment, "id" | "code">;
}

export const ModalSignLoan: FC<{
  children: (open: (props: ModalSignLoanProps) => void) => ReactNode;
}> = ({ children }) => {
  const [opened, { open, close }] = useDisclosure(false);
  const [props, setProps] = useState<ModalSignLoanProps>();
  const [signature, setSignature] = useState<File>();
  const uploadFile = useUploadFile();

  const [signLoan] = useMutation(SignLoanDocument);

  const onClose = async () => close();

  const onSubmit = async () => {
    if (!signature || !props) return;
    try {
      const signatureImage = await uploadFile(signature);
      await signLoan({
        variables: {
          signLoanId: props.loan.id,
          input: { signature: signatureImage.path },
        },
      });
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
          <ModalHead
            name={t`Sign loan #${renderEntityCode(props?.loan.code)}`}
            icon={IconCreditCardPay}
          />
        }
        onClose={onClose}
        opened={opened}
        size={1000}
      >
        <Stack gap="md">
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
