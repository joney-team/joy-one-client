"use client";

import { Badge } from "@/components/badge";
import { Button } from "@/components/buttons/button";
import { CurrencyFormat } from "@/components/format/currency-format";
import { NumberFormat } from "@/components/format/number-format";
import { loanAssetTypes, loanPackageTypes } from "@/modules/loans/loans-constants";
import { renderLoanPeriod } from "@/modules/loans/loans-service";
import { ModalLoanPackageForm } from "@/modules/loans/modals/modal-loan-package-form";
import { Trans, useLingui } from "@lingui/react/macro";
import { Anchor, Card, Group, SimpleGrid, Stack, Text, TextProps } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { FC, ReactNode } from "react";
import { useWorkspaceSetting } from "../hooks/use-workspace-setting";

export const WorkspacetSettingLoans: FC = () => {
  const { workspaceSetting } = useWorkspaceSetting();
  const { t } = useLingui();

  return (
    <ModalLoanPackageForm>
      {(open) => (
        <Stack>
          <SimpleGrid cols={{ md: 2 }}>
            {workspaceSetting?.loanSettings?.loanPackages?.map((pkg, index) => {
              const totalMonth = pkg.days / 30;

              return (
                <Card
                  key={index + pkg.id}
                  shadow="none"
                  withBorder
                  style={{ cursor: "pointer" }}
                  onClick={() => open({ loanPackage: pkg })}
                >
                  <Stack>
                    <Stack gap={5}>
                      <Anchor fw={600}>{pkg.id}</Anchor>

                      <RowInfo
                        label={<Trans>Asset types</Trans>}
                        value={pkg.assetTypes.map((v) => t(loanAssetTypes[v].label)).join(", ")}
                      />

                      <RowInfo
                        label={<Trans>Loan package type</Trans>}
                        value={
                          <Badge color={loanPackageTypes[pkg.type].color}>
                            {t(loanPackageTypes[pkg.type].label)}
                          </Badge>
                        }
                      />

                      <RowInfo
                        label={<Trans>Loan period</Trans>}
                        value={
                          <Text flex={1} ta="right">
                            <NumberFormat value={totalMonth} /> <Trans>months</Trans>
                          </Text>
                        }
                      />
                      <RowInfo
                        label={<Trans>Contract fee</Trans>}
                        value={
                          <Text flex={1} ta="right">
                            <CurrencyFormat value={pkg.contractFee} />
                          </Text>
                        }
                      />

                      <RowInfo
                        label={<Trans>Payment period</Trans>}
                        value={pkg.periodDaysOptions.map((v) => renderLoanPeriod(v)).join(", ")}
                      />

                      <RowInfo
                        label={<Trans>Liquidation fee rate</Trans>}
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
              <Button onClick={() => open({})} variant="subtle" leftIcon={IconPlus}>
                <Trans>Add loan package</Trans>
              </Button>
            </Group>
          </SimpleGrid>
        </Stack>
      )}
    </ModalLoanPackageForm>
  );
};

const RowInfo: FC<{
  label: ReactNode;
  value: ReactNode;
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
