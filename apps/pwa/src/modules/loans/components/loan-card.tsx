"use client";

import { useRouter } from "@/hooks/use-router";
import { renderDateTime, num, tl } from "@/modules/lang/lang-service";
import { loanStatusColors } from "@/modules/loans/loans-service";
import { LoanEntity, LoanStatus } from "@/modules/loans/loans-types";
import { WorkspacePermission } from "@/modules/workspace-roles/workspace-roles-types";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { renderEntityCode } from "@/modules/workspaces/utils";
import { Anchor, Badge, Card, CardProps, em, Group, Stack, Text } from "@mantine/core";
import { IconFileTypePdf } from "@tabler/icons-react";
import { FC, Fragment } from "react";

interface LoanCardProps {
  loan: LoanEntity;
  hideCustomer?: boolean;
  cardProps?: CardProps;
}

export const LoanCard: FC<LoanCardProps> = (props) => {
  const workspace = useWorkspace();
  const { loan } = props;
  const customer = loan.customer;
  const router = useRouter();

  const linkContractPdf =
    loan.status !== LoanStatus.PENDING_SIGN && !!workspace.settings.loanSettings?.contractPdfUrl
      ? workspace.settings.loanSettings?.contractPdfUrl?.replace("{code}", loan.code)
      : undefined;

  return (
    <Card className="LoanCard" shadow="xs" {...props.cardProps}>
      <Stack align="stretch">
        <Group justify="space-between">
          <Anchor onClick={() => router.push(`/loans/${loan.code}`)} fw={500}>
            {renderEntityCode(loan.code)}
          </Anchor>

          <Text fz={em(12)} c="gray">
            {renderDateTime(loan.createdAt, true)}
          </Text>
        </Group>

        {!props.hideCustomer && (
          <Fragment>
            <Group justify="space-between">
              <Text fz={em(15)}>{tl("customer")}</Text>
              <Anchor fw={500} onClick={() => router.push(`/customers/${customer.code}`)}>
                {customer.name}
              </Anchor>
            </Group>

            {customer.phone &&
              workspace.hasPermission(WorkspacePermission.CUSTOMERS_VIEW_CONTACT) && (
                <Group justify="space-between">
                  <Text fz={em(15)}>{tl("phone")}</Text>
                  <Text fz={em(15)} fw={500}>
                    {customer.phone}
                  </Text>
                </Group>
              )}
          </Fragment>
        )}

        <Group justify="space-between">
          <Text fz={em(15)}>{tl("loan_asset_type")}</Text>
          <Text fz={em(15)} fw={500}>
            {tl(`loan_asset_type_${loan.assetType}`)}
          </Text>
        </Group>

        <Group justify="space-between">
          <Text fz={em(15)}>{tl("loan_asset_type")}</Text>
          <Text fz={em(15)} fw={500}>
            {tl(`loan_asset_type_${loan.assetType}`)}
          </Text>
        </Group>

        <Group justify="space-between">
          <Text fz={em(15)}>{tl("loan_amount")}</Text>
          <Text fz={em(15)} fw={500}>
            {num(loan.amount, { type: "money" })}
          </Text>
        </Group>

        <Stack align="end">
          <Badge color={loanStatusColors[loan.status]}>{tl(`loan_status_${loan.status}`)}</Badge>

          {loan.status === LoanStatus.REJECTED && (
            <Text fz={em(13)} fw={500} c="red">
              {tl("reason")}: {loan.rejectReason || "Không rõ lý do"}
            </Text>
          )}
        </Stack>

        <Group justify="end">
          {linkContractPdf && (
            <Anchor href={linkContractPdf} target="_blank" fz={14}>
              <Group gap={4}>
                <IconFileTypePdf size={18} />
                {tl("view_contract")}
              </Group>
            </Anchor>
          )}
        </Group>
      </Stack>
    </Card>
  );
};
