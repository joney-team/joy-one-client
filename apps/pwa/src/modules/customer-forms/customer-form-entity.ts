import { Location } from "@/graphql/types.graphql";
import type { BaseMongoEntity } from "@/types";
import { CustomerFormStatus } from "./customer-form-types";

export interface CustomerFormEntity
  extends Omit<BaseMongoEntity, "workspaceId" | "workspaceBranchId"> {
  name: string;
  phone: string;
  email?: string;
  location?: Location;
  vnLocation?: Location;
  dynamicData?: any;
  status: CustomerFormStatus;
  workspaceId: string;
  workspaceBranchId?: string | null;
  cancelReason?: string | null;
}
