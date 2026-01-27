"use client";

import { List } from "@/components/list";
import { codeColumn } from "@/components/list/columns/code-column";
import { dateTimeColumn } from "@/components/list/columns/date-time-column";
import { enumColumn } from "@/components/list/columns/enum-column";
import { numberColumn } from "@/components/list/columns/number-column";
import { statusColumn } from "@/components/list/columns/status-column";
import { EventType } from "@/graphql/enums.graphql";
import { type ModalPrinterRef } from "@/modals/modal-printer";
import { customerColumn } from "@/modules/customers/components/customer-column";
import { getStaticQrCode, useBanks } from "@/modules/plugins/banks/banks.services";
import { OnModalReceiptForm } from "@/modules/receipts/modals/modal-receipt-form";
import { ReceiptCard } from "@/modules/receipts/receipt-card";
import {
  ReceiptEntity,
  ReceiptPaymentMethod,
  ReceiptStatus,
  ReceiptType,
} from "@/modules/receipts/receipts-types";
import { userColumn } from "@/modules/users/user-column";
import { WorkspacePermission } from "@/modules/workspace-roles/workspace-roles-types";
import { renderEntityCode } from "@/modules/workspaces/utils";
import { nonLoading } from "@/utils/non-loading";
import { Trans } from "@lingui/react/macro";
import { Stack } from "@mantine/core";
import {
  IconArrowsDoubleSwNe,
  IconCalendarDown,
  IconCashRegister,
  IconCoins,
  IconCreditCard,
  IconEye,
  IconPrinter,
} from "@tabler/icons-react";
import dynamic from "next/dynamic";
import { Fragment, useRef, type FC } from "react";
import { workspaceBranchColumn } from "../workspace-branches/workspace-branch-column";
import { useWorkspaceSetting } from "../workspace-settings/hooks/useWorkspaceSetting";
import QUERY_RECEIPTS from "./graphql/queryReceipts.graphql";
import { type ModalPayReceiptRef } from "./modals/modal-pay-receipt";
import { ModalReceiptDetailRef } from "./modals/modal-receipt-detail";
import { receiptPaymentMethods, receiptStatuses, receiptTypes } from "./receipt-constants";

const ModalReceiptDetail = dynamic(
  () => import("./modals/modal-receipt-detail").then((mod) => mod.ModalReceiptDetail),
  {
    ssr: false,
    loading: nonLoading,
  }
);

const ModalPrinter = dynamic(
  () => import("@/modals/modal-printer").then((mod) => mod.ModalPrinter),
  {
    ssr: false,
    loading: nonLoading,
  }
);

const ModalPayReceipt = dynamic(
  () => import("./modals/modal-pay-receipt").then((mod) => mod.ModalPayReceipt),
  {
    ssr: false,
    loading: nonLoading,
  }
);

