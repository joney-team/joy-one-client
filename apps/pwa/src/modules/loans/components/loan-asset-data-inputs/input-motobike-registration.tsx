"use client";

import { EntityImage } from "@/components/entity-image";
import { EntityImages } from "@/components/entity-images";
import { useLoans } from "@/modules/loans/loans-context";
import { LoanAssetType } from "@/modules/loans/loans-types";
import { t } from "@lingui/core/macro";
import { InputWrapper, Select, SimpleGrid, TextInput } from "@mantine/core";
import { FC } from "react";
import { LoanAssetDataInputProps } from ".";

export const InputMotobileRegistration: FC<
  LoanAssetDataInputProps<LoanAssetType.MOTOBIKE_REGISTRATION>
> = (props) => {
  const loans = useLoans();

  return (
    <SimpleGrid cols={{ md: 1 }}>
      <SimpleGrid cols={{ md: 3 }}>
        <Select
          label={t`Brand name`}
          searchable
          data={loans.assetEstimations.brands
            .filter((v) => v.assetType === props.assetType)
            .map((brand) => ({ value: brand.id, label: brand.name }))}
          value={props.value?.brandId}
          onChange={(brandId) => props.onChange?.({ ...(props.value as any), brandId })}
          disabled={props.disabled}
        />

        <Select
          label={t`Asset model`}
          searchable
          data={loans.assetEstimations.models
            .filter((v) => v.brandId === props.value?.brandId)
            .map((model) => ({ value: model.id, label: model.name }))}
          value={props.value?.modelId}
          onChange={(modelId) => props.onChange?.({ ...(props.value as any), modelId })}
          disabled={props.disabled}
        />

        <TextInput
          label={t`Number plate`}
          value={props.value?.numberPlate || ""}
          onChange={(e) =>
            props.onChange?.({ ...(props.value as any), numberPlate: e.target.value })
          }
          disabled={props.disabled}
        />

        <TextInput
          label={t`Frame number`}
          value={props.value?.frameNumber || ""}
          onChange={(e) =>
            props.onChange?.({ ...(props.value as any), frameNumber: e.target.value })
          }
          disabled={props.disabled}
        />

        <TextInput
          label={t`Engine number`}
          value={props.value?.engineNumber || ""}
          onChange={(e) =>
            props.onChange?.({ ...(props.value as any), engineNumber: e.target.value })
          }
          disabled={props.disabled}
        />

        <TextInput
          label={t`Registration number`}
          value={props.value?.registrationNumber || ""}
          onChange={(e) =>
            props.onChange?.({ ...(props.value as any), registrationNumber: e.target.value })
          }
          disabled={props.disabled}
        />

        <TextInput
          label={t`Issued date`}
          value={props.value?.issuedDate || ""}
          onChange={(e) =>
            props.onChange?.({ ...(props.value as any), issuedDate: e.target.value })
          }
          disabled={props.disabled}
        />

        <TextInput
          label={t`Product manufacturing date`}
          value={props.value?.productManufacturingDate || ""}
          onChange={(e) =>
            props.onChange?.({ ...(props.value as any), productManufacturingDate: e.target.value })
          }
          disabled={props.disabled}
        />
      </SimpleGrid>

      <SimpleGrid cols={{ md: 2 }}>
        <InputWrapper label={t`Driver license images front`}>
          <EntityImage
            w="100%"
            h={150}
            fit="contain"
            name={t`Driver license images front`}
            src={props.value?.driverLicenseImages?.front}
            onChange={(image) =>
              props.onChange?.({
                ...(props.value as any),
                driverLicenseImages: { ...props.value?.driverLicenseImages, front: image },
              })
            }
            readonly={props.disabled}
          />
        </InputWrapper>

        <InputWrapper label={t`Driver license images back`}>
          <EntityImage
            w="100%"
            h={150}
            fit="contain"
            name={t`Driver license images back`}
            src={props.value?.driverLicenseImages?.back}
            onChange={(image) =>
              props.onChange?.({
                ...(props.value as any),
                driverLicenseImages: { ...props.value?.driverLicenseImages, back: image },
              })
            }
            readonly={props.disabled}
          />
        </InputWrapper>
      </SimpleGrid>

      <InputWrapper label={t`Asset images`}>
        <EntityImages
          name={t`Asset images`}
          images={props.value?.images}
          onChange={(images) => props.onChange?.({ ...(props.value as any), images })}
          disabled={props.disabled}
        />
      </InputWrapper>
    </SimpleGrid>
  );
};
