"use client";

import { Button } from "@/components/buttons/button";
import { ModalTitle } from "@/components/modal-title";
import { useFormSubmit } from "@/hooks/use-form";
import { FilesBox } from "@/modules/files/files-box";
import { useLoans } from "@/modules/loans/loans-context";
import {
  LoanAssetEstimation,
  LoanAssetEstimationBrand,
  LoanAssetEstimationColor,
  LoanAssetEstimationModel,
  LoanAssetType,
} from "@/modules/loans/loans-types";
import { DateTime } from "@/utils/date-time.utils";
import { t } from "@lingui/core/macro";
import {
  ActionIcon,
  Group,
  InputWrapper,
  Modal,
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
import { FC, useState } from "react";
import { InputModalType, OnModalInput } from "../../../modals/modal-input";
import { loanAssetTypes } from "../loans-constants";

interface ModalLoanAssetEstimationFormProps {
  estimation?: LoanAssetEstimation;
}

const initialValues: LoanAssetEstimation = {
  id: "",
  assetType: LoanAssetType.MOTOBIKE_REGISTRATION,
  brandId: "",
  colorId: "",
  modelId: "",
  productManufacturingDate: undefined,
  productName: "",
  productImages: [],
  estimatePrice: undefined as any,
};

export let OnModalLoanAssetEstimationForm: (
  props: ModalLoanAssetEstimationFormProps
) => any = () => {};

export const ModalLoanAssetEstimationForm: FC = () => {
  const [opened, { open, close }] = useDisclosure(false);
  const loans = useLoans();
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

  OnModalLoanAssetEstimationForm = (p) => {
    setProps(p);
    if (p.estimation) form.setValues(p.estimation);
    open();
  };

  const onClose = async () => {
    if (props?.estimation) form.reset();
    close();
  };

  const submitting = useFormSubmit(form, {
    onSubmit: async (values) => {
      if (props?.estimation) {
        await loans.setAssetEstimations({
          ...loans.assetEstimations,
          estimations: loans.assetEstimations.estimations.map((e) => {
            if (e.id === props.estimation!.id) return values;
            return e;
          }),
        });
      } else {
        await loans.setAssetEstimations({
          ...loans.assetEstimations,
          estimations: [
            ...loans.assetEstimations.estimations,
            {
              ...values,
              id: loans.assetEstimations.estimations.length.toString(),
            },
          ],
        });
      }

      close();
    },
  });

  if (!loans.isInitialized || !loans.assetEstimations) return null;

  return (
    <Modal
      title={<ModalTitle title={t`Loan asset estimations`} icon={IconCoins} />}
      onClose={onClose}
      opened={opened}
      size="xl"
    >
      <Stack gap={16}>
        <SimpleGrid cols={{ md: 2 }}>
          <Select
            label={t`Asset`}
            placeholder={t`Select asset`}
            data={[LoanAssetType.MOTOBIKE_REGISTRATION, LoanAssetType.CAR_REGISTRATION].map(
              (type) => ({
                value: type,
                label: loanAssetTypes[type].label(),
              })
            )}
            {...form.getInputProps("assetType")}
            withAsterisk
          />

          <Group align="start" gap={10} wrap="nowrap">
            <Select
              withAsterisk
              flex={1}
              label={t`Brand`}
              placeholder={t`Select brand`}
              data={loans.assetEstimations.brands
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
                  OnModalInput({
                    title: t`Update brand`,
                    type: InputModalType.TEXT,
                    label: t`Brand name`,
                    value: loans.assetEstimations.brands.find((v) => v.id === form.values.brandId)
                      ?.name,
                    onDone: (value: string) => {
                      loans.setAssetEstimations({
                        ...loans.assetEstimations,
                        brands: loans.assetEstimations.brands.map((b) => {
                          if (b.id === form.values.brandId) return { ...b, name: value.trim() };
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
                  OnModalInput({
                    title: t`Create brand`,
                    type: InputModalType.TEXT,
                    label: t`Brand name`,
                    onDone: (value: string) => {
                      const brand: LoanAssetEstimationBrand = {
                        assetType: form.values.assetType,
                        id: loans.assetEstimations.brands.length.toString(),
                        name: value.trim(),
                      };
                      loans.setAssetEstimations({
                        ...loans.assetEstimations,
                        brands: [...loans.assetEstimations.brands, brand],
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
              label={t`Model`}
              placeholder={t`Select model`}
              data={loans.assetEstimations.models
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
                  OnModalInput({
                    title: t`Update model`,
                    type: InputModalType.TEXT,
                    label: t`Model name`,
                    value: loans.assetEstimations.models.find((v) => v.id === form.values.modelId)
                      ?.name,
                    onDone: (value: string) => {
                      loans.setAssetEstimations({
                        ...loans.assetEstimations,
                        models: loans.assetEstimations.models.map((b) => {
                          if (b.id === form.values.modelId) return { ...b, name: value.trim() };
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
                  OnModalInput({
                    title: t`Create model`,
                    type: InputModalType.TEXT,
                    label: t`Model name`,
                    onDone: (value: string) => {
                      const model: LoanAssetEstimationModel = {
                        id: loans.assetEstimations.models.length.toString(),
                        name: value.trim(),
                        brandId: form.values.brandId,
                      };
                      loans.setAssetEstimations({
                        ...loans.assetEstimations,
                        models: [...loans.assetEstimations.models, model],
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
              label={t`Color`}
              placeholder={t`Select color`}
              data={loans.assetEstimations.colors
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
                OnModalInput({
                  title: t`Update color`,
                  type: InputModalType.TEXT,
                  label: t`Color name`,
                  value: loans.assetEstimations.colors.find((v) => v.id === form.values.colorId)
                    ?.name,
                  onDone: (value: string) => {
                    loans.setAssetEstimations({
                      ...loans.assetEstimations,
                      colors: loans.assetEstimations.colors.map((b) => {
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
                OnModalInput({
                  title: t`Create color`,
                  type: InputModalType.TEXT,
                  label: t`Color name`,
                  onDone: (value: string) => {
                    const color: LoanAssetEstimationColor = {
                      id: loans.assetEstimations.colors.length.toString(),
                      name: value.trim(),
                      brandId: form.values.brandId,
                    };
                    loans.setAssetEstimations({
                      ...loans.assetEstimations,
                      colors: [...loans.assetEstimations.colors, color],
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
            label={t`Product manufacturing year`}
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
                DateTime.timeToSeconds(new Date(new Date(date).getFullYear(), 0, 1))
              );
            }}
            valueFormat="YYYY"
          />

          <TextInput label={t`Product name`} {...form.getInputProps("productName")} />
        </SimpleGrid>

        <NumberInput
          withAsterisk
          label={t`Estimate price`}
          hideControls
          {...form.getInputProps("estimatePrice")}
        />

        <InputWrapper label={t`Product images`}>
          <FilesBox query={{ ref: `loan-asset-estimations-${form.values.id}` }} autoUpload />
        </InputWrapper>

        <Button onClick={submitting.handle} loading={submitting.isSubmitting} mt={10}>
          {props?.estimation ? t`Update` : t`Create`}
        </Button>
      </Stack>
    </Modal>
  );
};
