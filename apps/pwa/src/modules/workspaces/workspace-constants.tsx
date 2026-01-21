import { WorkspaceType } from "@/graphql/enums.graphql";
import { t } from "@lingui/core/macro";
import {
  Icon,
  IconBuilding,
  IconBuildingHospital,
  IconCode,
  IconCreditCardPay,
  IconDental,
  IconPlant2,
  IconSparkles,
  IconStethoscope,
} from "@tabler/icons-react";

export const workspaceTypes: Record<WorkspaceType, { name: () => string; icon: Icon }> = {
  [WorkspaceType.Software]: { name: () => t`Software`, icon: IconCode },
  [WorkspaceType.Business]: { name: () => t`Business`, icon: IconBuilding },
  [WorkspaceType.Hospital]: { name: () => t`Hospital`, icon: IconBuildingHospital },
  [WorkspaceType.Clinic]: { name: () => t`Clinic`, icon: IconStethoscope },
  [WorkspaceType.Dental]: { name: () => t`Dental`, icon: IconDental },
  [WorkspaceType.Spa]: { name: () => t`Spa`, icon: IconPlant2 },
  [WorkspaceType.BeautySalon]: { name: () => t`Beauty salon`, icon: IconSparkles },
  [WorkspaceType.Credit]: { name: () => t`Credit`, icon: IconCreditCardPay },
};
