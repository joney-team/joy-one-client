"use client";

import { Button } from "@/components/buttons/button";
import { Modal } from "@/components/modal/modal";
import { LoanAssetType } from "@/graphql/enums.graphql";
import { InputModalType, ModalInput } from "@/modals/modal-input";
import { FilesBox } from "@/modules/files/files-box";
import {
  LoanAssetEstimation,
  LoanAssetEstimationBrand,
  LoanAssetEstimationColor,
  LoanAssetEstimationModel,
} from "@/modules/loans/loans-types";
import { DateTime } from "@joy-one/utils/date-time";
import { Trans, useLingui } from "@lingui/react/macro";
import {
  ActionIcon,
  Group,
  InputWrapper,
  NumberInput,
  Select,
  SimpleGrid,
  Stack,
  TextInput,
} from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { IconCoins, IconPencil, IconPlus } from "@tabler/icons-react";
import { FC, Fragment, ReactNode, useState } from "react";
import { useLoanAssetEstimations } from "../hooks/use-loan-asset-estimations";
import { loanAssetTypes } from "../loans-constants";

interface ModalLoanAssetEstimationFormProps {
  estimation?: LoanAssetEstimation;
}

const initialValues: LoanAssetEstimation = {
  id: "",
  assetType: LoanAssetType.MotobikeRegistration,
  brandId: "",
  colorId: "",
  modelId: "",
  productManufacturingDate: undefined,
  productName: "",
  productImages: [],
  estimatePrice: undefined as any,
};

