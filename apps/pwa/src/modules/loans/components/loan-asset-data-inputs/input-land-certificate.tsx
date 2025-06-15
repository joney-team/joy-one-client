"use client";

import { EntityImages } from "@/components/entity-images";
import { t } from "@/modules/lang/lang-service";
import { LoanAssetType } from "@/modules/loans/loans-types";
import { InputWrapper } from "@mantine/core";
import { FC } from "react";
import { LoanAssetDataInputProps } from ".";

export const InputLandCertificate: FC<LoanAssetDataInputProps<LoanAssetType.LAND_CERTIFICATE>> = (
  props
) => {
  return (
    <InputWrapper label={t("land_certificate_imgs")}>
      <EntityImages
        name={t("land_certificate_imgs")}
        images={props.value?.images}
        onChange={(images) => props.onChange?.({ ...(props.value as any), images })}
        disabled={props.disabled}
      />
    </InputWrapper>
  );
};
