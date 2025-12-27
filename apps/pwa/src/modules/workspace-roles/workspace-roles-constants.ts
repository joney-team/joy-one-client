import { defineMessage, MacroMessageDescriptor, t } from "@lingui/core/macro";
import {
  WorkspacePermission,
  WorkspaceRoleEntity,
  WorkspaceDefaultRoleId,
} from "./workspace-roles-types";

export const workspaceDefaultRoles: Record<
  WorkspaceDefaultRoleId,
  { name: MacroMessageDescriptor }
> = {
  [WorkspaceDefaultRoleId.OWNER]: { name: defineMessage`Owner` },
  [WorkspaceDefaultRoleId.ADMIN]: { name: defineMessage`Admin` },
  [WorkspaceDefaultRoleId.MEMBER]: { name: defineMessage`Member` },
};

export const workspaceSpecialRoleIds: Record<WorkspaceDefaultRoleId, { name: () => string }> = {
  [WorkspaceDefaultRoleId.OWNER]: { name: () => t`Owner` },
  [WorkspaceDefaultRoleId.ADMIN]: { name: () => t`Admin` },
  [WorkspaceDefaultRoleId.MEMBER]: { name: () => t`Member` },
};

export const getWorkspaceRoleName = (role: Pick<WorkspaceRoleEntity, "name" | "_id">): string => {
  if (Object.values(WorkspaceDefaultRoleId).includes(role._id as WorkspaceDefaultRoleId)) {
    return workspaceSpecialRoleIds[role._id as WorkspaceDefaultRoleId].name();
  }

  return role.name;
};

