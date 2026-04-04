import { CustomerFormInput } from "@/graphql/types.graphql";
import { CustomerFormFragment } from "@/modules/customer-forms/graphql/fragmentCustomerForm.graphql";
import { removeTypeName } from "@joy-one-client/utils/remove-type-name";

export function normalizeCustomerFormInput(input: CustomerFormFragment): CustomerFormInput {
  return removeTypeName({
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
  });
}
