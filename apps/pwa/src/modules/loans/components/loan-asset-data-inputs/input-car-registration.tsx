"use client";

import { EntityImage } from "@/components/entity-image";
import { EntityImages } from "@/components/entity-images";
import { Trans, useLingui } from "@lingui/react/macro";
import { InputWrapper, Select, SimpleGrid, TextInput } from "@mantine/core";
import { FC } from "react";
import { LoanAssetDataInputProps } from ".";
import { useLoanAssetEstimations } from "../../hooks/use-loan-asset-estimations";

export const InputCarRegistration: FC<LoanAssetDataInputProps<"CAR_REGISTRATION">> = (props) => {
  const { t } = useLingui();
  const { assetEstimations } = useLoanAssetEstimations();

  return (
    <SimpleGrid cols={{ md: 1 }}>
      <SimpleGrid cols={{ md: 3 }}>
        <Select
          label={<Trans>Brand name</Trans>}
          searchable
          data={assetEstimations?.brands
            .filter((v) => v.assetType === props.assetType)
            .map((brand) => ({ value: brand.id, label: brand.name }))}
          value={props.value?.brandId}
          onChange={(brandId) => props.onChange?.({ ...(props.value as any), brandId })}
          disabled={props.disabled}
        />

        <Select
          label={<Trans>Asset model</Trans>}
          searchable
          data={assetEstimations?.models
            .filter((v) => v.brandId === props.value?.brandId)
            .map((model) => ({ value: model.id, label: model.name }))}
          value={props.value?.modelId}
          onChange={(modelId) => props.onChange?.({ ...(props.value as any), modelId })}
          disabled={props.disabled}
        />

        <TextInput
          label={<Trans>Number plate</Trans>}
          value={props.value?.numberPlate || ""}
          onChange={(e) =>
            props.onChange?.({ ...(props.value as any), numberPlate: e.target.value })
          }
          disabled={props.disabled}
        />

        <TextInput
          label={<Trans>Frame number</Trans>}
          value={props.value?.frameNumber || ""}
          onChange={(e) =>
            props.onChange?.({ ...(props.value as any), frameNumber: e.target.value })
          }
          disabled={props.disabled}
        />

        <TextInput
          label={<Trans>Engine number</Trans>}
          value={props.value?.engineNumber || ""}
          onChange={(e) =>
            props.onChange?.({ ...(props.value as any), engineNumber: e.target.value })
          }
          disabled={props.disabled}
        />

        <TextInput
          label={<Trans>Registration number</Trans>}
          value={props.value?.registrationNumber || ""}
          onChange={(e) =>
            props.onChange?.({ ...(props.value as any), registrationNumber: e.target.value })
          }
          disabled={props.disabled}
        />

        <TextInput
          label={<Trans>Issued date</Trans>}
          value={props.value?.issuedDate || ""}
          onChange={(e) =>
            props.onChange?.({ ...(props.value as any), issuedDate: e.target.value })
          }
          disabled={props.disabled}
        />

        <TextInput
          label={<Trans>Product manufacturing date</Trans>}
          value={props.value?.productManufacturingDate || ""}
          onChange={(e) =>
            props.onChange?.({ ...(props.value as any), productManufacturingDate: e.target.value })
          }
          disabled={props.disabled}
        />
      </SimpleGrid>

      <SimpleGrid cols={{ md: 2 }}>
        <InputWrapper label={<Trans>Driver license images front</Trans>}>
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

        <InputWrapper label={<Trans>Driver license images back</Trans>}>
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

      <InputWrapper label={<Trans>Asset images</Trans>}>
        <EntityImages
          name={t`Asset images`}
          images={props.value?.images}
          onChange={(images) => props.onChange?.({ ...(props.value as any), images })}
          disabled={props.disabled}
        />
      </InputWrapper>

      <InputWrapper label={<Trans>Asset car receipts</Trans>}>
        <EntityImages
          name={t`Asset car receipts`}
          images={props.value?.receipts}
          onChange={(receipts) => props.onChange?.({ ...(props.value as any), receipts })}
          disabled={props.disabled}
        />
      </InputWrapper>
    </SimpleGrid>
  );
};
