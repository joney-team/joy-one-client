"use client";

import { Button } from "@/components/buttons/button";
import { CopyText } from "@/components/copy-text";
import { Image } from "@/components/image";
import { Renderer } from "@/components/renderer";
import { Timer } from "@/components/timer";
import { getView } from "@/layout/layout-service";
import { useEventsListener } from "@/modules/events/event-service";
import { EventEntity, EventType } from "@/modules/events/event-types";
import { FilesBox } from "@/modules/files/files-box";
import { uploadFile } from "@/modules/files/file-service";
import { num, t, tMulti } from "@/modules/lang/lang-service";
import { getLoan } from "@/modules/loans/loans-service";
import { getStaticQrCode, getTransactionInfo, useBanks } from "@/modules/plugins/banks/banks.services";
import { getPaymentMethodIcon, getReceipt, payReceipt } from "@/modules/receipts/receipts-service";
import { ReceiptEntity, ReceiptPaymentMethod, ReceiptStatus, ReceiptType } from "@/modules/receipts/receipts-types";
import { useColor } from "@/modules/theme/use-color";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { AppEntity } from "@/types";
import { loadImage } from "@/utils/asset.utils";
import { onError } from "@/utils/exceptions.utils";
import { round } from "@/utils/number.utils";
import { removeAccents } from "@/utils/string.utils";
import {
  ActionIcon,
  Anchor,
  Card,
  Center,
  Group,
  NumberInput,
  Skeleton,
  Stack,
  Text,
  TextInput,
  ThemeIcon,
  em,
  useMantineTheme,
} from "@mantine/core";
import { modals } from "@mantine/modals";
import { IconCashRegister, IconCheck, IconClipboardCheck, IconRefresh } from "@tabler/icons-react";
import { FC, useEffect, useState } from "react";
import { PrintButton } from "../../../modals/modal-printer";
import { OnReceiptDetailModal } from "./modal-receipt-detail";

interface ModalPayReceiptProps {
  receipt: ReceiptEntity;
  onPaid?: () => void;
  onClosed?: () => void;
}