export const workspacePermissions: Record<WorkspacePermission, { name: () => string }> = {
  [WorkspacePermission.LOANS_UPDATE_WORKSPACE_BRANCH]: {
    name: () => t`Change loan workspace branch`,
  },
  [WorkspacePermission.CUSTOMERS_VIEW]: {
    name: () => t`View customers`,
  },
  [WorkspacePermission.CUSTOMERS_VIEW_CONTACT]: {
    name: () => t`View customer phone number and contact`,
  },
  [WorkspacePermission.CUSTOMERS_CREATE]: {
    name: () => t`Create customer`,
  },
  [WorkspacePermission.CUSTOMERS_UPDATE_INFO]: {
    name: () => t`Update customer info`,
  },
  [WorkspacePermission.CUSTOMERS_ASSIGN]: {
    name: () => t`Assign customer to member`,
  },
  [WorkspacePermission.CUSTOMER_KYCS_MANAGER]: {
    name: () => t`Manage customer KYC`,
  },
  [WorkspacePermission.LOANS_VIEW]: {
    name: () => t`View all loans`,
  },
  [WorkspacePermission.LOANS_APPROVE]: {
    name: () => t`Approve loan`,
  },
  [WorkspacePermission.LOANS_FULFILL]: {
    name: () => t`Fulfill loan`,
  },
  [WorkspacePermission.LOANS_CREATOR]: {
    name: () => t`Create/update loan`,
  },
  [WorkspacePermission.LOANS_PAY]: {
    name: () => t`Pay loan`,
  },
  [WorkspacePermission.LOANS_ARCHIVE]: {
    name: () => t`Archive loan`,
  },
  [WorkspacePermission.BOOKING_VIEW]: {
    name: () => t`View bookings`,
  },
  [WorkspacePermission.BOOKING_MANAGER]: {
    name: () => t`Manage bookings`,
  },
  [WorkspacePermission.RECEIPTS_VIEW]: {
    name: () => t`View receipts`,
  },
  [WorkspacePermission.RECEIPTS_CREATE]: {
    name: () => t`Create receipt`,
  },
  [WorkspacePermission.RECEIPTS_CENSORSHIP]: {
    name: () => t`Censor receipts`,
  },
  [WorkspacePermission.PRODUCTS_SERVICES_WRITE]: {
    name: () => t`Create product/service`,
  },
  [WorkspacePermission.PARTNERS_WRITE]: {
    name: () => t`Manage partners`,
  },
  [WorkspacePermission.HRM_TIMEKEEPINGS_CENSORSHIP]: {
    name: () => t`Censor timekeeping`,
  },
  [WorkspacePermission.HRM_SALARIES_MANAGER]: {
    name: () => t`Manage salaries`,
  },
  [WorkspacePermission.WORKSPACE_MEMBERS_VIEW]: {
    name: () => t`View members`,
  },
  [WorkspacePermission.WORKSPACE_MEMBERS_MANAGER]: {
    name: () => t`Manage members`,
  },
  [WorkspacePermission.WORKSPACE_ROLES_MANAGER]: {
    name: () => t`Manage roles`,
  },
  [WorkspacePermission.WORKSPACE_SETTINGS]: {
    name: () => t`Change settings`,
  },
  [WorkspacePermission.WORKSPACE_BILLINGS_MANAGER]: {
    name: () => t`Manage billings`,
  },
  [WorkspacePermission.REPORTS_VIEW]: {
    name: () => t`View reports`,
  },
  [WorkspacePermission.PRESCRIPTIONS_WRITE]: {
    name: () => t`Manage prescriptions`,
  },
  [WorkspacePermission.MESSAGE_BOXES_MANAGER]: {
    name: () => t`Manage message boxes`,
  },
  [WorkspacePermission.TABLE_SLOTS_WRITE]: {
    name: () => t`Manage tables`,
  },
  [WorkspacePermission.COUPONS_MANAGER]: {
    name: () => t`Manage coupons`,
  },
  [WorkspacePermission.VOUCHERS_MANAGER]: {
    name: () => t`Manage vouchers`,
  },
  [WorkspacePermission.CUSTOMERS_ARCHIVE]: {
    name: () => t`Archive customer`,
  },
  [WorkspacePermission.RECEIPTS_ARCHIVE]: {
    name: () => t`Archive receipt`,
  },
  [WorkspacePermission.RECEIPTS_UPDATE]: {
    name: () => t`Update receipt`,
  },
  [WorkspacePermission.WORKSPACE_BRANCHES_FULL_ACCESS]: {
    name: () => t`Access all branches`,
  },
  [WorkspacePermission.ORDERS_VIEW]: {
    name: () => t`View orders / service ticket`,
  },
  [WorkspacePermission.ORDERS_CREATE]: {
    name: () => t`Create order / service ticket`,
  },
  [WorkspacePermission.ORDERS_UPDATE]: {
    name: () => t`Update order / service ticket`,
  },
  [WorkspacePermission.ORDERS_ARCHIVE]: {
    name: () => t`Archive order / service ticket`,
  },
  [WorkspacePermission.PRODUCT_STOCK_IN]: {
    name: () => t`Stock in`,
  },
  [WorkspacePermission.PRODUCT_STOCK_OUT]: {
    name: () => t`Stock out`,
  },
  [WorkspacePermission.PRODUCT_STOCK_IN_REVERT]: {
    name: () => t`Revert stock in`,
  },
  [WorkspacePermission.PRODUCT_STOCK_OUT_REVERT]: {
    name: () => t`Revert stock out`,
  },
  [WorkspacePermission.EXPORT_DATA]: {
    name: () => t`Export data`,
  },
  [WorkspacePermission.PRODUCT_STOCK_VIEW]: {
    name: () => t`View stock`,
  },
  [WorkspacePermission.PRODUCT_COMBOS_VIEW]: {
    name: () => t`View Combos`,
  },
  [WorkspacePermission.PRODUCT_COMBOS_MANAGER]: {
    name: () => t`Manage Combos`,
  },
  [WorkspacePermission.CUSTOMER_FORMS_MANAGER]: {
    name: () => t`Manage customer forms`,
  },
  [WorkspacePermission.LOANS_CUSTOM_FULFILLED_AT]: {
    name: () => t`Change fulfilled at`,
  },
  [WorkspacePermission.POSTS_VIEW]: {
    name: () => t`View posts`,
  },
  [WorkspacePermission.POSTS_MANAGER]: {
    name: () => t`Manage posts`,
  },
  [WorkspacePermission.CUSTOM_FIELDS_MANAGER]: {
    name: () => t`Manage custom fields`,
  },
  [WorkspacePermission.PROMOTIONS_VIEW]: {
    name: () => t`View promotions`,
  },
  [WorkspacePermission.PROMOTIONS_MANAGER]: {
    name: () => t`Manage promotions`,
  },
  [WorkspacePermission.CATEGORIES_VIEW]: {
    name: () => t`View categories`,
  },
  [WorkspacePermission.CATEGORIES_MANAGER]: {
    name: () => t`Manage categories`,
  },
  [WorkspacePermission.LOANS_APPROVED_REVERTED]: {
    name: () => t`Revert loan approve`,
  },
  [WorkspacePermission.RECEIPTS_REVERT_PAYMENT]: {
    name: () => t`Revert payment`,
  },
  [WorkspacePermission.LOANS_FULFILLED_REVERTED]: {
    name: () => t`Revert loan fulfill`,
  },
  [WorkspacePermission.RECEIPTS_EXPORT_E_INVOICE]: {
    name: () => t`Export e-invoice`,
  },
};
