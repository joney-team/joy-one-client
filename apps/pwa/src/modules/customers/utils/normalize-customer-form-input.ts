import { CustomerFormInput } from "@/graphql/types.graphql";
import { CustomerFormDataFragment } from "@/modules/customer-forms/graphql/fragmentCustomerForm.graphql";

export function normalizeCustomerFormInput(input: CustomerFormDataFragment): CustomerFormInput {
  return {
    name: input.name,
    phone: input.phone,
    workspaceId: input.workspaceId,
    workspaceBranchId: input.workspaceBranch?._id,
    email: input.email,
    dynamicData: input.dynamicData,
    cancelReason: input.cancelReason,
    location: input.location,
    vnLocation: input.vnLocation,
    status: input.status,
  };
}