const ModalPayReceipt: FC<ModalPayReceiptProps> = (props) => {
  const workspace = useWorkspace();
  const theme = useMantineTheme();
  const banks = useBanks();

  const color = useColor();
  const [receipt, setReceipt] = useState(props.receipt);
  const [receiptFiles, setReceiptFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(true);

  const [paymentMethod, setPaymentMethod] = useState(
    workspace.settings.receiptPaymentMethodDefault || ReceiptPaymentMethod.CASH
  );
  const paymentMethods = workspace.settings.receiptPaymentMethodDefault
    ? [
        workspace.settings.receiptPaymentMethodDefault,
        ...Object.values(ReceiptPaymentMethod).filter((v) => v !== workspace.settings.receiptPaymentMethodDefault),
      ]
    : Object.values(ReceiptPaymentMethod);

  const getDefaultTransactionDesc = async (receipt: ReceiptEntity) => {
    if (receipt.type === ReceiptType.INCOME && receipt.relatedLoanId && receipt.relatedCustomer) {
      const customer = receipt.relatedCustomer;
      const loan = await getLoan(receipt.relatedLoanId);

      // const { assetData, assetType } = loan;

      // if (assetType === LoanAssetType.ICLOUD && assetData.deviceName) {
      //   return `${removeAccents(customer.name).toUpperCase()} ${assetData.deviceName} ${loan.code} ${receipt.code}`;
      // }

      return `${removeAccents(customer.name).toUpperCase()} ${loan.code} ${receipt.code}`;
    }

    return props.receipt.code;
  };

  const [transactionDesc, setTransactionDesc] = useState<string>("");
  const [giveAmount, setGiveAmount] = useState<number>();

  const bank = banks.find((v) => workspace.settings.bankAccount?.bankId === v.id);
  const bankAccount = workspace.settings.bankAccount;
  const totalAmount = round(receipt.amount + (receipt.tipAmount || 0));

  const bankQrCode =
    bank && bankAccount && receipt
      ? getStaticQrCode(bank, bankAccount, {
          amount: totalAmount,
          description: transactionDesc,
        })
      : undefined;

  const onClose = async () => {
    const data = await getReceipt(receipt.id);
    if (data.status === ReceiptStatus.PAID) {
      props.onPaid?.();
    } else {
      props.onClosed?.();
    }

    modals.close("ModalPayReceipt");
  };

  const onPayReceipt = async () => {
    if (!receipt) return;
    try {
      if (workspace.settings.receiptImagesRequired && receiptFiles.length <= 0) {
        throw new Error(t("receipt_images_required"));
      }

      await Promise.all(
        receiptFiles.map((file) =>
          uploadFile({
            file,
            relatedCustomerId: receipt.relatedCustomerId,
            relatedReceiptId: receipt.id,
            relatedEntities: [
              {
                id: receipt.id,
                entity: AppEntity.RECEIPTS,
              },
              {
                id: receipt.relatedCustomerId || "",
                entity: AppEntity.CUSTOMERS,
              },
              {
                id: receipt.relatedLoanId || "",
                entity: AppEntity.LOANS,
              },
            ].filter((v) => !!v.id),
          })
        )
      );

      const _receipt = await payReceipt(receipt.id, {
        paymentMethod,
        giveAmount,
      });

      if (_receipt.status === ReceiptStatus.PAID) {
        onClose();
        OnReceiptDetailModal({ id: _receipt.id });
      }

      setReceipt(_receipt);
      setTransactionDesc(await getDefaultTransactionDesc(_receipt));
    } catch (error) {
      onError(error);
    }
  };

  const initialize = async () => {
    setLoading(true);
    setTransactionDesc(await getDefaultTransactionDesc(props.receipt));
    setLoading(false);
  };

  const fetchReceipt = async () => {
    const data = await getReceipt(props.receipt.id);
    setReceipt(data);
    setTransactionDesc(await getDefaultTransactionDesc(data));
  };

  useEffect(() => {
    initialize();
  }, []);

  useEventsListener([EventType.RECEIPT_PAID], (ev: EventEntity) => {
    if (ev.ref === receipt?.id) fetchReceipt();
  });

  useEffect(() => {
    if (bankQrCode?.url) {
      loadImage(bankQrCode.url);
    }
  }, [bankQrCode?.url]);

  return (
    <Stack gap={16}>
      {(function () {
        if (loading) return <Skeleton h={200} />;

        if (receipt.status === ReceiptStatus.PAID)
          return (
            <>
              <Stack gap={16}>
                <Card
                  withBorder
                  style={{
                    borderColor: theme.colors.primary[6],
                    borderWidth: 1,
                  }}
                >
                  <Stack align="center" gap={16} p={10}>
                    <ThemeIcon size={55} radius={200}>
                      <IconClipboardCheck strokeWidth={1.4} size={35} />
                    </ThemeIcon>
                    <Text c={color("primary")} ta="center" fz={em(22)} fw={600} tt="capitalize">
                      {t("pay_successful")}
                    </Text>
                  </Stack>
                </Card>

                <Anchor ta="center" c="gray" fz={em(14)} onClick={onClose}>
                  {t("exit")}
                </Anchor>
              </Stack>
            </>
          );

        return (
          <>
            <Stack gap={0}>
              <Group justify="center" gap={5}>
                <ThemeIcon variant="transparent" size="lg">
                  <IconCashRegister strokeWidth={1.5} size={30} />
                </ThemeIcon>
                <Text ta="center" c={color("primary")} fw={500} fz={em(20)}>
                  {tMulti(["pay"], ["receipt"])}
                </Text>
              </Group>

              <Text ta="center" c="gray" fw={500} fz={12}>
                #{receipt.code}
              </Text>
            </Stack>

            <Stack gap={25}>
              <Text mb={-20} fw={500} fz={em(14)}>
                {t("payment_method")}
              </Text>
              <Group gap={10}>
                {paymentMethods.map((method) => {
                  const Icon = getPaymentMethodIcon(method);

                  if (method === ReceiptPaymentMethod.BANK_TRANSFER && (!bank || !bankAccount)) return null;

                  return (
                    <Button
                      key={method}
                      size="xs"
                      leftIcon={Icon}
                      variant={paymentMethod === method ? "filled" : "outline"}
                      onClick={() => setPaymentMethod(method)}
                    >
                      {t(`payment_method_${method}`)}
                    </Button>
                  );
                })}
              </Group>

              <Text mb={-20} fw={500} fz={em(14)}>
                {t("payment_info")}
              </Text>

              <Card withBorder p={10}>
                {(function () {
                  if (paymentMethod === ReceiptPaymentMethod.BANK_TRANSFER && bank && bankAccount) {
                    return (
                      <>
                        <Stack gap={8}>
                          <Center>
                            <Image showLoading src={bankQrCode?.url} w={250} maw="100%" />
                          </Center>

                          <Timer />

                          <Stack>
                            <Group justify="space-between">
                              <Text>{t("money_amount")}: </Text>
                              <CopyText fw={500} text={num(totalAmount, { type: "money" })} />
                            </Group>

                            <Group justify="space-between" wrap="nowrap" gap={8}>
                              <Text>{t("content")}: </Text>
                              <CopyText fw={500} text={transactionDesc}>
                                <Group wrap="nowrap" gap={5}>
                                  {transactionDesc !== receipt.code && (
                                    <ActionIcon
                                      variant="transparent"
                                      size="xs"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        setTransactionDesc(receipt.code);
                                      }}
                                    >
                                      <IconRefresh size={18} />
                                    </ActionIcon>
                                  )}

                                  <TextInput
                                    value={transactionDesc}
                                    onChange={(e) => setTransactionDesc(getTransactionInfo(e.currentTarget.value))}
                                    styles={{
                                      input: {
                                        textAlign: "right",
                                      },
                                    }}
                                  />
                                </Group>
                              </CopyText>
                            </Group>

                            {bankQrCode?.account.accountName && (
                              <Group justify="space-between">
                                <Text>{t("bank_account_name")}: </Text>
                                <CopyText fw={500} text={bankQrCode.account.accountName} />
                              </Group>
                            )}

                            {bankQrCode?.account.accountNumber && (
                              <Group justify="space-between">
                                <Text>{t("bank_account_number")}: </Text>
                                <CopyText fw={500} text={bankQrCode?.account.accountNumber} />
                              </Group>
                            )}
                          </Stack>
                        </Stack>
                      </>
                    );
                  }

                  if (paymentMethod === ReceiptPaymentMethod.CASH) {
                    return (
                      <Stack>
                        <Group justify="space-between">
                          <Text>{t("money_amount")}: </Text>
                          <CopyText fw={500} text={num(totalAmount, { type: "money" })} />
                        </Group>

                        <Group justify="space-between" wrap="nowrap">
                          <Text>{t("money_given")}: </Text>
                          <NumberInput
                            value={giveAmount}
                            onChange={(e) => setGiveAmount(+e)}
                            hideControls
                            styles={{
                              input: {
                                textAlign: "right",
                                fontWeight: 500,
                              },
                            }}
                          />
                        </Group>

                        <Group justify="space-between">
                          <Text>{t("money_change")}: </Text>
                          <Text fw={500}>
                            {giveAmount && giveAmount > totalAmount
                              ? num(giveAmount - totalAmount, { type: "money" })
                              : "0"}
                          </Text>
                        </Group>
                      </Stack>
                    );
                  }

                  return (
                    <>
                      <Group justify="space-between">
                        <Text>{t("money_amount")}: </Text>
                        <CopyText fw={500} text={num(totalAmount)} />
                      </Group>
                    </>
                  );
                })()}
              </Card>

              <Group gap={3} mb={-20}>
                <Text fw={500} fz={em(14)}>
                  {t("receipts_images")}
                </Text>
                <Renderer visible={!!workspace.settings.receiptImagesRequired}>
                  <Text fw={700} c="red">
                    *
                  </Text>
                </Renderer>
              </Group>

              <Card p={10} withBorder>
                <FilesBox
                  rawFiles={receiptFiles}
                  onChangeRawFiles={(_files) => setReceiptFiles(_files)}
                  filesWrapperProps={{
                    justify: "center",
                  }}
                />
              </Card>
            </Stack>

            <Renderer visible={!!receipt.relatedOrderId}>
              <Group justify="center" mt={8}>
                <PrintButton receipt={receipt} bankQrCode={bankQrCode} label={t("print_receipt")} />
              </Group>
            </Renderer>

            <Stack gap={16} mt={10} align="center">
              <Button leftIcon={IconCheck} onClick={onPayReceipt} action tt="uppercase" h={42}>
                {t("confirm_paid")}
              </Button>

              <Anchor ta="center" c="gray" fz={13} onClick={onClose}>
                {t("exit")}
              </Anchor>
            </Stack>
          </>
        );
      })()}
    </Stack>
  );
};

export const OnModalPayReceipt = (props: ModalPayReceiptProps) =>
  modals.open({
    modalId: "ModalPayReceipt",
    children: <ModalPayReceipt {...props} />,
    withCloseButton: false,
    closeOnClickOutside: false,
    closeOnEscape: false,
    size: 550,
    yOffset: getView() === "mobile" ? 10 : undefined,
  });