export const ModalLoanAssetEstimationForm: FC<{
  children: (open: (props?: ModalLoanAssetEstimationFormProps) => void) => ReactNode;
}> = ({ children }) => {
  const { t } = useLingui();
  const { setAssetEstimations, assetEstimations } = useLoanAssetEstimations();

  const [opened, { open, close }] = useDisclosure(false);
  const [props, setProps] = useState<ModalLoanAssetEstimationFormProps>();

  const form = useForm<LoanAssetEstimation>({
    initialValues: initialValues,
    validate: {
      assetType: (value) => {
        if (!value) return "Vui lòng chọn tài sản";
        return null;
      },
      brandId: (value) => {
        if (!value) return "Vui lòng chọn nhãn hiệu";
        return null;
      },
      estimatePrice: (value) => {
        if (!value) return "Vui lòng nhập giá trị ước lượng";
        return null;
      },
    },
  });

  const onClose = async () => {
    if (props?.estimation) form.reset();
    close();
  };

  const onSubmit = form.onSubmit(async (values) => {
    if (!assetEstimations) return;

    if (props?.estimation) {
      await setAssetEstimations({
        ...assetEstimations,
        estimations: assetEstimations.estimations.map((e) => {
          if (e.id === props.estimation!.id) return values;
          return e;
        }),
      });
    } else {
      await setAssetEstimations({
        ...assetEstimations,
        estimations: [
          ...assetEstimations.estimations,
          {
            ...values,
            id: assetEstimations.estimations.length.toString(),
          },
        ],
      });
    }

    close();
  });

  if (!assetEstimations) return null;

  return (
    <ModalInput>
      {(openInput) => (
        <Fragment>
          {children((p) => {
            setProps(p);
            if (p?.estimation) form.setValues(p.estimation);
            open();
          })}

          <Modal
            name={<Trans>Loan asset estimations</Trans>}
            icon={IconCoins}
            onClose={onClose}
            opened={opened}
            size="xl"
          >
            <Stack gap="md">
              <SimpleGrid cols={{ md: 2 }}>
                <Select
                  label={<Trans>Asset</Trans>}
                  placeholder={t`Select asset`}
                  data={[LoanAssetType.MotobikeRegistration, LoanAssetType.CarRegistration].map(
                    (type) => ({
                      value: type,
                      label: t(loanAssetTypes[type].label),
                    }),
                  )}
                  {...form.getInputProps("assetType")}
                  withAsterisk
                />

                <Group align="start" gap={10} wrap="nowrap">
                  <Select
                    withAsterisk
                    flex={1}
                    label={<Trans>Brand</Trans>}
                    placeholder={t`Select brand`}
                    data={assetEstimations.brands
                      .filter((v) => v.assetType === form.values.assetType)
                      .map((brand) => ({ value: brand.id, label: brand.name }))}
                    {...form.getInputProps("brandId")}
                    disabled={!form.values.assetType}
                  />

                  <Group gap={10} wrap="nowrap" mt={25}>
                    <ActionIcon
                      variant="outline"
                      color="gray.4"
                      size={36}
                      disabled={!form.values.brandId}
                      onClick={() =>
                        openInput({
                          title: <Trans>Update brand</Trans>,
                          label: <Trans>Brand name</Trans>,
                          type: InputModalType.TEXT,
                          value: assetEstimations.brands.find((v) => v.id === form.values.brandId)
                            ?.name,
                          onDone: (value: string) => {
                            setAssetEstimations({
                              ...assetEstimations,
                              brands: assetEstimations.brands.map((b) => {
                                if (b.id === form.values.brandId)
                                  return { ...b, name: value.trim() };
                                return b;
                              }),
                            });
                          },
                        })
                      }
                    >
                      <IconPencil size={18} />
                    </ActionIcon>

                    <ActionIcon
                      variant="outline"
                      color="gray.4"
                      size={36}
                      disabled={!form.values.assetType}
                      onClick={() =>
                        openInput({
                          type: InputModalType.TEXT,
                          title: <Trans>Create brand</Trans>,
                          label: <Trans>Brand name</Trans>,
                          onDone: (value: string) => {
                            const brand: LoanAssetEstimationBrand = {
                              assetType: form.values.assetType,
                              id: assetEstimations.brands.length.toString(),
                              name: value.trim(),
                            };
                            setAssetEstimations({
                              ...assetEstimations,
                              brands: [...assetEstimations.brands, brand],
                            });
                            form.setFieldValue("brandId", brand.id);
                          },
                        })
                      }
                    >
                      <IconPlus size={18} />
                    </ActionIcon>
                  </Group>
                </Group>

                <Group align="start" gap={10} wrap="nowrap">
                  <Select
                    flex={1}
                    label={<Trans>Model</Trans>}
                    placeholder={t`Select model`}
                    data={assetEstimations.models
                      .filter((v) => v.brandId === form.values.brandId)
                      .map((model) => ({ value: model.id, label: model.name }))}
                    {...form.getInputProps("modelId")}
                    disabled={!form.values.brandId}
                  />

                  <Group gap={10} mt={25} wrap="nowrap">
                    <ActionIcon
                      variant="outline"
                      color="gray.4"
                      size={36}
                      disabled={!form.values.modelId}
                      onClick={() =>
                        openInput({
                          type: InputModalType.TEXT,
                          title: <Trans>Update model</Trans>,
                          label: <Trans>Model name</Trans>,
                          value: assetEstimations.models.find((v) => v.id === form.values.modelId)
                            ?.name,
                          onDone: (value: string) => {
                            setAssetEstimations({
                              ...assetEstimations,
                              models: assetEstimations.models.map((b) => {
                                if (b.id === form.values.modelId)
                                  return { ...b, name: value.trim() };
                                return b;
                              }),
                            });
                          },
                        })
                      }
                    >
                      <IconPencil size={18} />
                    </ActionIcon>

                    <ActionIcon
                      variant="outline"
                      color="gray.4"
                      size={36}
                      disabled={!form.values.brandId}
                      onClick={() =>
                        openInput({
                          type: InputModalType.TEXT,
                          title: <Trans>Create model</Trans>,
                          label: <Trans>Model name</Trans>,
                          onDone: (value: string) => {
                            const model: LoanAssetEstimationModel = {
                              id: assetEstimations.models.length.toString(),
                              name: value.trim(),
                              brandId: form.values.brandId,
                            };
                            setAssetEstimations({
                              ...assetEstimations,
                              models: [...assetEstimations.models, model],
                            });
                            form.setFieldValue("modelId", model.id);
                          },
                        })
                      }
                    >
                      <IconPlus size={18} />
                    </ActionIcon>
                  </Group>
                </Group>

                <Group align="end" gap={10}>
                  <Select
                    flex={1}
                    label={<Trans>Color</Trans>}
                    placeholder={t`Select color`}
                    data={assetEstimations.colors
                      .filter((v) => v.brandId === form.values.brandId)
                      .map((color) => ({ value: color.id, label: color.name }))}
                    {...form.getInputProps("colorId")}
                    disabled={!form.values.brandId}
                  />

                  <ActionIcon
                    variant="outline"
                    color="gray.4"
                    size={36}
                    disabled={!form.values.colorId}
                    onClick={() =>
                      openInput({
                        type: InputModalType.TEXT,
                        title: <Trans>Update color</Trans>,
                        label: <Trans>Color name</Trans>,
                        value: assetEstimations.colors.find((v) => v.id === form.values.colorId)
                          ?.name,
                        onDone: (value: string) => {
                          setAssetEstimations({
                            ...assetEstimations,
                            colors: assetEstimations.colors.map((b) => {
                              if (b.id === form.values.colorId) return { ...b, name: value.trim() };
                              return b;
                            }),
                          });
                        },
                      })
                    }
                  >
                    <IconPencil size={18} />
                  </ActionIcon>

                  <ActionIcon
                    variant="outline"
                    color="gray.4"
                    size={36}
                    disabled={!form.values.brandId}
                    onClick={() =>
                      openInput({
                        type: InputModalType.TEXT,
                        title: <Trans>Create color</Trans>,
                        label: <Trans>Color name</Trans>,
                        onDone: (value: string) => {
                          const color: LoanAssetEstimationColor = {
                            id: assetEstimations.colors.length.toString(),
                            name: value.trim(),
                            brandId: form.values.brandId,
                          };
                          setAssetEstimations({
                            ...assetEstimations,
                            colors: [...assetEstimations.colors, color],
                          });
                          form.setFieldValue("colorId", color.id);
                        },
                      })
                    }
                  >
                    <IconPlus size={18} />
                  </ActionIcon>
                </Group>

                <DatePickerInput
                  label={<Trans>Product manufacturing year</Trans>}
                  level="decade"
                  value={
                    form.values.productManufacturingDate
                      ? new Date(form.values.productManufacturingDate * 1000)
                      : null
                  }
                  onYearSelect={(date) => {
                    if (!date) return null;
                    form.setFieldValue(
                      "productManufacturingDate",
                      DateTime.toSeconds(new Date(new Date(date).getFullYear(), 0, 1)),
                    );
                  }}
                  valueFormat="YYYY"
                />

                <TextInput
                  label={<Trans>Product name</Trans>}
                  {...form.getInputProps("productName")}
                />
              </SimpleGrid>

              <NumberInput
                withAsterisk
                label={<Trans>Estimate price</Trans>}
                hideControls
                {...form.getInputProps("estimatePrice")}
              />

              <InputWrapper label={<Trans>Product images</Trans>}>
                <FilesBox refs={[`loan-asset-estimations-${form.values.id}`]} autoUpload />
              </InputWrapper>

              <Button onClick={() => onSubmit()} loading={form.submitting} mt={10}>
                {props?.estimation ? <Trans>Update</Trans> : <Trans>Create</Trans>}
              </Button>
            </Stack>
          </Modal>
        </Fragment>
      )}
    </ModalInput>
  );
};
