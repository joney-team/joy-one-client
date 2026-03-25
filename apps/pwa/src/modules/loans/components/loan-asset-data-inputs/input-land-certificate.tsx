"use client";

import { EntityImages } from "@/components/entity-images";
import { Trans } from "@lingui/react/macro";
import { InputWrapper } from "@mantine/core";
import { FC } from "react";
import { LoanAssetDataInputProps } from ".";

export const InputLandCertificate: FC<LoanAssetDataInputProps<"LAND_CERTIFICATE">> = (props) => {
  return (
    <InputWrapper label={<Trans>Land certificate images</Trans>}>
      <EntityImages
        name={<Trans>Land certificate images</Trans>}
        images={props.value?.images}
        onChange={(images) => props.onChange?.({ ...(props.value as any), images })}
        disabled={props.disabled}
      />
    </InputWrapper>
  );
};
