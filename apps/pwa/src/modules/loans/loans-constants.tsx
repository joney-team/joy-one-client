import { defineMessage, MacroMessageDescriptor, t } from "@lingui/core/macro";
import { LoanAssetType, LoanPackageType, LoanStatus } from "./loans-types";
import { MantineColor } from "@mantine/core";
import {
  Icon,
  IconBuilding,
  IconCar,
  IconDevices,
  IconHome2,
  IconMotorbike,
} from "@tabler/icons-react";

export const loanAssetTypes: Record<LoanAssetType, { label: MacroMessageDescriptor; icon: Icon }> =
  {
    [LoanAssetType.ICLOUD]: { label: defineMessage`iCloud`, icon: IconDevices },
    [LoanAssetType.MOTOBIKE_REGISTRATION]: {
      label: defineMessage`Moto registration`,
      icon: IconMotorbike,
    },
    [LoanAssetType.CAR_REGISTRATION]: { label: defineMessage`Car registration`, icon: IconCar },
    [LoanAssetType.BUSINESS_PERMIT]: { label: defineMessage`Business permit`, icon: IconBuilding },
    [LoanAssetType.LAND_CERTIFICATE]: { label: defineMessage`Land certificate`, icon: IconHome2 },
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
