"use client";

import { type FC } from "react";
import { List } from "@/components/list";
import { CodeColumn } from "@/components/list/columns/code-column";
import { DateTimeColumn } from "@/components/list/columns/date-time-column";
import { EnumColumn } from "@/components/list/columns/enum-column";
import { NumberColumn } from "@/components/list/columns/number-column";
import { StatusColumn } from "@/components/list/columns/status-column";
import { OnModalPrinter } from "@/modals/modal-printer";
import { CustomerColumn } from "@/modules/customers/components/customer-column";
import { EventType } from "@/modules/events/event-types";
import { t } from "@/modules/lang/lang-service";
import { getStaticQrCode, useBanks } from "@/modules/plugins/banks/banks.services";
import { OnReceiptDetailModal } from "@/modules/receipts/modals/modal-receipt-detail";
import { OnModalReceiptForm } from "@/modules/receipts/modals/modal-receipt-form";
import { ReceiptCard } from "@/modules/receipts/receipt-card";
import {
  receiptPaymentMethodOptions,
  receiptStatusOptions,
  receiptTypeOptions,
} from "@/modules/receipts/receipts-service";
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
import { Stack } from "@mantine/core";
import {
  IconArrowsDoubleSwNe,
  IconCalendarDown,
  IconCashRegister,
  IconCreditCard,
  IconPrinter,
} from "@tabler/icons-react";
import { WorkspaceBranchColumn } from "../workspace-branches/workspace-branch-column";
import { AppEntity } from "@/types";

export const ReceiptList: FC = () => {
  const workspace = useWorkspace();
  const banks = useBanks();
  const bank = banks.find((v) => workspace.settings.bankAccount?.bankId === v.id);
  const bankAccount = workspace.settings.bankAccount;

  return (
    <Stack p={16}>
      <List<ReceiptEntity>
        id="rps"
        name="receipts"
        limit={18}
        icon={IconCashRegister}
        route="/receipts"
        columns={{
          code: CodeColumn({
            onClick: (_, data) => OnReceiptDetailModal({ id: data.id }),
          }),
          workspaceBranchId: WorkspaceBranchColumn({ entity: AppEntity.RECEIPTS }),
          createdAt: DateTimeColumn({ name: "createdAt", isSortable: true, isHasFilter: true }),
          paidAt: DateTimeColumn({
            name: "paidAt",
            isSortable: true,
            isDefaultHide: true,
            isHasFilter: true,
            w: 200,
          }),
          expireAt: DateTimeColumn({
            name: "receipt_expireAt",
            isSortable: true,
            isDefaultHide: true,
            isHasFilter: true,
            w: 200,
          }),
          type: EnumColumn({
            icon: IconArrowsDoubleSwNe,
            options: Object.values(ReceiptType).map((type) => ({
              label: t(`receipt_type_${type}`),
              value: type,
              color: receiptTypeOptions[type].color,
              icon: receiptTypeOptions[type].icon,
            })),
          }),
          relatedCustomerId: CustomerColumn({
            name: "customer",
            valuePath: "relatedCustomer",
          }),
          cashierUserId: UserColumn({
            name: "cashierUser",
            valuePath: "cashierUser",
            optionalValuePath: "disbursementUser",
          }),
          status: StatusColumn({
            w: 180,
            options: Object.values(ReceiptStatus).map((status) => ({
              label: t(`receipt_status_${status}`),
              value: status,
              color: receiptStatusOptions[status].color,
            })),
          }),
          paymentMethod: EnumColumn({
            icon: IconCreditCard,
            w: 180,
            options: Object.values(ReceiptPaymentMethod).map((paymentMethod) => ({
              label: t(`payment_method_${paymentMethod}`),
              value: paymentMethod,
              color: receiptPaymentMethodOptions[paymentMethod].color,
              icon: receiptPaymentMethodOptions[paymentMethod].icon,
            })),
          }),
          amount: NumberColumn({ align: "right", isSortable: true, type: "money" }),
        }}
        filterModes={[
          {
            param: "today",
            name: t("today_entity", { entity: t("receipts") }),
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
            label: "print",
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
