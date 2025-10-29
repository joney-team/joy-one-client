"use client";

import { Button } from "@/components/buttons/button";
import { CurrencyFormat } from "@/components/format/currency-format";
import { NumberFormat } from "@/components/format/number-format";
import { loanAssetTypes, loanPackageTypes } from "@/modules/loans/loans-constants";
import { loanPackageTypeColors, renderLoanPeriod } from "@/modules/loans/loans-service";
import { OnModalLoanPackageForm } from "@/modules/loans/modals/modal-loan-package-form";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { Anchor, Badge, Card, Group, SimpleGrid, Stack, Text, TextProps } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { FC } from "react";

export const WorkspacetSettingLoans: FC = () => {
  const workspace = useWorkspace();

  return (
    <Stack>
      <SimpleGrid cols={{ md: 2 }}>
        {workspace.settings.loanSettings?.loanPackages?.map((pkg, index) => {
          const totalMonth = pkg.days / 30;

          return (
            <Card
              key={index + pkg.id}
              shadow="none"
              withBorder
              style={{ cursor: "pointer" }}
              onClick={() => OnModalLoanPackageForm({ loanPackage: pkg })}
            >
              <Stack>
                <Stack gap={5}>
                  <Anchor fw={600}>{pkg.id}</Anchor>

                  <RowInfo
                    label={t`Asset types`}
                    value={pkg.assetTypes.map((v) => loanAssetTypes[v].label()).join(", ")}
                  />

                  <RowInfo
                    label={t`Loan package type`}
                    value={
                      <Badge color={loanPackageTypeColors[pkg.type]}>
                        {loanPackageTypes[pkg.type].label()}
                      </Badge>
                    }
                  />

                  <RowInfo
                    label={t`Loan period`}
                    value={
                      <Text flex={1} ta="right">
                        <NumberFormat value={totalMonth} /> <Trans>months</Trans>
                      </Text>
                    }
                  />
                  <RowInfo
                    label={t`Contract fee`}
                    value={
                      <Text flex={1} ta="right">
                        <CurrencyFormat value={pkg.contractFee} />
                      </Text>
                    }
                  />

                  <RowInfo
                    label={t`Payment period`}
                    value={pkg.periodDaysOptions.map((v) => renderLoanPeriod(v)).join(", ")}
                  />

                  <RowInfo
                    label={t`Liquidation fee rate`}
                    value={
                      pkg.liquidationFeeRate ? (
                        <Text flex={1} ta="right">
                          <NumberFormat value={pkg.liquidationFeeRate} suffix="%" />
                        </Text>
                      ) : (
                        <Text flex={1} ta="right">
                          <Trans>No</Trans>
                        </Text>
                      )
                    }
                  />
                </Stack>
              </Stack>
            </Card>
          );
        })}

        <Group>
          <Button onClick={() => OnModalLoanPackageForm({})} variant="subtle" leftIcon={IconPlus}>
            <Trans>Add loan package</Trans>
          </Button>
        </Group>
      </SimpleGrid>
    </Stack>
  );
};

const RowInfo: FC<{
  label: string;
  value: string | JSX.Element;
  valueProps?: TextProps;
}> = (props) => {
  return (
    <Group justify="space-between" wrap="nowrap" align="start">
      <Text fw={500} flex={1}>
        {props.label}
      </Text>
      {typeof props.value === "string" ? (
        <Text ta="right" flex={1} {...props.valueProps}>
          {props.value}
        </Text>
      ) : (
        props.value
      )}
    </Group>
  );
};
