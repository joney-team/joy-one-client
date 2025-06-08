import { Button } from "@/components/buttons/button";
import { OnModalLoanPackageForm } from "@/modules/loans/modals/modal-loan-package-form";
import { num, t } from "@/modules/lang/lang-service";
import { loanPackageTypeColors, renderLoanPeriod } from "@/modules/loans/loans-service";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { StringUtils } from "@/utils/string.utils";
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
                    label="Tài sản"
                    value={pkg.assetTypes
                      .map((v) =>
                        StringUtils.capitalizeFirstLetter(`${t(`loan_asset_type_${v}`)}`.replace("Đăng ký", "").trim())
                      )
                      .join(", ")}
                  />

                  <RowInfo
                    label="Loại"
                    value={<Badge color={loanPackageTypeColors[pkg.type]}>{t(`loan_package_${pkg.type}`)}</Badge>}
                  />

                  <RowInfo label="Hạn vay" value={`${num(totalMonth)} tháng`} />
                  <RowInfo label="Phí (CPV)" value={num(pkg.contractFee, { type: "money" })} />

                  <RowInfo
                    label="Kỳ thanh toán"
                    value={pkg.periodDaysOptions.map((v) => renderLoanPeriod(v)).join(", ")}
                  />

                  <RowInfo
                    label="Phí tất toán"
                    value={pkg.liquidationFeeRate ? `${num(pkg.liquidationFeeRate)}%` : "Không có"}
                  />
                </Stack>
              </Stack>
            </Card>
          );
        })}

        <Group>
          <Button onClick={() => OnModalLoanPackageForm({})} variant="subtle" leftIcon={IconPlus}>
            Thêm gói vay
          </Button>
        </Group>
      </SimpleGrid>
    </Stack>
  );
};

const RowInfo: FC<{
  label: string;
  value: any;
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
