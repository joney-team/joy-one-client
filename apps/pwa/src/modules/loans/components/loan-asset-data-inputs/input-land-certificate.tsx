"use client";

import { EntityImages } from "@/components/entity-images";
import { t } from "@lingui/core/macro";
import { InputWrapper } from "@mantine/core";
import { FC } from "react";
import { LoanAssetDataInputProps } from ".";

export const InputLandCertificate: FC<LoanAssetDataInputProps<"LAND_CERTIFICATE">> = (props) => {
  return (
    <InputWrapper label={t`Land certificate images`}>
      <EntityImages
        name={t`Land certificate images`}
        images={props.value?.images}
        onChange={(images) => props.onChange?.({ ...(props.value as any), images })}
        disabled={props.disabled}
      />
    </InputWrapper>
  );
};