export const ReceiptList: FC = () => {
  const { workspaceSetting } = useWorkspaceSetting();
  const banks = useBanks();
  const bank = banks.find((v) => workspaceSetting?.bankAccount?.bankId === v.id);
  const bankAccount = workspaceSetting?.bankAccount;
  const modalPrinterRef = useRef<ModalPrinterRef | null>(null);
  const modalPayReceiptRef = useRef<ModalPayReceiptRef | null>(null);
  const modalReceiptDetailRef = useRef<ModalReceiptDetailRef | null>(null);

  return (
    <Fragment>
      <Stack p={16}>
        <List<ReceiptEntity>
          id="rps"
          name={<Trans>Receipts</Trans>}
          limit={18}
          icon={IconCashRegister}
          query={QUERY_RECEIPTS}
          columns={{
            code: codeColumn({
              onClick: (_, data) => modalReceiptDetailRef.current?.open(data.id),
            }),
            workspaceBranchId: workspaceBranchColumn(),
            createdAt: dateTimeColumn({
              name: <Trans>Created at</Trans>,
              sortable: true,
              isHasFilter: true,
            }),
            paidAt: dateTimeColumn({
              name: <Trans>Paid at</Trans>,
              sortable: true,
              defaultHidden: true,
              isHasFilter: true,
            }),
            expireAt: dateTimeColumn({
              name: <Trans>Pay expire</Trans>,
              sortable: true,
              defaultHidden: true,
              isHasFilter: true,
            }),
            type: enumColumn({
              name: <Trans>Type</Trans>,
              icon: IconArrowsDoubleSwNe,
              minWidth: 110,
              options: Object.values(ReceiptType).map((type) => ({
                label: receiptTypes[type].label(),
                color: receiptTypes[type].color,
                icon: receiptTypes[type].icon,
                value: type,
              })),
            }),
            relatedCustomerId: customerColumn({
              valuePath: "relatedCustomer",
            }),
            cashierUserId: userColumn({
              name: <Trans>Cashier</Trans>,
              valuePath: "cashierUser",
              optionalValuePath: "disbursementUser",
            }),
            status: statusColumn({
              name: <Trans>Status</Trans>,
              defaultWidth: 180,
              options: Object.values(ReceiptStatus).map((status) => ({
                label: receiptStatuses[status].label(),
                value: status,
                color: receiptStatuses[status].color,
              })),
            }),
            paymentMethod: enumColumn({
              name: <Trans>Payment</Trans>,
              icon: IconCreditCard,
              defaultWidth: 180,
              options: Object.values(ReceiptPaymentMethod).map((paymentMethod) => ({
                label: receiptPaymentMethods[paymentMethod].label(),
                value: paymentMethod,
                color: receiptPaymentMethods[paymentMethod].color,
                icon: receiptPaymentMethods[paymentMethod].icon,
              })),
            }),
            amount: numberColumn({
              icon: IconCoins,
              name: <Trans>Money amount</Trans>,
              align: "right",
              sortable: true,
              type: "money",
            }),
          }}
          filterModes={[
            {
              param: "today",
              name: <Trans>Today receipts</Trans>,
              icon: IconCalendarDown,
              replaceFilterKeys: ["createdAt", "paidAt"],
              params: () => ({ today: true }),
            },
          ]}
          events={[
            EventType.ReceiptNew,
            EventType.ReceiptPaid,
            EventType.ReceiptUpdated,
            EventType.ReceiptDisbursement,
            EventType.ReceiptArchived,
            EventType.ReceiptUnarchived,
            EventType.ReceiptRevertPayment,
          ]}
          actions={[
            {
              label: <Trans>Detail</Trans>,
              icon: IconEye,
              href: (data) => `/receipts/${data.id}`,
            },
            {
              label: <Trans>Print</Trans>,
              icon: IconPrinter,
              disabled: (data) => {
                const bankQrCode =
                  bank && bankAccount && data
                    ? getStaticQrCode(bank, bankAccount, {
                        amount: data.amount,
                        description: renderEntityCode(data.code),
                      })
                    : undefined;

                return !bankQrCode;
              },
              onClick: (data) => {
                const bankQrCode =
                  bank && bankAccount && data
                    ? getStaticQrCode(bank, bankAccount, {
                        amount: data.amount,
                        description: renderEntityCode(data.code),
                      })
                    : undefined;

                modalPrinterRef.current?.open({ receipt: data, bankQrCode });
              },
            },
            {
              label: <Trans>Pay</Trans>,
              icon: IconCashRegister,
              disabled: (data) => data.status === ReceiptStatus.PAID,
              onClick: (data) => modalPayReceiptRef.current?.open({ receipt: data }),
            },
          ]}
          creatable={{
            onCreate: () => OnModalReceiptForm(),
            permission: WorkspacePermission.RECEIPTS_CREATE,
          }}
          card={({ data }) => <ReceiptCard receipt={data} />}
        />
      </Stack>

      <ModalPrinter ref={modalPrinterRef} />
      <ModalPayReceipt ref={modalPayReceiptRef} />
      <ModalReceiptDetail ref={modalReceiptDetailRef} />
    </Fragment>
  );
};
