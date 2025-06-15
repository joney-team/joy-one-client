"use client";

import { LoanAssetDataMap, LoanAssetType } from "@/modules/loans/loans-types";
import { InputWrapper, InputWrapperProps, Stack } from "@mantine/core";
import { FC } from "react";
import { InputICloud } from "./input-i-cloud";
import { InputLandCertificate } from "./input-land-certificate";
import { InputCarRegistration } from "./input-car-registration";
import { InputMotobileRegistration } from "./input-motobike-registration";

export interface LoanAssetDataInputProps<T extends LoanAssetType = any>
  extends Omit<InputWrapperProps, "value" | "onChange"> {
  assetType: LoanAssetType;
  loanId?: string;
  value?: LoanAssetDataMap[T];
  onChange?: (value?: LoanAssetDataMap[T]) => void;
  disabled?: boolean;
}

const Inputs: Record<LoanAssetType, FC<LoanAssetDataInputProps>> = {
  [LoanAssetType.ICLOUD]: InputICloud,
  [LoanAssetType.MOTOBIKE_REGISTRATION]: InputMotobileRegistration,
  [LoanAssetType.CAR_REGISTRATION]: InputCarRegistration,
  [LoanAssetType.BUSINESS_PERMIT]: null as any,
  [LoanAssetType.LAND_CERTIFICATE]: InputLandCertificate,
};

export const LoanAssetDataInput: FC<LoanAssetDataInputProps> = (props) => {
  let _props = { ...props } as any;

  delete _props.value;
  delete _props.onChange;
  delete _props.assetType;

  const Input = Inputs[props.assetType];
  if (!Input) return null;

  return (
    <InputWrapper {..._props}>
      <Stack>
        <Input {...props} />
      </Stack>
    </InputWrapper>
  );
};
