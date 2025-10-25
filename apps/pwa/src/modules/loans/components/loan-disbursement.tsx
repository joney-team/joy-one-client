"use client";

import { Button } from "@/components/buttons/button";
import { Checkbox } from "@/components/checkbox";
import { DocumentsIllustration } from "@/components/illustrations/documents";
import { Image } from "@/components/image";
import { Loading } from "@/components/loading";
import { api } from "@/modules/apis";
import { CustomerKycEntity } from "@/modules/customer-kycs/customer-kycs-types";
import { onUploadFiles } from "@/modules/files/file-service";
import { FilesBox } from "@/modules/files/files-box";
import { num } from "@/modules/lang/lang-service";
import { fulfillLoan } from "@/modules/loans/loans-service";
import { LoanEntity, LoanReceiptData, LoanStatus } from "@/modules/loans/loans-types";
import { getStaticQrCode, useBanks } from "@/modules/plugins/banks/banks.services";
import { BankAccount } from "@/modules/plugins/banks/banks.types";
import { ReceiptCard } from "@/modules/receipts/receipt-card";
import { receiptPaymentMethods } from "@/modules/receipts/receipt-constants";
import { getPaymentMethodIcon, getReceipts } from "@/modules/receipts/receipts-service";
import { ReceiptPaymentMethod, ReceiptType } from "@/modules/receipts/receipts-types";
import { useColor } from "@/modules/theme/use-color";
import { WorkspacePermission } from "@/modules/workspace-roles/workspace-roles-types";
import { renderEntityCode } from "@/modules/workspaces/utils";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { DateTime } from "@/utils/date-time.utils";
import { onError } from "@/utils/exceptions.utils";
import { String } from "@/utils/string.utils";
import { useFetch } from "@/utils/use-fetch.util";
import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import {
  Blockquote,
  Card,
  Center,
  Divider,
  em,
  Group,
  InputWrapper,
  Loader,
  Stack,
  Text,
} from "@mantine/core";
import { DateTimePicker } from "@mantine/dates";
import { FC, Fragment, useState } from "react";
import { LoanRowInfo } from "./loan-row-info";

interface LoanDisburesementProps {
  loan: LoanEntity;
  kyc: CustomerKycEntity;
  onDisbursed?: () => Promise<void>;
}

