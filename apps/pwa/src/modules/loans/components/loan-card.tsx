"use client";

import { CurrencyFormat } from "@/components/format/currency-format";
import { DateFormat } from "@/components/format/date-format";
import { useRouter } from "@/hooks/use-router";
import { loanStatusColors } from "@/modules/loans/loans-service";
import { LoanEntity, LoanStatus } from "@/modules/loans/loans-types";
import { WorkspacePermission } from "@/modules/workspace-roles/workspace-roles-types";
import { useWorkspaceSetting } from "@/modules/workspace-settings/hooks/useWorkspaceSetting";
import { renderEntityCode } from "@/modules/workspaces/utils";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { Trans, useLingui } from "@lingui/react/macro";
import { Anchor, Badge, Card, CardProps, em, Group, Stack, Text } from "@mantine/core";
import { IconFileTypePdf } from "@tabler/icons-react";
import { FC, Fragment } from "react";
import { loanAssetTypes, loanStatuses } from "../loans-constants";

interface LoanCardProps {
  data: LoanEntity;
  hideCustomer?: boolean;
  cardProps?: CardProps;
}

export const LoanCard: FC<LoanCardProps> = (props) => {
  const { t } = useLingui();
  const workspace = useWorkspace();
  const { workspaceSetting } = useWorkspaceSetting();
  const { data: loan } = props;
  const customer = loan.customer;
  const router = useRouter();

  const linkContractPdf =
    loan.status !== LoanStatus.PENDING_SIGN && !!workspaceSetting?.loanSettings?.contractPdfUrl
      ? workspaceSetting?.loanSettings?.contractPdfUrl?.replace("{code}", loan.code)
      : undefined;

  return (
    <Card className="LoanCard" shadow="xs" {...props.cardProps}>
      <Stack align="stretch">
        <Group justify="space-between">
          <Anchor onClick={() => router.push(`/loans/${loan.code}`)} fw={500}>
            {renderEntityCode(loan.code)}
          </Anchor>

          <Text fz={em(12)} c="gray">
            <DateFormat value={loan.createdAt} type="date-time" />
          </Text>
        </Group>

        {!props.hideCustomer && (
          <Fragment>
            <Group justify="space-between">
              <Text fz={em(15)}>
                <Trans>Customer</Trans>
              </Text>
              <Anchor fw={500} onClick={() => router.push(`/customers/${customer.code}`)}>
                {customer.name}
              </Anchor>
            </Group>

            {customer.phone &&
              workspace.hasPermission(WorkspacePermission.CUSTOMERS_VIEW_CONTACT) && (
                <Group justify="space-between">
                  <Text fz={em(15)}>
                    <Trans>Phone</Trans>
                  </Text>
                  <Text fz={em(15)} fw={500}>
                    {customer.phone}
                  </Text>
                </Group>
              )}
          </Fragment>
        )}

        <Group justify="space-between">
          <Text fz={em(15)}>
            <Trans>Loan asset type</Trans>
          </Text>
          <Text fz={em(15)} fw={500}>
            {t(loanAssetTypes[loan.assetType].label)}
          </Text>
        </Group>

        <Group justify="space-between">
          <Text fz={em(15)}>
            <Trans>Loan amount</Trans>
          </Text>
          <Text fz={em(15)} fw={500}>
            <CurrencyFormat value={loan.amount} />
          </Text>
        </Group>

        <Stack align="end">
          <Badge color={loanStatusColors[loan.status]}>{t(loanStatuses[loan.status].label)}</Badge>

          {loan.status === LoanStatus.REJECTED && (
            <Text fz={em(13)} fw={500} c="red">
              {t`Reason`}: {loan.rejectReason || t`Unknown`}
            </Text>
          )}
        </Stack>

        <Group justify="end">
          {linkContractPdf && (
            <Anchor href={linkContractPdf} target="_blank" fz={14}>
              <Group gap={4}>
                <IconFileTypePdf size={18} />
                <Trans>View contract</Trans>
              </Group>
            </Anchor>
          )}
        </Group>
      </Stack>
    </Card>
  );
};
