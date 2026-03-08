"use client";

import { Button } from "@/components/buttons/button";
import { Checkbox } from "@/components/checkbox";
import { CurrencyFormat } from "@/components/format/currency-format";
import { DocumentsIllustration } from "@/components/illustrations/documents";
import { Image } from "@/components/image";
import { Loading } from "@/components/loading";
import { LoanStatus, ReceiptPaymentMethod, ReceiptType } from "@/graphql/enums.graphql";
import { PluginBankAccount } from "@/graphql/types.graphql";
import { api } from "@/modules/apis";
import { CustomerKycDataFragment } from "@/modules/customer-kycs/graphql/fragmentCustomerKyc.graphql";
import { FilesBox } from "@/modules/files/files-box";
import { useUploadFile } from "@/modules/files/hooks/use-upload-file";
import { getStaticQrCode, useBanks } from "@/modules/plugins/banks/banks.services";
import QUERY_RECEIPTS from "@/modules/receipts/graphql/queryReceipts.graphql";
import { ReceiptCard } from "@/modules/receipts/receipt-card";
import { receiptPaymentMethods } from "@/modules/receipts/receipt-constants";
import { useColor } from "@/modules/theme/use-color";
import { WorkspacePermission } from "@/modules/workspace-roles/workspace-roles-types";
import { renderEntityCode } from "@/modules/workspaces/utils";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { onError } from "@/utils/exceptions.utils";
import { String } from "@/utils/string.utils";
import { useMutation, useQuery } from "@apollo/client/react";
import { DateTime } from "@joy-one-client/utils/date-time";
import { Trans, useLingui } from "@lingui/react/macro";
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
import { LoanDataFragment } from "../graphql/fragmentLoan.graphql";
import MUTATION_FULFILL_LOAN from "../graphql/mutationFulfillLoan.graphql";
import { LoanRowInfo } from "./loan-row-info";

interface LoanDisburesementProps {
  loan: LoanDataFragment;
  kyc: CustomerKycDataFragment;
  onDisbursed?: () => Promise<void>;
}

export const LoanDisburesement: FC<LoanDisburesementProps> = (props) => {
  const { t } = useLingui();
  const color = useColor();
  const workspace = useWorkspace();
  const banks = useBanks();
  const uploadFile = useUploadFile();

  const [fulfillLoan] = useMutation(MUTATION_FULFILL_LOAN);

  const { loan } = props;
  const [paymentMethod, setPaymentMethod] = useState<ReceiptPaymentMethod>(
    ReceiptPaymentMethod.BankTransfer
  );
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isCustomFulfilledAt, setIsCustomFulfilledAt] = useState(false);
  const [fulfilledAt, setFulfilledAt] = useState<number | null>(DateTime.toSeconds(new Date()));

  const { data: disbursementReceiptData } = useQuery(QUERY_RECEIPTS, {
    variables: {
      query: {
        relatedLoanId: loan.id,
        type: [ReceiptType.Expense],
      },
    },
  });

  const disbursementReceipt = disbursementReceiptData?.list.results[0];

  const onRevertApproval = async () => {
    await api.post(`/loans/${loan.id}/revert-approve`);
  };

  const onSubmit = async () => {
    if (!props) return;
    setIsSubmitting(true);

    try {
      if (files.length === 0) throw new Error(t`Please select at least one file`);

      const receiptFileIds: string[] = [];

      for (const file of files) {
        const _file = await uploadFile(file);
        receiptFileIds.push(_file._id);
      }

      await fulfillLoan({
        variables: {
          fulfillLoanId: loan.id,
          input: {
            receiptFileIds,
            paymentMethod,
            fulfilledAt: isCustomFulfilledAt ? fulfilledAt : null,
          },
        },
      }).catch(onError);
      await props.onDisbursed?.();
    } catch (error) {
      onError(error);
    }

    setIsSubmitting(false);
  };

  if (loan.status !== LoanStatus.Approved) {
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
            {[ReceiptPaymentMethod.BankTransfer, ReceiptPaymentMethod.Cash].map((method) => {
              const Icon = receiptPaymentMethods[method].icon;

              return (
                <Button
                  key={method}
                  leftSection={<Icon size={18} />}
                  variant={paymentMethod === method ? "outline" : "subtle"}
                  size="sm"
                  color="blue"
                  onClick={() => setPaymentMethod(method)}
                >
                  {t(receiptPaymentMethods[method].label)}
                </Button>
              );
            })}
          </Group>

          <Card withBorder shadow="none" p={16}>
            <Stack>
              <LoanRowInfo
                copy
                label={<Trans>Loan amount</Trans>}
                value={loan.amount}
                renderValue={(value) => <CurrencyFormat value={value} />}
              />

              {(function () {
                const payment = loan.payment;
                const bank = banks.find((bank) => bank.id === +(payment?.accountBankId || "-1"));

                if (
                  paymentMethod === ReceiptPaymentMethod.BankTransfer &&
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
                  paymentMethod !== ReceiptPaymentMethod.BankTransfer
                )
                  return null;

                const bankAccount: PluginBankAccount = {
                  __typename: "PluginBankAccount",
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
                      label={<Trans>Bank account name</Trans>}
                      value={loan.payment?.accountName}
                      copy
                    />
                    <LoanRowInfo
                      label={<Trans>Bank account number</Trans>}
                      value={loan.payment?.accountNumber}
                      copy
                    />
                    <LoanRowInfo label={<Trans>Bank name</Trans>} value={bank.shortName} copy />
                    <LoanRowInfo
                      label={<Trans>Bank transaction content</Trans>}
                      value={description}
                      copy
                    />

                    {loan.status === LoanStatus.Approved && !!qrCode && (
                      <Fragment>
                        <Divider />
                        <Image showLoading src={qrCode.url} w={250} maw="100%" my={16} />
                      </Fragment>
                    )}
                  </Fragment>
                );
              })()}

              <InputWrapper
                label={<Trans>Receipts images</Trans>}
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
                      label={<Trans>Custom fulfilled at</Trans>}
                      checked={isCustomFulfilledAt}
                      onChange={() => setIsCustomFulfilledAt(!isCustomFulfilledAt)}
                    />
                  </Center>

                  {isCustomFulfilledAt && (
                    <DateTimePicker
                      label={<Trans>Fulfilled at</Trans>}
                      value={fulfilledAt ? new Date(fulfilledAt * 1000) : null}
                      onChange={(d) => setFulfilledAt(d ? DateTime.toSeconds(d) : null)}
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
            {<Trans>Revert approval</Trans>}
          </Button>
        )}

        <Button type="submit" onClick={onSubmit} miw={200} loading={isSubmitting}>
          {<Trans>Loan disbursement</Trans>}
        </Button>
      </Group>
    </Stack>
  );
};
