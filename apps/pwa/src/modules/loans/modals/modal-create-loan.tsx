"use client";

import { Button } from "@/components/buttons/button";
import { Empty } from "@/components/empty";
import { LoanAssetDataInput } from "@/components/inputs/loan-asset-data-inputs";
import { ModalTitle } from "@/components/modal-title";
import { Renderer } from "@/components/renderer";
import { useFormSubmit } from "@/hooks/use-form";
import { useRouter } from "@/hooks/use-router";
import { getCustomerKyc } from "@/modules/customer-kycs/customer-kycs-service";
import { CustomerKycEntity } from "@/modules/customer-kycs/customer-kycs-types";
import { CustomerCard } from "@/modules/customers/customer-card";
import { CustomerInput } from "@/modules/customers/customer-input";
import { CustomerKycCard } from "@/modules/customers/customer-kyc-card";
import { CustomerShortInfo } from "@/modules/customers/customer-types";
import { t } from "@/modules/lang/lang-service";
import { CreateLoanDto } from "@/modules/loans/loan-dtos";
import { createLoan, getLoans, renderLoanPeriod } from "@/modules/loans/loans-service";
import { LoanAssetType } from "@/modules/loans/loans-types";
import { getGeolocation } from "@/modules/locations/locations-service";
import { useBanks } from "@/modules/plugins/banks/banks.services";
import { renderBankSelectOption } from "@/modules/workspaces/components/workspace-bank-information";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { WorkspaceBranchInput } from "@/modules/workspace-branches/workspace-branch-input";
import { onError } from "@/utils/exceptions.utils";
import {
  Card,
  em,
  Group,
  InputWrapper,
  Modal,
  NumberInput,
  Select,
  SimpleGrid,
  Skeleton,
  Stack,
  Text,
  ThemeIcon,
  TextInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import {
  Icon,
  IconArrowsExchange,
  IconBuildingSkyscraper,
  IconCheck,
  IconCreditCardPay,
  IconFileDots,
  IconPlus,
  IconUser,
  IconUserScan,
} from "@tabler/icons-react";
import { FC, Fragment, PropsWithChildren, useState } from "react";
import { OnModalRegisterCustomerKyc } from "@/modules/customer-kycs/modal-register-customer-kyc";

interface ModalCreateLoanProps {
  customer?: CustomerShortInfo;
}

export let OnModalCreateLoan: (props?: ModalCreateLoanProps) => void = () => {};

export const ModalCreateLoan: FC = () => {
  const banks = useBanks();
  const router = useRouter();
  const workspace = useWorkspace();

  const [opened, { open, close }] = useDisclosure(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isFetchingCustomerKyc, setIsFetchingCustomerKyc] = useState(false);

  const [customer, setCustomer] = useState<CustomerShortInfo>();
  const [customerKyc, setCustomerKyc] = useState<CustomerKycEntity>();

  const onClose = async () => close();

  const form = useForm({
    initialValues: {
      amount: 0,
      assetType: Object.values(LoanAssetType)[0],
      assetData: {},
      signature: "",
      payment_accountName: "",
      payment_accountNumber: "",
      payment_accountBankId: "",
      workspaceBranch: workspace.defaultBranch,
    } as any,
    validate: {
      amount: (value) => {
        if (!value) return "Vui lòng nhập số tiền vay";
        if (value < 1000000) return "Số tiền vay tối thiểu là 1,000,000 VND";
      },
      assetType: (value) => {
        if (!value) return "Vui lòng chọn loại tài sản";
      },
      assetData: (value) => {
        if (!value) return "Vui lòng nhập thông tin tài sản";
      },
      payment_accountName: (value) => {
        if (!value) return "Vui lòng nhập tên tài khoản";
      },
      payment_accountNumber: (value) => {
        if (!value) return "Vui lòng nhập số tài khoản";
      },
      payment_accountBankId: (value) => {
        if (!value) return "Vui lòng chọn ngân hàng";
      },
      packageDays: (value) => {
        if (!value) return "Vui lòng chọn thời hạn vay";
      },
    },
  });

  const initialize = async (p?: ModalCreateLoanProps) => {
    if (!p?.customer) return;

    setIsFetchingCustomerKyc(true);

    const [kyc, previousLoan] = await Promise.all([
      getCustomerKyc(p.customer._id).catch(() => undefined),
      getLoans({ customerId: p.customer._id, limit: 1 }).then((res) => res.data[0]),
    ]);

    setCustomerKyc(kyc);
    setCustomer(p.customer);
    form.setFieldValue("workspaceBranch", previousLoan?.workspaceBranch || workspace.defaultBranch);

    setIsFetchingCustomerKyc(false);
  };

  OnModalCreateLoan = async (p) => {
    setIsInitialized(false);
    setCustomer(p?.customer);
    form.reset();
    open();

    initialize(p)
      .then(() => setIsInitialized(true))
      .catch((error) => {
        onError(error);
        close();
      });
  };

  const loanPackages = workspace.settings?.loanSettings?.loanPackages || [];

  const assetTypeOptions = loanPackages.reduce((output, p) => {
    return Array.from([...(new Set([...output, ...p.assetTypes]) as any)]);
  }, [] as LoanAssetType[]);

  const packageDaysOptions = loanPackages.reduce((output, p) => {
    if (form.values.assetType && p.assetTypes.includes(form.values.assetType)) {
      output = Array.from([...(new Set([...output, p.days]) as any)]);
    }

    return output;
  }, [] as number[]);

  const packagePeriodDaysOptions = loanPackages.reduce((output, p) => {
    if (
      form.values.assetType &&
      p.assetTypes.includes(form.values.assetType) &&
      form.values.packageDays &&
      p.days === form.values.packageDays
    ) {
      return p.periodDaysOptions;
    }
    return output;
  }, [] as number[]);

  const submit = useFormSubmit(form, {
    onSubmit: async (values) => {
      if (!customer) return;
      const location = await getGeolocation();
      const loanPackage = loanPackages.find(
        (p) => p.assetTypes.includes(values.assetType) && p.days === values.packageDays
      );
      if (!loanPackage) return;

      let dto: CreateLoanDto = {
        workspaceBranchId: values.workspaceBranch?._id,
        customerId: customer._id,
        amount: values.amount,
        assetType: values.assetType,
        packageId: loanPackage.id,
        packagePeriodDays: values.packagePeriodDays,
        assetData: values.assetData,
        payment: {
          accountName: values.payment_accountName,
          accountNumber: values.payment_accountNumber,
          accountBankId: values.payment_accountBankId,
        },
        coord: {
          lat: location.coords.latitude,
          lng: location.coords.longitude,
        },
      };

      // Submit
      const loan = await createLoan(dto);
      await router.push(`/loans/${loan.code}`);
      close();
    },
    onError,
  });

  return (
    <Modal
      title={<ModalTitle title={`${t("create")} ${t("loan")}`} icon={IconCreditCardPay} />}
      onClose={onClose}
      opened={opened}
      size={1000}
      closeOnEscape={false}
    >
      <Stack gap={16}>
        {(function () {
          if (!isInitialized) return <Skeleton height={150} />;

          return (
            <Fragment>
              <Renderer visible={workspace.isShouldEnableBranches}>
                <Session name={t("branch")} icon={IconBuildingSkyscraper}>
                  <WorkspaceBranchInput
                    value={form.values.workspaceBranch}
                    onChange={(branch) => form.setFieldValue("workspaceBranch", branch)}
                  />
                </Session>
              </Renderer>

              <Session name={t("customer")} icon={IconUser}>
                <CustomerInput
                  value={customer}
                  onSelect={(c) => initialize({ customer: c })}
                  renderValue={(ctx) => {
                    if (ctx.value)
                      return (
                        <Stack gap={8}>
                          <CustomerCard
                            customer={ctx.value}
                            withBorder={false}
                            shadow="none"
                            p={0}
                            radius={0}
                            style={{ overflow: "visible" }}
                            disableClick
                          />

                          <Group>
                            <Button
                              size="compact-sm"
                              color="gray.5"
                              fz={em(14)}
                              leftIcon={IconArrowsExchange}
                              variant="outline"
                              onClick={ctx.toggle}
                            >
                              {t("change")} {t("customer").toString().toLowerCase()}
                            </Button>
                          </Group>
                        </Stack>
                      );

                    return (
                      <Button leftIcon={IconPlus} variant="outline" onClick={ctx.toggle}>
                        {t("add")} {t("customer_information").toString().toLowerCase()}
                      </Button>
                    );
                  }}
                />
              </Session>

              <Session name="KYC" icon={IconUserScan}>
                {(function () {
                  if (!customer)
                    return (
                      <Empty
                        hideBorder
                        message={`${t("need")} ${t("customer_information").toLowerCase()}`}
                      />
                    );
                  if (isFetchingCustomerKyc) return <Skeleton height={50} />;
                  if (customerKyc)
                    return (
                      <CustomerKycCard
                        kyc={customerKyc}
                        hideCustomer
                        cardProps={{ p: 0, withBorder: false }}
                        onApproved={(kyc) => setCustomerKyc(kyc)}
                      />
                    );

                  return (
                    <Group>
                      <Button
                        leftIcon={IconPlus}
                        variant="outline"
                        onClick={() =>
                          OnModalRegisterCustomerKyc({
                            customer,
                            onDone: async () => initialize({ customer }),
                          })
                        }
                      >
                        {t("add")} KYC
                      </Button>
                    </Group>
                  );
                })()}
              </Session>

              <Session name={t("loan_information")} icon={IconCreditCardPay}>
                {(function () {
                  if (!customer || !customerKyc)
                    return (
                      <Empty
                        hideBorder
                        message={`${t("need")} ${t("customer_information")} ${t("and")} KYC`}
                      />
                    );
                  return (
                    <Stack>
                      <SimpleGrid cols={{ md: 3 }}>
                        <Select
                          label={t("asset_type")}
                          data={assetTypeOptions.map((type) => ({
                            value: type,
                            label: t(`loan_asset_type_${type}`),
                          }))}
                          {...form.getInputProps("assetType")}
                        />

                        <Select
                          label={t("loan_period")}
                          data={packageDaysOptions.map((d) => ({
                            value: d.toString(),
                            label: renderLoanPeriod(d),
                          }))}
                          {...form.getInputProps("packageDays")}
                          value={form.values.packageDays?.toString()}
                          onChange={(value) => form.setFieldValue("packageDays", +value!)}
                        />

                        <Select
                          label={t("loan_payment_periods")}
                          data={packagePeriodDaysOptions.map((d) => ({
                            value: d.toString(),
                            label: renderLoanPeriod(d),
                          }))}
                          {...form.getInputProps("packagePeriodDays")}
                          value={form.values.packagePeriodDays?.toString()}
                          onChange={(value) => form.setFieldValue("packagePeriodDays", +value!)}
                        />
                      </SimpleGrid>

                      <NumberInput
                        label={t("loan_amount")}
                        hideControls
                        {...form.getInputProps("amount")}
                      />

                      <InputWrapper label={t("loan_payment_account")}>
                        <Card withBorder p={8}>
                          <SimpleGrid cols={{ md: 3 }}>
                            <Select
                              placeholder={t("select_bank")}
                              searchable
                              data={banks.map((v) => ({
                                value: v.id.toString(),
                                label: `${v.shortName}`,
                                name: v.name,
                                logo: v.logo,
                              }))}
                              {...form.getInputProps("payment_accountBankId")}
                              value={form.values.payment_accountBankId?.toString()}
                              onChange={(value) =>
                                form.setFieldValue("payment_accountBankId", +value!)
                              }
                              renderOption={renderBankSelectOption}
                            />

                            <TextInput
                              placeholder={t("bank_account_number")}
                              {...form.getInputProps("payment_accountNumber")}
                            />

                            <TextInput
                              placeholder={t("bank_account_name")}
                              {...form.getInputProps("payment_accountName")}
                            />
                          </SimpleGrid>
                        </Card>
                      </InputWrapper>
                    </Stack>
                  );
                })()}
              </Session>

              {form.values.assetType && !!customerKyc && (
                <Session name={t("loan_asset_data")} icon={IconFileDots}>
                  <LoanAssetDataInput
                    assetType={form.values.assetType}
                    value={form.values.assetData}
                    onChange={(value) => form.setFieldValue("assetData", value)}
                  />
                </Session>
              )}

              <Group mt={10} justify="center">
                <Button
                  onClick={submit.handle}
                  type="submit"
                  miw={300}
                  maw="100%"
                  leftIcon={IconCheck}
                >
                  {t("complete")}
                </Button>
              </Group>
            </Fragment>
          );
        })()}
      </Stack>
    </Modal>
  );
};

const Session: FC<PropsWithChildren<{ name: string; icon: Icon }>> = (props) => {
  return (
    <Stack gap={5}>
      <Group gap={3}>
        <ThemeIcon variant="transparent" radius={100}>
          <props.icon size={20} />
        </ThemeIcon>
        <Text fw={500}>{props.name}</Text>
      </Group>

      <Card withBorder p={10} style={{ overflow: "visible" }}>
        {props.children}
      </Card>
    </Stack>
  );
};
