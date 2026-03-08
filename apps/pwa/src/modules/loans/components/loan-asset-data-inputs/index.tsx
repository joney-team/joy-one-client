"use client";

import { LoanAssetDataMap } from "@/modules/loans/loans-types";
import { InputWrapper, InputWrapperProps, Stack } from "@mantine/core";
import { FC } from "react";
import { InputICloud } from "./input-i-cloud";
import { InputLandCertificate } from "./input-land-certificate";
import { InputCarRegistration } from "./input-car-registration";
import { InputMotobileRegistration } from "./input-motobike-registration";
import { LoanAssetType } from "@/graphql/enums.graphql";

export interface LoanAssetDataInputProps<T extends LoanAssetType = any>
  extends Omit<InputWrapperProps, "value" | "onChange"> {
  assetType: LoanAssetType;
  loanId?: string;
  value?: LoanAssetDataMap[T];
  onChange?: (value?: LoanAssetDataMap[T]) => void;
  disabled?: boolean;
}

const Inputs: Record<LoanAssetType, FC<LoanAssetDataInputProps>> = {
  [LoanAssetType.Icloud]: InputICloud,
  [LoanAssetType.MotobikeRegistration]: InputMotobileRegistration,
  [LoanAssetType.CarRegistration]: InputCarRegistration,
  [LoanAssetType.BusinessPermit]: null as any,
  [LoanAssetType.LandCertificate]: InputLandCertificate,
};

export const LoanAssetDataInput: FC<LoanAssetDataInputProps> = (props) => {
  const { assetType, loanId, value, onChange, disabled, ...rest } = props;

  const Input = Inputs[props.assetType];
  if (!Input) return null;

  return (
    <InputWrapper {...rest}>
      <Stack>
        <Input {...props} />
      </Stack>
    </InputWrapper>
  );
};
