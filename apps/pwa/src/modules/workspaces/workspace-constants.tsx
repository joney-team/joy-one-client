import { WorkspaceType } from "@/graphql/enums.graphql";
import { defineMessage, MacroMessageDescriptor } from "@lingui/core/macro";
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

export const workspaceTypes: Record<WorkspaceType, { name: MacroMessageDescriptor; icon: Icon }> = {
  [WorkspaceType.Software]: { name: defineMessage`Software`, icon: IconCode },
  [WorkspaceType.Business]: { name: defineMessage`Business`, icon: IconBuilding },
  [WorkspaceType.Hospital]: { name: defineMessage`Hospital`, icon: IconBuildingHospital },
  [WorkspaceType.Clinic]: { name: defineMessage`Clinic`, icon: IconStethoscope },
  [WorkspaceType.Dental]: { name: defineMessage`Dental`, icon: IconDental },
  [WorkspaceType.Spa]: { name: defineMessage`Spa`, icon: IconPlant2 },
  [WorkspaceType.BeautySalon]: { name: defineMessage`Beauty salon`, icon: IconSparkles },
  [WorkspaceType.Credit]: { name: defineMessage`Credit`, icon: IconCreditCardPay },
};
