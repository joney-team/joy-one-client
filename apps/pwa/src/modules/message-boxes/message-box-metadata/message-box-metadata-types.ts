import { WorkspaceType } from "@/graphql/types.graphql";
import type { WorkspaceModuleId } from "@/modules/workspaces/workspace-modules";
import type { FC } from "react";

export type AccordionItemComponent = FC<{ customer: any }>;

export type AccordionItem = {
  moduleId: WorkspaceModuleId;
  component: AccordionItemComponent;
  workspaceTypes?: WorkspaceType[];
  onCreate?: (
    customer: any,
    context: { actions: { createLoan: () => void; createBooking: () => void } }
  ) => void;
};
