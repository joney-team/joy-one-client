import { Gender } from "@/graphql/enums.graphql";
import { CustomerInput } from "@/graphql/types.graphql";
import { AppPageMetadata } from "@/types";
import { Icon, IconGenderBigender, IconGenderFemale, IconGenderMale } from "@tabler/icons-react";
import { api } from "../apis";
import { apiServerSide } from "../apis/server";
import { CustomerDataFragment } from "./graphql/fragmentCustomer.graphql";
import { defineMessage, MacroMessageDescriptor } from "@lingui/core/macro";

export async function isCustomerPhoneExisted(phone: string) {
  return api.get<boolean>(`/customers/phone/${phone}/exists`);
}

export async function getCustomerMetadata(code: string) {
  return apiServerSide.get<AppPageMetadata>(`/customers/metadata/${code}`);
}

export async function customerInteraction(_id: string) {
  try {
    await api.post(`/customers/${_id}/interaction`);
  } catch (error) {
    console.error(error);
  }
}

// export async function archiveCustomer(_id: string) {
//   const pendingReceipts = await getReceipts({
//     relatedCustomerId: _id,
//     status: ReceiptStatus.PENDING,
//   });

//   if (pendingReceipts.count > 0) {
//     throw new Error(t`Customer has pending receipts`);
//   }

//   return api.delete(`/customers/${_id}`);
// }

// export function renderGener(gender?: Gender) {
//   if (gender === Gender.Female) return "Nữ";
//   if (gender === Gender.Male) return "Nam";
//   if (gender === Gender.Other) return "Khác";
//   return "N/A";
// }

// export function renderGenerIcon(gender?: Gender) {
//   if (gender === Gender.Female) return IconGenderFemale;
//   if (gender === Gender.Male) return IconGenderMale;
//   return IconGenderBigender;
// }

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
