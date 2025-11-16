"use client";

import { List } from "@/components/list";
import { codeColumn } from "@/components/list/columns/code-column";
import { dateTimeColumn } from "@/components/list/columns/date-time-column";
import { enumColumn } from "@/components/list/columns/enum-column";
import { numberColumn } from "@/components/list/columns/number-column";
import { statusColumn } from "@/components/list/columns/status-column";
import { OnModalPrinter } from "@/modals/modal-printer";
import { customerColumn } from "@/modules/customers/components/customer-column";
import { EventType } from "@/modules/events/event-types";
import { getStaticQrCode, useBanks } from "@/modules/plugins/banks/banks.services";
import { OnReceiptDetailModal } from "@/modules/receipts/modals/modal-receipt-detail";
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
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { t } from "@lingui/core/macro";
import { Stack } from "@mantine/core";
import {
  IconArrowsDoubleSwNe,
  IconCalendarDown,
  IconCashRegister,
  IconCreditCard,
  IconEye,
  IconPrinter,
} from "@tabler/icons-react";
import { type FC } from "react";
import { workspaceBranchColumn } from "../workspace-branches/workspace-branch-column";
import { receiptPaymentMethods, receiptStatuses, receiptTypes } from "./receipt-constants";
import { Trans } from "@lingui/react/macro";
import { OnModalPayReceipt } from "./modals/modal-pay-receipt";

export const ReceiptList: FC = () => {
  const workspace = useWorkspace();
  const banks = useBanks();
  const bank = banks.find((v) => workspace.settings.bankAccount?.bankId === v.id);
  const bankAccount = workspace.settings.bankAccount;

  return (
    <Stack p={16}>
      <List<ReceiptEntity>
        id="rps"
        name={<Trans>Receipts</Trans>}
        limit={18}
        icon={IconCashRegister}
        route="/receipts"
        columns={{
          code: codeColumn({
            onClick: (_, data) => OnReceiptDetailModal({ id: data.id }),
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
            defaultWidth: 110,
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
          EventType.RECEIPT_NEW,
          EventType.RECEIPT_PAID,
          EventType.RECEIPT_UPDATED,
          EventType.RECEIPT_DISBURSEMENT,
          EventType.RECEIPT_ARCHIVED,
          EventType.RECEIPT_UNARCHIVED,
          EventType.RECEIPT_REVERT_PAYMENT,
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

              OnModalPrinter({ receipt: data, bankQrCode });
            },
          },
          {
            label: <Trans>Pay</Trans>,
            icon: IconCashRegister,
            disabled: (data) => data.status === ReceiptStatus.PAID,
            onClick: (data) => OnModalPayReceipt({ receipt: data }),
          },
        ]}
        creatable={{
          onCreate: () => OnModalReceiptForm(),
          permission: WorkspacePermission.RECEIPTS_CREATE,
        }}
        card={({ data }) => <ReceiptCard receipt={data} />}
      />
    </Stack>
  );
};
