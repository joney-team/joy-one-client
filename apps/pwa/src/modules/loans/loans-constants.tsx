import { LoanAssetType, LoanPackageType, LoanStatus } from "@/graphql/enums.graphql";
import { defineMessage, MacroMessageDescriptor } from "@lingui/core/macro";
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
    [LoanAssetType.Icloud]: { label: defineMessage`iCloud`, icon: IconDevices },
    [LoanAssetType.MotobikeRegistration]: {
      label: defineMessage`Moto registration`,
      icon: IconMotorbike,
    },
    [LoanAssetType.CarRegistration]: { label: defineMessage`Car registration`, icon: IconCar },
    [LoanAssetType.BusinessPermit]: { label: defineMessage`Business permit`, icon: IconBuilding },
    [LoanAssetType.LandCertificate]: { label: defineMessage`Land certificate`, icon: IconHome2 },
  };

export const loanStatuses: Record<
  LoanStatus,
  { label: MacroMessageDescriptor; color: MantineColor }
> = {
  [LoanStatus.PendingSign]: { label: defineMessage`Pending signature`, color: "gray" },
  [LoanStatus.Pending]: { label: defineMessage`Pending`, color: "gray" },
  [LoanStatus.Approved]: { label: defineMessage`Approved`, color: "violet" },
  [LoanStatus.Fulfilled]: { label: defineMessage`Fulfilled`, color: "orange" },
  [LoanStatus.Rejected]: { label: defineMessage`Rejected`, color: "red" },
  [LoanStatus.Overdue]: { label: defineMessage`Overdue`, color: "red" },
  [LoanStatus.Completed]: { label: defineMessage`Completed`, color: "green" },
};

export const loanPackageTypes: Record<
  LoanPackageType,
  { label: MacroMessageDescriptor; color: MantineColor }
> = {
  [LoanPackageType.FixedCapital]: { label: defineMessage`Fixed capital`, color: "violet" },
  [LoanPackageType.UnfixedCapital]: { label: defineMessage`Unfixed capital`, color: "grape" },
  [LoanPackageType.Installment]: { label: defineMessage`Installment`, color: "green" },
};
