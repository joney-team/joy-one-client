import { CustomerFormStatus } from "./customer-form-types";

export interface CustomerFormDto {
  name: string;
  phone: string;
  workspaceId: string;
  workspaceBranchId?: string | null;
  email?: string | null;
  dynamicData?: any | null;
  status?: CustomerFormStatus;
  cancelReason?: string | null;
}

export interface UpdateCustomerFormWorkspaceBranchDto {
  ids: string[];
  workspaceBranchId: string | null;
}