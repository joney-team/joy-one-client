import { Gender } from "@/graphql/enums.graphql";
import { CustomerInput } from "@/graphql/types.graphql";
import { defineMessage, MacroMessageDescriptor } from "@lingui/core/macro";
import { Icon, IconGenderBigender, IconGenderFemale, IconGenderMale } from "@tabler/icons-react";
import { CustomerDataFragment } from "./graphql/fragmentCustomer.graphql";

export const customerGenders: {
  [key in Gender]: {
    color: string;
    icon: Icon;
    label: MacroMessageDescriptor;
  };
} = {
  [Gender.Female]: { color: "pink", icon: IconGenderFemale, label: defineMessage`Female` },
  [Gender.Male]: { color: "blue", icon: IconGenderMale, label: defineMessage`Male` },
  [Gender.Other]: { color: "orange", icon: IconGenderBigender, label: defineMessage`Other` },
};

export function normalizeCustomerInput(customer: CustomerDataFragment): CustomerInput {
  return {
    name: customer.name,
    phone: customer.phone,
    email: customer.email,
    birthday: customer.birthday,
    gender: customer.gender,
    medicalHistory: customer.medicalHistory,
    relationshipContacts: customer.relationshipContacts,
    presenterCustomerId: customer.presenterCustomerId,
    assigneeUserIds: customer.assigneeUsers?.map((user) => user.userId) ?? [],
    relatedCustomerIds: customer.relatedCustomerIds,
    workspaceBranchId: customer.workspaceBranch?._id ?? customer.workspaceBranchId,
    salaryAmount: customer.salaryAmount,
    vnLocation: customer.vnLocation,
    vnSecondaryLocation: customer.vnSecondaryLocation,
    secondaryLocation: customer.secondaryLocation,
    location: customer.location,
    tagIds: customer.tagIds,
    avatar: customer.avatar,
    createdAt: customer.createdAt,
    plainCode: customer.plainCode,
    socialFacebookUrl: customer.socialFacebookUrl,
    source: customer.source,
  };
}
