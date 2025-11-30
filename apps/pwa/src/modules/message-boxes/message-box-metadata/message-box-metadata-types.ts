import type { CustomerEntity } from "@/modules/customers/customer-types";
import type { WorkspaceModuleId } from "@/modules/workspaces/workspace-modules";
import type { WorkspaceType } from "@/modules/workspaces/workspaces-types";
import type { FC } from "react";

export type AccordionItemComponent = FC<{ customer: CustomerEntity }>;

export type AccordionItem = {
  moduleId: WorkspaceModuleId;
  component: AccordionItemComponent;
  workspaceTypes?: WorkspaceType[];
  onCreate?: (
    customer: CustomerEntity,
    context: { actions: { createLoan: () => void; createBooking: () => void } }
  ) => void;
};
