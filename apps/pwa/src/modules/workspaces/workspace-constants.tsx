import { t } from "@lingui/core/macro";
import { WorkspaceType } from "./workspaces-types";
import {
  Icon,
  IconBuildingHospital,
  IconStethoscope,
  IconCreditCardPay,
  IconSparkles,
  IconPlant2,
  IconDental,
  IconCode,
  IconBuilding,
} from "@tabler/icons-react";

export const workspaceTypes: Record<WorkspaceType, { name: () => string; icon: Icon }> = {
  [WorkspaceType.SOFTWARE]: { name: () => t`Software`, icon: IconCode },
  [WorkspaceType.BUSINESS]: { name: () => t`Business`, icon: IconBuilding },
  [WorkspaceType.HOSPITAL]: { name: () => t`Hospital`, icon: IconBuildingHospital },
  [WorkspaceType.CLINIC]: { name: () => t`Clinic`, icon: IconStethoscope },
  [WorkspaceType.DENTAL]: { name: () => t`Dental`, icon: IconDental },
  [WorkspaceType.SPA]: { name: () => t`Spa`, icon: IconPlant2 },
  [WorkspaceType.BEAUTY_SALON]: { name: () => t`Beauty salon`, icon: IconSparkles },
  [WorkspaceType.CREDIT]: { name: () => t`Credit`, icon: IconCreditCardPay },
};
