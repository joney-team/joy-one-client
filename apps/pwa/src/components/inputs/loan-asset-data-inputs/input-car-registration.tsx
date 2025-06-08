import { TextInput } from "@/components/inputs/text-input";
import { EntityImage } from "@/components/entity-image";
import { EntityImages } from "@/components/entity-images";
import { t } from "@/modules/lang/lang-service";
import { useLoans } from "@/modules/loans/loans-context";
import { LoanAssetType } from "@/modules/loans/loans-types";
import { InputWrapper, Select, SimpleGrid } from "@mantine/core";
import { FC } from "react";
import { LoanAssetDataInputProps } from ".";

export const InputCarRegistration: FC<LoanAssetDataInputProps<LoanAssetType.CAR_REGISTRATION>> = (props) => {
  const loans = useLoans();

  return (
    <SimpleGrid cols={{ md: 1 }}>
      <SimpleGrid cols={{ md: 3 }}>
        <Select
          label={t("brand_name")}
          searchable
          data={loans.assetEstimations.brands
            .filter((v) => v.assetType === props.assetType)
            .map((brand) => ({ value: brand.id, label: brand.name }))}
          value={props.value?.brandId}
          onChange={(brandId) => props.onChange?.({ ...(props.value as any), brandId })}
          disabled={props.disabled}
        />

        <Select
          label={t("asset_model")}
          searchable
          data={loans.assetEstimations.models
            .filter((v) => v.brandId === props.value?.brandId)
            .map((model) => ({ value: model.id, label: model.name }))}
          value={props.value?.modelId}
          onChange={(modelId) => props.onChange?.({ ...(props.value as any), modelId })}
          disabled={props.disabled}
        />

        <TextInput
          label={t("numberPlate")}
          value={props.value?.numberPlate || ""}
          onChange={(e) => props.onChange?.({ ...(props.value as any), numberPlate: e.target.value })}
          disabled={props.disabled}
        />

        <TextInput
          label={t("frameNumber")}
          value={props.value?.frameNumber || ""}
          onChange={(e) => props.onChange?.({ ...(props.value as any), frameNumber: e.target.value })}
          disabled={props.disabled}
        />

        <TextInput
          label={t("engineNumber")}
          value={props.value?.engineNumber || ""}
          onChange={(e) => props.onChange?.({ ...(props.value as any), engineNumber: e.target.value })}
          disabled={props.disabled}
        />

        <TextInput
          label={t("registrationNumber")}
          value={props.value?.registrationNumber || ""}
          onChange={(e) => props.onChange?.({ ...(props.value as any), registrationNumber: e.target.value })}
          disabled={props.disabled}
        />

        <TextInput
          label={t("issuedDate")}
          value={props.value?.issuedDate || ""}
          onChange={(e) => props.onChange?.({ ...(props.value as any), issuedDate: e.target.value })}
          disabled={props.disabled}
        />

        <TextInput
          label={t("productManufacturingDate")}
          value={props.value?.productManufacturingDate || ""}
          onChange={(e) => props.onChange?.({ ...(props.value as any), productManufacturingDate: e.target.value })}
          disabled={props.disabled}
        />
      </SimpleGrid>

      <SimpleGrid cols={{ md: 2 }}>
        <InputWrapper label={t("driverLicenseImages_front")}>
          <EntityImage
            w="100%"
            h={150}
            fit="contain"
            name={t("driverLicenseImages_front")}
            src={props.value?.driverLicenseImages?.front}
            onChange={(image) =>
              props.onChange?.({
                ...(props.value as any),
                driverLicenseImages: { ...props.value?.driverLicenseImages, front: image },
              })
            }
            onlyRead={props.disabled}
          />
        </InputWrapper>

        <InputWrapper label={t("driverLicenseImages_back")}>
          <EntityImage
            w="100%"
            h={150}
            fit="contain"
            name={t("driverLicenseImages_back")}
            src={props.value?.driverLicenseImages?.back}
            onChange={(image) =>
              props.onChange?.({
                ...(props.value as any),
                driverLicenseImages: { ...props.value?.driverLicenseImages, back: image },
              })
            }
            onlyRead={props.disabled}
          />
        </InputWrapper>
      </SimpleGrid>

      <InputWrapper label={t("asset_imgs")}>
        <EntityImages
          name={t("asset_imgs")}
          images={props.value?.images}
          onChange={(images) => props.onChange?.({ ...(props.value as any), images })}
          disabled={props.disabled}
        />
      </InputWrapper>

      <InputWrapper label={t("asset_car_receipts")}>
        <EntityImages
          name={t("asset_car_receipts")}
          images={props.value?.receipts}
          onChange={(receipts) => props.onChange?.({ ...(props.value as any), receipts })}
          disabled={props.disabled}
        />
      </InputWrapper>
    </SimpleGrid>
  );
};
