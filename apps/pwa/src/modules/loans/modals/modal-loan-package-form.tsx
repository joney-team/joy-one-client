"use client";

import { Button } from "@/components/buttons/button";
import { ModalTitle } from "@/components/modal-title";
import { useFormSubmit } from "@/hooks/use-form";
import { useLoans } from "@/modules/loans/loans-context";
import { LoanAssetType, LoanPackage, LoanPackageType } from "@/modules/loans/loans-types";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { t } from "@lingui/core/macro";
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
import { loanAssetTypes, loanPackageTypes } from "../loans-constants";

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
      title={<ModalTitle title={t`Loan package`} icon={IconCoins} />}
      onClose={onClose}
      opened={opened}
      size="xl"
    >
      <Stack gap={16}>
        <TextInput
          withAsterisk
          label={t`Loan package code`}
          description={t`Loan package code must be at least 3 characters, no spaces`}
          placeholder={t`Enter loan package code`}
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
              label: loanPackageTypes[type].label(),
            }))}
            {...form.getInputProps("type")}
          />

          <Select
            label={t`Loan period`}
            placeholder={t`Select loan period`}
            data={[
              { label: t`1 month`, value: "30" },
              { label: t`2 months`, value: "60" },
              { label: t`3 months`, value: "90" },
              { label: t`6 months`, value: "180" },
              { label: t`9 months`, value: "270" },
              { label: t`12 months`, value: "360" },
            ]}
            {...form.getInputProps("days")}
            value={form.values.days?.toString()}
            onChange={(e) => form.setFieldValue("days", e ? +e : 30)}
          />

          <NumberInput
            label={t`Contract fee`}
            placeholder={t`Enter contract fee`}
            {...form.getInputProps("contractFee")}
            rightSection={<Text>{workspace.settings.currencyCode}</Text>}
          />
        </SimpleGrid>

        <MultiSelect
          label={t`Asset types`}
          placeholder={t`Select asset types`}
          value={form.values.assetTypes}
          data={Object.values(LoanAssetType).map((type) => ({
            value: type,
            label: loanAssetTypes[type].label(),
          }))}
          {...form.getInputProps("assetTypes")}
        />

        <MultiSelect
          label={t`Payment period options`}
          placeholder={t`Select payment period options`}
          data={[
            { label: t`10 days`, value: "10" },
            { label: t`15 days`, value: "15" },
            { label: t`30 days (1 month)`, value: "30" },
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
                    ? t`The total capital rate must be 100% or 0%`
                    : undefined;

                return (
                  <InputWrapper
                    key={i}
                    label={t`Capital rate for each period ${days} days`}
                    description={t`Leave blank if the capital rate for each period is the same`}
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
                                {t`Period`} {j + 1}
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

        <InputWrapper label={t`Late interest`}>
          <Stack gap={10} mt={5}>
            <SimpleGrid cols={{ md: 3 }}>
              {form.values.lateInterestRates.map((v, i) => {
                return (
                  <Card key={i} p={5} withBorder shadow="none">
                    <Group wrap="nowrap" gap={5} align="start">
                      <NumberInput
                        mt={-5}
                        label={t`Late days`}
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
                        label={t`Late interest rate`}
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
                  {t`Add`}
                </Button>
              </Group>
            </SimpleGrid>
          </Stack>
        </InputWrapper>

        <NumberInput
          label={t`Liquidation fee rate, calculated on the remaining debt (0 - 100)`}
          rightSection={<Text>%</Text>}
          {...form.getInputProps("liquidationFeeRate")}
        />

        <Textarea label={t`Description`} {...form.getInputProps("description")} />

        <Button onClick={submitting.handle} loading={submitting.isSubmitting} mt={10}>
          {props?.loanPackage ? t`Update` : t`Create`}
        </Button>
      </Stack>
    </Modal>
  );
};
