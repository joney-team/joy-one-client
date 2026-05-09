"use client";

import { Button } from "@/components/buttons/button";
import { CopyText } from "@/components/copy-text";
import { CurrencyFormat } from "@/components/format/currency-format";
import { Image } from "@/components/image";
import { Modal } from "@/components/modal/modal";
import { Renderer } from "@/components/renderer";
import { Timer } from "@/components/timer";
import {
  EventType,
  ReceiptPaymentMethod,
  ReceiptStatus,
  ReceiptType,
} from "@/graphql/enums.graphql";
import { useLayout } from "@/layout/layout-context";
import { useEventsListener } from "@/modules/events/event-service";
import { EventFragment } from "@/modules/events/graphql/fragmentEvent.graphql";
import { FilesBox } from "@/modules/files/files-box";
import { useUploadFile } from "@/modules/files/hooks/use-upload-file";
import GetLoanByIdDocument from "@/modules/loans/graphql/getLoanById.graphql";
import {
  getStaticQrCode,
  getTransactionInfo,
  useBanks,
} from "@/modules/plugins/banks/banks.services";
import { useColor } from "@/modules/theme/use-color";
import { WorkspaceBranchFragment } from "@/modules/workspace-branches/graphql/fragmentWorkspaceBranch.graphql";
import GetWorkspaceBranchByIdDocument from "@/modules/workspace-branches/graphql/getWorkspaceBranchById.graphql";
import { WorkspaceBranchInput } from "@/modules/workspace-branches/workspace-branch-input";
import { useWorkspaceSetting } from "@/modules/workspace-settings/hooks/use-workspace-setting";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { AppEntity } from "@/types";
import { onError } from "@/utils/exceptions.utils";
import { nonLoading } from "@/utils/non-loading";
import { round } from "@/utils/number.utils";
import { removeAccents } from "@/utils/string.utils";
import { useApolloClient, useMutation, useQuery } from "@apollo/client/react";
import { zIndexes } from "@joy-one-client/config/layout";
import { loadImage } from "@joy-one-client/utils/assets";
import { Trans, useLingui } from "@lingui/react/macro";
import {
  ActionIcon,
  Anchor,
  Card,
  Center,
  em,
  Group,
  NumberInput,
  Skeleton,
  Stack,
  Text,
  TextInput,
  ThemeIcon,
  useMantineTheme,
} from "@mantine/core";
import { IconCashRegister, IconCheck, IconClipboardCheck, IconRefresh } from "@tabler/icons-react";
import dynamic from "next/dynamic";
import {
  FC,
  forwardRef,
  Fragment,
  ReactNode,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { PrintButton } from "../../../modals/modal-printer";
import { ReceiptFragment } from "../graphql/fragmentReceipt.graphql";
import GetReceiptByIdDocument from "../graphql/getReceiptById.graphql";
import PayReceiptDocument from "../graphql/payReceipt.graphql";
import { receiptPaymentMethods } from "../receipt-constants";
import { type ModalReceiptDetailRef } from "./modal-receipt-detail";

const ModalReceiptDetail = dynamic(
  () => import("./modal-receipt-detail").then((mod) => mod.ModalReceiptDetail),
  {
    ssr: false,
    loading: nonLoading,
  },
);

export interface ModalPayReceiptArgs {
  receipt: Pick<ReceiptFragment, "id">;
  onPaid?: () => void;
  onClosed?: () => void;
}

export interface ModalPayReceiptRef {
  open: (props: ModalPayReceiptArgs) => void;
  close: () => void;
}

const ModalPayReceiptContent: FC<ModalPayReceiptArgs> = (props) => {
  const { t } = useLingui();
  const workspace = useWorkspace();
  const client = useApolloClient();
  const { workspaceSetting } = useWorkspaceSetting();
  const theme = useMantineTheme();
  const banks = useBanks();

  const color = useColor();
  const [receiptFiles, setReceiptFiles] = useState<File[]>([]);
  const uploadFile = useUploadFile();

  const {
    data: receiptData,
    loading: loadingReceipt,
    refetch: refetchReceipt,
  } = useQuery(GetReceiptByIdDocument, {
    variables: {
      id: props.receipt.id,
    },
    fetchPolicy: "cache-and-network",
  });

  const receipt = receiptData?.receipt;

  const modalReceiptDetailRef = useRef<ModalReceiptDetailRef | null>(null);

  const [payReceipt] = useMutation(PayReceiptDocument);

  const [paymentMethod, setPaymentMethod] = useState(
    workspaceSetting?.receiptPaymentMethodDefault ?? ReceiptPaymentMethod.Cash,
  );

  const paymentMethods: ReceiptPaymentMethod[] = workspaceSetting?.receiptPaymentMethodDefault
    ? [
        workspaceSetting?.receiptPaymentMethodDefault,
        ...Object.values(ReceiptPaymentMethod).filter(
          (v) => v !== workspaceSetting?.receiptPaymentMethodDefault,
        ),
      ]
    : Object.values(ReceiptPaymentMethod);

  const getDefaultTransactionDesc = async (receipt: ReceiptFragment) => {
    if (receipt.type === ReceiptType.Income && receipt.relatedLoanId && receipt.relatedCustomer) {
      const customer = receipt.relatedCustomer;
      const loan = await client.query({
        query: GetLoanByIdDocument,
        variables: {
          id: receipt.relatedLoanId,
        },
        fetchPolicy: "network-only",
      });
      return `${removeAccents(customer.name).toUpperCase()} ${loan.data?.loan.code} ${
        receipt.code
      }`;
    }

    return receipt.code;
  };

  const [transactionDesc, setTransactionDesc] = useState<string>("");

  useEffect(() => {
    if (receiptData?.receipt && !transactionDesc) {
      getDefaultTransactionDesc(receiptData.receipt).then((desc) => setTransactionDesc(desc));
    }
  }, [transactionDesc, receiptData]);

  const [giveAmount, setGiveAmount] = useState<number>();
  const [workspaceBranch, setWorkspaceBranch] = useState<Pick<
    WorkspaceBranchFragment,
    "_id" | "name" | "hotline"
  > | null>(workspace.defaultBranch ?? null);
  const totalAmount = receipt ? round(receipt.amount + (receipt.tipAmount || 0)) : 0;

  const { data: workspaceBranchData } = useQuery(GetWorkspaceBranchByIdDocument, {
    variables: { id: workspaceBranch?._id ?? "" },
    skip: !receipt?.workspaceBranch?._id,
    fetchPolicy: "cache-and-network",
  });

  useEffect(() => {
    if (receipt?.workspaceBranch?._id && !workspaceBranch) {
      setWorkspaceBranch(receipt?.workspaceBranch);
    }
  }, [receipt?.workspaceBranch?._id]);

  const bankInformation = useMemo(() => {
    const bankAccount =
      workspaceBranchData?.workspaceBranch?.settings?.bankAccount || workspaceSetting?.bankAccount;
    const bankInformation = banks.find((v) => v.id === bankAccount?.bankId);

    if (
      !receipt ||
      !bankInformation ||
      !bankAccount ||
      !bankAccount.bankId ||
      !bankAccount.accountNumber
    )
      return undefined;

    return {
      bankAccount,
      qr: getStaticQrCode(
        bankInformation,
        {
          __typename: "PluginBankAccount",
          bankId: bankAccount.bankId,
          accountNumber: bankAccount.accountNumber,
          accountName: bankAccount.accountName || "",
        },
        {
          amount: totalAmount,
          description: transactionDesc,
        },
      ),
    };
  }, [workspaceBranchData, banks, transactionDesc, workspaceSetting, paymentMethod, totalAmount]);

  const onClose = async () => {
    if (!receipt) return;

    const data = await client.query({
      query: GetReceiptByIdDocument,
      variables: {
        id: receipt.id,
      },
      fetchPolicy: "network-only",
    });

    if (data.data?.receipt?.status === ReceiptStatus.Paid) {
      props.onPaid?.();
    } else {
      props.onClosed?.();
    }
  };

  const onPayReceipt = async () => {
    if (!receipt) return;

    try {
      if (workspaceSetting?.receiptImagesRequired && receiptFiles.length <= 0) {
        throw new Error(t`Receipt images required`);
      }

      for (const file of receiptFiles) {
        await uploadFile(file, {
          refs: [
            `${AppEntity.RECEIPTS}:${receipt.id}`,
            `${AppEntity.CUSTOMERS}:${receipt.relatedCustomerId}`,
            `${AppEntity.LOANS}:${receipt.relatedLoanId}`,
          ],
        });
      }

      const { data } = await payReceipt({
        variables: {
          payReceiptId: receipt.id,
          input: {
            paymentMethod,
            giveAmount,
          },
        },
      });

      if (!data?.receipt) return;

      if (data?.receipt.status === ReceiptStatus.Paid) {
        onClose();
        modalReceiptDetailRef.current?.open(data.receipt.id);
      }

      setTransactionDesc(await getDefaultTransactionDesc(data.receipt));
      refetchReceipt();
    } catch (error) {
      onError(error);
    }
  };

  useEventsListener([EventType.ReceiptPaid], (ev: EventFragment) => {
    if (ev.ref === receipt?.id) refetchReceipt();
  });

  useEffect(() => {
    if (bankInformation) {
      loadImage(bankInformation.qr.url);
    }
  }, [bankInformation]);

  return (
    <Stack gap="md">
      {(function () {
        if (loadingReceipt) return <Skeleton h={200} />;
        if (!receipt) return null;

        if (receipt.status === ReceiptStatus.Paid)
          return (
            <Stack gap="md">
              <Card
                withBorder
                style={{
                  borderColor: theme.colors.primary[6],
                  borderWidth: 1,
                }}
              >
                <Stack align="center" gap="md" p={10}>
                  <ThemeIcon size={55} radius={200}>
                    <IconClipboardCheck strokeWidth={1.4} size={35} />
                  </ThemeIcon>
                  <Text c={color("primary")} ta="center" fz={em(22)} fw={600} tt="capitalize">
                    <Trans>Pay successful</Trans>
                  </Text>
                </Stack>
              </Card>

              <Anchor ta="center" c="gray" fz={em(14)} onClick={onClose}>
                <Trans>Exit</Trans>
              </Anchor>
            </Stack>
          );

        return (
          <Fragment>
            <Stack gap={0}>
              <Group justify="center" gap={5}>
                <ThemeIcon variant="transparent" size="lg">
                  <IconCashRegister strokeWidth={1.5} size={30} />
                </ThemeIcon>
                <Text ta="center" c={color("primary")} fw={500} fz={em(20)}>
                  <Trans>Pay receipt</Trans>
                </Text>
              </Group>

              <Text ta="center" c="gray" fw={500} fz={12}>
                #{receipt.code}
              </Text>
            </Stack>

            {workspace.isShouldEnableBranches && (
              <Stack gap={0}>
                <Text fw={500} fz={14}>
                  <Trans>Branch</Trans>
                </Text>
                <WorkspaceBranchInput
                  value={workspaceBranch}
                  onChange={(branch) => setWorkspaceBranch(branch)}
                />
              </Stack>
            )}

            <Stack gap={25}>
              <Text mb={-20} fw={500} fz={14}>
                <Trans>Payment method</Trans>
              </Text>
              <Group gap={10}>
                {paymentMethods.map((method) => {
                  const Icon = receiptPaymentMethods[method].icon;

                  if (method === ReceiptPaymentMethod.BankTransfer && !bankInformation) return null;

                  return (
                    <Button
                      key={method}
                      size="xs"
                      leftIcon={Icon}
                      variant={paymentMethod === method ? "filled" : "outline"}
                      onClick={() => setPaymentMethod(method)}
                    >
                      {t(receiptPaymentMethods[method].label)}
                    </Button>
                  );
                })}
              </Group>

              <Text mb={-20} fw={500} fz={14}>
                <Trans>Payment info</Trans>
              </Text>

              <Card withBorder p={10}>
                {(function () {
                  if (paymentMethod === ReceiptPaymentMethod.BankTransfer && bankInformation) {
                    return (
                      <Stack gap={8}>
                        <Center>
                          <Image showLoading src={bankInformation?.qr.url} w={250} maw="100%" />
                        </Center>

                        <Timer />

                        <Stack>
                          <Group justify="space-between">
                            <Text>
                              <Trans>Money amount</Trans>:{" "}
                            </Text>
                            <CopyText
                              fw={500}
                              text={totalAmount}
                              renderText={() => <CurrencyFormat value={totalAmount} />}
                            />
                          </Group>

                          <Group justify="space-between" wrap="nowrap" gap={8}>
                            <Text>
                              <Trans>Content</Trans>:
                            </Text>
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
                                  onChange={(e) =>
                                    setTransactionDesc(getTransactionInfo(e.currentTarget.value))
                                  }
                                  styles={{
                                    input: {
                                      textAlign: "right",
                                    },
                                  }}
                                />
                              </Group>
                            </CopyText>
                          </Group>

                          {bankInformation?.bankAccount.accountName && (
                            <Group justify="space-between">
                              <Text>
                                <Trans>Bank account name</Trans>:{" "}
                              </Text>
                              <CopyText
                                fw={500}
                                truncate="end"
                                w="100%"
                                maw={200}
                                text={bankInformation.bankAccount.accountName}
                              />
                            </Group>
                          )}

                          {bankInformation?.bankAccount.accountNumber && (
                            <Group justify="space-between">
                              <Text>
                                <Trans>Bank account number</Trans>:{" "}
                              </Text>
                              <CopyText
                                fw={500}
                                text={bankInformation?.bankAccount.accountNumber}
                              />
                            </Group>
                          )}
                        </Stack>
                      </Stack>
                    );
                  }

                  if (paymentMethod === ReceiptPaymentMethod.Cash) {
                    return (
                      <Stack>
                        <Group justify="space-between">
                          <Text>
                            <Trans>Money amount</Trans>:{" "}
                          </Text>
                          <CopyText
                            fw={500}
                            text={totalAmount}
                            renderText={() => <CurrencyFormat value={totalAmount} />}
                          />
                        </Group>

                        <Group justify="space-between" wrap="nowrap">
                          <Text>
                            <Trans>Money given</Trans>:{" "}
                          </Text>
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
                          <Text>
                            <Trans>Money change</Trans>:{" "}
                          </Text>
                          <Text fw={500}>
                            {giveAmount && giveAmount > totalAmount ? (
                              <CurrencyFormat value={giveAmount - totalAmount} />
                            ) : (
                              "0"
                            )}
                          </Text>
                        </Group>
                      </Stack>
                    );
                  }

                  return (
                    <Group justify="space-between">
                      <Text>
                        <Trans>Money amount</Trans>:{" "}
                      </Text>
                      <CopyText
                        fw={500}
                        text={totalAmount}
                        renderText={() => <CurrencyFormat value={totalAmount} />}
                      />
                    </Group>
                  );
                })()}
              </Card>

              <Group gap={3} mb={-20}>
                <Text fw={500} fz={em(14)}>
                  <Trans>Receipts images</Trans>
                </Text>
                <Renderer visible={!!workspaceSetting?.receiptImagesRequired}>
                  <Text fw={700} c="red">
                    *
                  </Text>
                </Renderer>
              </Group>

              <FilesBox
                rawFiles={receiptFiles}
                onChangeRawFiles={(_files) => setReceiptFiles(_files)}
                filesWrapperProps={{
                  justify: "center",
                }}
              />
            </Stack>

            <Renderer visible={!!receipt.relatedOrderId}>
              <Group justify="center" mt={8}>
                <PrintButton
                  receipt={receipt}
                  bankQrCode={bankInformation?.qr}
                  label={<Trans>Print receipt</Trans>}
                />
              </Group>
            </Renderer>

            <Stack gap="md" mt={10} align="center">
              <Button leftIcon={IconCheck} onClick={onPayReceipt} tt="uppercase" h={42}>
                <Trans>Confirm paid</Trans>
              </Button>

              <Anchor ta="center" c="gray" fz={13} onClick={onClose}>
                <Trans>Exit</Trans>
              </Anchor>
            </Stack>
          </Fragment>
        );
      })()}

      <ModalReceiptDetail ref={modalReceiptDetailRef} />
    </Stack>
  );
};

export const ModalPayReceipt = forwardRef<
  ModalPayReceiptRef,
  { children?: (ref: ModalPayReceiptRef) => ReactNode }
>((props, ref) => {
  const [args, setArgs] = useState<ModalPayReceiptArgs | null>(null);
  const layout = useLayout();

  const onClose = () => {
    args?.onClosed?.();
    setArgs(null);
  };

  useImperativeHandle(ref, () => ({
    open: (p) => {
      setArgs(p);
    },
    close: onClose,
  }));

  return (
    <Fragment>
      {typeof props.children === "function" &&
        props.children({
          open: (p) => {
            setArgs(p);
          },
          close: () => {
            onClose();
          },
        })}

      <Modal
        withCloseButton={false}
        zIndex={zIndexes.commonModals + 1}
        opened={!!args}
        onClose={onClose}
        size={550}
        yOffset={layout.view === "mobile" ? 10 : undefined}
      >
        {args && (
          <ModalPayReceiptContent
            key={args.receipt.id}
            {...args}
            onClosed={onClose}
            onPaid={() => {
              args?.onPaid?.();
              onClose();
            }}
          />
        )}
      </Modal>
    </Fragment>
  );
});
