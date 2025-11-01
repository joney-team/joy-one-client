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
import { UserColumn } from "@/modules/users/user-column";
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
  IconPrinter,
} from "@tabler/icons-react";
import { type FC } from "react";
import { workspaceBranchColumn } from "../workspace-branches/workspace-branch-column";
import { receiptPaymentMethods, receiptStatuses, receiptTypes } from "./receipt-constants";

export const ReceiptList: FC = () => {
  const workspace = useWorkspace();
  const banks = useBanks();
  const bank = banks.find((v) => workspace.settings.bankAccount?.bankId === v.id);
  const bankAccount = workspace.settings.bankAccount;

  return (
    <Stack p={16}>
      <List<ReceiptEntity>
        id="rps"
        name={t`Receipts`}
        limit={18}
        icon={IconCashRegister}
        route="/receipts"
        columns={{
          code: codeColumn({
            onClick: (_, data) => OnReceiptDetailModal({ id: data.id }),
          }),
          workspaceBranchId: workspaceBranchColumn(),
          createdAt: dateTimeColumn({ name: t`Created at`, sortable: true, isHasFilter: true }),
          paidAt: dateTimeColumn({
            name: t`Paid at`,
            sortable: true,
            defaultHidden: true,
            isHasFilter: true,
            defaultWidth: 200,
          }),
          expireAt: dateTimeColumn({
            name: t`Pay expire`,
            sortable: true,
            defaultHidden: true,
            isHasFilter: true,
            defaultWidth: 200,
          }),
          type: enumColumn({
            name: t`Type`,
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
            name: t`Customer`,
            valuePath: "relatedCustomer",
          }),
          cashierUserId: UserColumn({
            name: t`Cashier`,
            valuePath: "cashierUser",
            optionalValuePath: "disbursementUser",
          }),
          status: statusColumn({
            name: t`Status`,
            defaultWidth: 180,
            options: Object.values(ReceiptStatus).map((status) => ({
              label: receiptStatuses[status].label(),
              value: status,
              color: receiptStatuses[status].color,
            })),
          }),
          paymentMethod: enumColumn({
            name: t`Payment`,
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
            name: t`Money amount`,
            align: "right",
            sortable: true,
            type: "money",
          }),
        }}
        filterModes={[
          {
            param: "today",
            name: t`Today receipts`,
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
            label: t`Print`,
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
