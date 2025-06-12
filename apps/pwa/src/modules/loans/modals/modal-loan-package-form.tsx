"use client";

import { Button } from "@/components/buttons/button";
import { ModalTitle } from "@/components/modal-title";
import { useFormSubmit } from "@/hooks/use-form";
import { t } from "@/modules/lang/lang-service";
import { useLoans } from "@/modules/loans/loans-context";
import { LoanAssetType, LoanPackage, LoanPackageType } from "@/modules/loans/loans-types";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import {
  ActionIcon,
  Card,
  em,
  Group,
  InputWrapper,
  Modal,
  MultiSelect,
  NumberInput,
  Select,
  SimpleGrid,
  Stack,
  Text,
  Textarea,
  TextInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { IconCoins, IconPlus, IconX } from "@tabler/icons-react";
import { FC, Fragment, useState } from "react";

interface ModalLoanPackageFormProps {
  loanPackage?: LoanPackage;
}

export let OnModalLoanPackageForm: (props: ModalLoanPackageFormProps) => any = () => {};

export const ModalLoanPackageForm: FC = () => {
  const [opened, { open, close }] = useDisclosure(false);
  const loans = useLoans();
  const workspace = useWorkspace();
  const [props, setProps] = useState<ModalLoanPackageFormProps>();

  const form = useForm<LoanPackage>({
    initialValues: {
      assetTypes: [],
      periodDaysOptions: [],
      lateInterestRates: [],
      unFixedCapitalRates: [],
    } as any,
    validate: {
      id: (value) => {
        if (!value) return "Mã gói vay không được để trống";
        if (value.length < 3) return "Mã gói vay phải có ít nhất 3 ký tự";
        const existed = workspace.settings.loanSettings?.loanPackages?.find((p) => p.id === value);
        if (existed && existed !== props?.loanPackage) return "Mã gói vay đã tồn tại";
      },
      assetTypes: (value) => {
        if (!value.length) return "Chọn ít nhất 1 loại tài sản";
      },
      periodDaysOptions: (value) => {
        if (!value.length) return "Chọn ít nhất 1 kỳ thanh toán";
      },
    },
  });

  OnModalLoanPackageForm = (p) => {
    setProps(p);
    if (p.loanPackage) {
      form.setValues(p.loanPackage);
    }
    open();
  };

  const onClose = async () => {
    if (props?.loanPackage) form.reset();
    close();
  };

  const submitting = useFormSubmit(form, {
    onSubmit: async (values) => {
      let loanPackages = workspace.settings.loanSettings?.loanPackages || [];

      if (props?.loanPackage) {
        loanPackages = loanPackages.map((p) => (p.id === props.loanPackage?.id ? values : p));
      } else {
        loanPackages.push(values);
      }

      await workspace.setSettings(
        {
          ...workspace.settings,
          loanSettings: {
            ...workspace.settings.loanSettings,
            loanPackages,
          },
        },
        true
      );

      close();
    },
  });

  if (!loans.isInitialized || !loans.assetEstimations) return null;

  return (
    <Modal
      title={<ModalTitle title={t("loan_package")} icon={IconCoins} />}
      onClose={onClose}
      opened={opened}
      size="xl"
    >
      <Stack gap={16}>
        <TextInput
          withAsterisk
          label="Mã gói vay"
          description="Mã gói vay phải có ít nhất 3 ký tự, không chứa khoảng trắng"
          placeholder="Nhập mã gói vay"
          {...form.getInputProps("id")}
          onChange={(e) => form.setFieldValue("id", e.target.value.toUpperCase().trim())}
        />

        <SimpleGrid cols={{ md: 3 }}>
          <Select
            label="Loại"
            placeholder="Chọn loại"
            value={form.values.type}
            data={Object.values(LoanPackageType).map((type) => ({
              value: type,
              label: t(`loan_package_${type}`),
            }))}
            {...form.getInputProps("type")}
          />

          <Select
            label="Thời gian vay"
            placeholder="Chọn thời gian vay"
            data={[
              { label: "1 tháng", value: "30" },
              { label: "2 tháng", value: "60" },
              { label: "3 tháng", value: "90" },
              { label: "6 tháng", value: "180" },
              { label: "9 tháng", value: "270" },
              { label: "12 tháng", value: "360" },
            ]}
            {...form.getInputProps("days")}
            value={form.values.days?.toString()}
            onChange={(e) => form.setFieldValue("days", e ? +e : 30)}
          />

          <NumberInput
            label="Phí (CPV)"
            placeholder="Nhập phí vay"
            {...form.getInputProps("contractFee")}
            rightSection={<Text>đ</Text>}
          />
        </SimpleGrid>

        <MultiSelect
          label="Loại tài sản"
          placeholder="Chọn loại tài sản"
          value={form.values.assetTypes}
          data={Object.values(LoanAssetType).map((type) => ({
            value: type,
            label: t(`loan_asset_type_${type}`),
          }))}
          {...form.getInputProps("assetTypes")}
        />

        <MultiSelect
          label="Kỳ thanh toán cho phép chọn"
          placeholder="Chọn tài sản"
          data={[
            { label: "10 ngày", value: "10" },
            { label: "15 ngày", value: "15" },
            { label: "30 ngày (1 tháng)", value: "30" },
          ]}
          {...form.getInputProps("periodDaysOptions")}
          value={form.values.periodDaysOptions.map((v) => v.toString())}
          onChange={(e) =>
            form.setFieldValue(
              "periodDaysOptions",
              e.map((v) => +v)
            )
          }
        />

        {form.values.type === LoanPackageType.UNFIXED_CAPITAL &&
          form.values.periodDaysOptions.length > 0 && (
            <Fragment>
              {form.values.periodDaysOptions.map((days, i) => {
                const totalPeriod = Math.ceil(form.values.days / days);

                const capitalRates = new Array(totalPeriod).fill(0).map((_, k) => {
                  if (!form.values.unFixedCapitalRates[i]) return 0;
                  return form.values.unFixedCapitalRates[i][k] || 0;
                });

                const totalPercent = capitalRates.reduce((a, b) => a + b, 0);
                const error =
                  totalPercent > 0 && totalPercent !== 100
                    ? "Tổng tỷ lệ trả gốc phải bằng 100% hoặc 0%"
                    : undefined;

                return (
                  <InputWrapper
                    key={i}
                    label={`Tỷ lệ trả gốc ở mỗi kỳ ${days} ngày`}
                    description="Để trống nếu tỷ lệ trả gốc ở mỗi kỳ giống nhau"
                    error={error}
                  >
                    <Group mt={8} mb={error ? 5 : 0}>
                      {capitalRates.map((v, j) => {
                        const onChange = (e: number) => {
                          let _unFixedCapitalRates = new Array(form.values.periodDaysOptions.length)
                            .fill([])
                            .map((_, k) => form.values.unFixedCapitalRates[k] || []);

                          _unFixedCapitalRates[i][j] = e;
                          form.setFieldValue("unFixedCapitalRates", _unFixedCapitalRates);
                        };

                        return (
                          <Card key={j} p={5} withBorder>
                            <Group gap={3} justify="stretch" maw={120} wrap="nowrap">
                              <Text w={40} fz={em(12)} pl={3}>
                                Kỳ {j + 1}
                              </Text>
                              <NumberInput
                                key={i}
                                flex={1}
                                hideControls
                                min={0}
                                max={100}
                                styles={{ input: { textAlign: "right" } }}
                                rightSection={<Text>%</Text>}
                                value={v}
                                onChange={(e) => onChange(+e)}
                              />
                            </Group>
                          </Card>
                        );
                      })}
                    </Group>
                  </InputWrapper>
                );
              })}
            </Fragment>
          )}

        <InputWrapper label="Phạt trả chậm">
          <Stack gap={10} mt={5}>
            <SimpleGrid cols={{ md: 3 }}>
              {form.values.lateInterestRates.map((v, i) => {
                return (
                  <Card key={i} p={5} withBorder shadow="none">
                    <Group wrap="nowrap" gap={5} align="start">
                      <NumberInput
                        mt={-5}
                        label="Số ngày chậm"
                        value={v.lateDays}
                        onChange={(e) => {
                          let _lateInterestRates = [...form.values.lateInterestRates];
                          _lateInterestRates[i].lateDays = +e;
                          form.setFieldValue("lateInterestRates", _lateInterestRates);
                        }}
                        flex={1}
                        hideControls
                      />

                      <NumberInput
                        mt={-5}
                        label="Tỷ lệ phạt"
                        min={0}
                        flex={1}
                        value={v.rate}
                        onChange={(e) => {
                          let _lateInterestRates = [...form.values.lateInterestRates];
                          _lateInterestRates[i].rate = +e;
                          form.setFieldValue("lateInterestRates", _lateInterestRates);
                        }}
                        hideControls
                        rightSection={<Text>%</Text>}
                      />

                      <ActionIcon
                        variant="subtle"
                        color="gray"
                        size="xs"
                        onClick={() => {
                          let _lateInterestRates = [...form.values.lateInterestRates];
                          _lateInterestRates.splice(i, 1);
                          form.setFieldValue("lateInterestRates", _lateInterestRates);
                        }}
                      >
                        <IconX size={18} />
                      </ActionIcon>
                    </Group>
                  </Card>
                );
              })}

              <Group>
                <Button
                  variant="light"
                  size="xs"
                  radius={100}
                  leftSection={<IconPlus size={18} style={{ marginRight: -5 }} />}
                  onClick={() => {
                    let _lateInterestRates = [...form.values.lateInterestRates];
                    _lateInterestRates.push({ rate: 1, lateDays: 1 });
                    form.setFieldValue("lateInterestRates", _lateInterestRates);
                  }}
                >
                  Thêm
                </Button>
              </Group>
            </SimpleGrid>
          </Stack>
        </InputWrapper>

        <NumberInput
          label="Phí tất toán hợp đồng, tính trên tổng dư nợ còn lại (0 - 100)"
          rightSection={<Text>%</Text>}
          {...form.getInputProps("liquidationFeeRate")}
        />

        <Textarea label="Mô tả" {...form.getInputProps("description")} />

        <Button onClick={submitting.handle} loading={submitting.isSubmitting} mt={10}>
          {t(props?.loanPackage ? "update" : "create")}
        </Button>
      </Stack>
    </Modal>
  );
};
