import { defineMessage, MacroMessageDescriptor, t } from "@lingui/core/macro";
import { LoanAssetType, LoanPackageType, LoanStatus } from "./loans-types";
import { MantineColor } from "@mantine/core";

export const loanAssetTypes: Record<LoanAssetType, { label: () => string }> = {
  [LoanAssetType.ICLOUD]: { label: () => "iCloud" },
  [LoanAssetType.MOTOBIKE_REGISTRATION]: { label: () => t`Moto registration` },
  [LoanAssetType.CAR_REGISTRATION]: { label: () => t`Car registration` },
  [LoanAssetType.BUSINESS_PERMIT]: { label: () => t`Business permit` },
  [LoanAssetType.LAND_CERTIFICATE]: { label: () => t`Land certificate` },
};

export const loanStatuses: Record<
  LoanStatus,
  { label: MacroMessageDescriptor; color: MantineColor }
> = {
  [LoanStatus.PENDING_SIGN]: { label: defineMessage`Pending signature`, color: "gray" },
  [LoanStatus.PENDING]: { label: defineMessage`Pending`, color: "gray" },
  [LoanStatus.APPROVED]: { label: defineMessage`Approved`, color: "violet" },
  [LoanStatus.FULFILLED]: { label: defineMessage`Fulfilled`, color: "orange" },
  [LoanStatus.REJECTED]: { label: defineMessage`Rejected`, color: "red" },
  [LoanStatus.OVERDUE]: { label: defineMessage`Overdue`, color: "red" },
  [LoanStatus.COMPLETED]: { label: defineMessage`Completed`, color: "green" },
};

export const loanPackageTypes: Record<
  LoanPackageType,
  { label: () => string; color: MantineColor }
> = {
  [LoanPackageType.FIXED_CAPITAL]: { label: () => t`Fixed capital`, color: "violet" },
  [LoanPackageType.UNFIXED_CAPITAL]: { label: () => t`Unfixed capital`, color: "grape" },
  [LoanPackageType.INSTALLMENT]: { label: () => t`Installment`, color: "green" },
};