export const LoanDisburesement: FC<LoanDisburesementProps> = (props) => {
  const color = useColor();
  const workspace = useWorkspace();
  const banks = useBanks();

  const { loan } = props;
  const [paymentMethod, setPaymentMethod] = useState<ReceiptPaymentMethod>(
    ReceiptPaymentMethod.BANK_TRANSFER
  );
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isCustomFulfilledAt, setIsCustomFulfilledAt] = useState(false);
  const [fulfilledAt, setFulfilledAt] = useState<number | null>(DateTime.timeToSeconds());

  const disbursementReceiptResponse = useFetch({
    fetch: () =>
      getReceipts<LoanReceiptData>({
        relatedLoanId: loan.id,
        type: [ReceiptType.EXPENSE],
      }).then((res) => res.data[0]),
  });

  const disbursementReceipt = disbursementReceiptResponse.data;

  const onRevertApproval = async () => {
    await api.post(`/loans/${loan.id}/revert-approve`);
  };

  const onSubmit = async () => {
    if (!props) return;
    setIsSubmitting(true);

    try {
      if (files.length === 0) throw new Error("Vui lòng chọn file");
      const _files = await onUploadFiles(files.map((f) => ({ file: f }))).catch(console.error);
      if (!Array.isArray(_files) || _files.length === 0) throw new Error("Vui lòng chọn file");

      await fulfillLoan(loan.id, {
        receiptFileIds: _files.map((v) => v._id),
        paymentMethod,
        fulfilledAt: isCustomFulfilledAt ? fulfilledAt : null,
      });
      await props.onDisbursed?.();
    } catch (error) {
      onError(error);
    }

    setIsSubmitting(false);
  };

  if (loan.status !== LoanStatus.APPROVED) {
    if (disbursementReceipt) {
      return (
        <Card shadow="xs">
          <Stack>
            <Text c={color("primary")} fw={500} fz={em(18)} ta="center">
              Hoá đơn giải ngân
            </Text>

            <ReceiptCard
              receipt={disbursementReceipt}
              cardProps={{ withBorder: false, shadow: "none", p: 0 }}
              hideCustomer
              hideRelatedUsers
              isShowImage
            />
          </Stack>
        </Card>
      );
    }

    return <Loading message="Đang tải dữ liệu hoá đơn..." />;
  }

  if (!workspace.hasPermission(WorkspacePermission.LOANS_FULFILL)) {
    return (
      <Card shadow="xs">
        <Stack align="center" py={30}>
          <DocumentsIllustration width={150} />
          <Loader color="gray.5" size="xs" type="dots" />
          <Text c="gray.5" ta="center">
            <Trans>Waiting for disbursement</Trans>
          </Text>
        </Stack>
      </Card>
    );
  }

  return (
    <Stack align="center">
      <Card shadow="xs" maw="100%" w={700}>
        <Stack>
          <Text fw={500} fz={em(14)} mb={-8} ta="center">
            <Trans>Payment method</Trans>
          </Text>

          <Group gap={10} justify="center">
            {[ReceiptPaymentMethod.BANK_TRANSFER, ReceiptPaymentMethod.CASH].map((method) => {
              const Icon = getPaymentMethodIcon(method);

              return (
                <Button
                  key={method}
                  leftSection={<Icon size={18} />}
                  variant={paymentMethod === method ? "outline" : "subtle"}
                  size="sm"
                  color="blue"
                  onClick={() => setPaymentMethod(method)}
                >
                  {receiptPaymentMethods[method].label()}
                </Button>
              );
            })}
          </Group>

          <Card withBorder shadow="none" p={16}>
            <Stack>
              <LoanRowInfo
                label={t`Loan amount`}
                value={num(loan.amount, { type: "money" })}
                copy
              />

              {(function () {
                const payment = loan.payment;
                const bank = banks.find((bank) => bank.id === +(payment?.accountBankId || "-1"));

                if (
                  paymentMethod === ReceiptPaymentMethod.BANK_TRANSFER &&
                  !payment?.accountNumber
                ) {
                  return (
                    <Blockquote color="orange" p={10}>
                      <Trans>Loan application does not have bank account information</Trans>
                    </Blockquote>
                  );
                }

                if (
                  !bank ||
                  !payment ||
                  !payment.accountNumber ||
                  paymentMethod !== ReceiptPaymentMethod.BANK_TRANSFER
                )
                  return null;

                const bankAccount: BankAccount = {
                  accountName: payment.accountName,
                  accountNumber: payment.accountNumber,
                  bankId: bank.id,
                };

                const kyc = props.kyc.versions[props.kyc.versions.length - 1];
                const description = `${String.removeAccents(kyc.cidFullName).replace(/ /g, "")} ${
                  kyc.cidNumber
                } ${renderEntityCode(loan.code)}`;

                const qrCode = getStaticQrCode(bank, bankAccount, {
                  amount: loan.amount,
                  description,
                });

                return (
                  <Fragment>
                    <LoanRowInfo
                      label={t`Bank account name`}
                      value={loan.payment.accountName}
                      copy
                    />
                    <LoanRowInfo
                      label={t`Bank account number`}
                      value={loan.payment.accountNumber}
                      copy
                    />
                    <LoanRowInfo label={t`Bank name`} value={bank.shortName} copy />
                    <LoanRowInfo label={t`Bank transaction content`} value={description} copy />

                    {loan.status === LoanStatus.APPROVED && !!qrCode && (
                      <Fragment>
                        <Divider />
                        <Image showLoading src={qrCode.url} w={250} maw="100%" my={16} />
                      </Fragment>
                    )}
                  </Fragment>
                );
              })()}

              <InputWrapper
                label={t`Receipts images`}
                withAsterisk
                styles={{
                  label: {
                    fontWeight: 700,
                    fontSize: em(15),
                  },
                }}
              >
                <FilesBox rawFiles={files} onChangeRawFiles={setFiles} />
              </InputWrapper>

              {workspace.hasPermission(WorkspacePermission.LOANS_CUSTOM_FULFILLED_AT) && (
                <Stack gap={4}>
                  <Center>
                    <Checkbox
                      label={t`Custom fulfilled at`}
                      checked={isCustomFulfilledAt}
                      onChange={() => setIsCustomFulfilledAt(!isCustomFulfilledAt)}
                    />
                  </Center>

                  {isCustomFulfilledAt && (
                    <DateTimePicker
                      label={t`Fulfilled at`}
                      value={fulfilledAt ? new Date(fulfilledAt * 1000) : null}
                      onChange={(d) => setFulfilledAt(DateTime.timeToSeconds(d))}
                    />
                  )}
                </Stack>
              )}
            </Stack>
          </Card>
        </Stack>
      </Card>

      <Group justify="center">
        {workspace.hasPermission(WorkspacePermission.LOANS_APPROVED_REVERTED) && (
          <Button variant="outline" color="gray" onClick={onRevertApproval} disabled={isSubmitting}>
            {t`Revert approval`}
          </Button>
        )}

        <Button type="submit" onClick={onSubmit} miw={200} loading={isSubmitting}>
          {t`Loan disbursement`}
        </Button>
      </Group>
    </Stack>
  );
};
