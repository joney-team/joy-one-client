import { defineMessage, MacroMessageDescriptor } from "@lingui/core/macro";
import { WorkspaceDefaultRoleId, WorkspacePermission } from "./workspace-roles-types";

export const workspaceDefaultRoles: Record<
  WorkspaceDefaultRoleId,
  { name: MacroMessageDescriptor }
> = {
  [WorkspaceDefaultRoleId.OWNER]: { name: defineMessage`Owner` },
  [WorkspaceDefaultRoleId.ADMIN]: { name: defineMessage`Admin` },
  [WorkspaceDefaultRoleId.MEMBER]: { name: defineMessage`Member` },
};

export const workspaceSpecialRoleIds: Record<
  WorkspaceDefaultRoleId,
  { name: MacroMessageDescriptor }
> = {
  [WorkspaceDefaultRoleId.OWNER]: { name: defineMessage`Owner` },
  [WorkspaceDefaultRoleId.ADMIN]: { name: defineMessage`Admin` },
  [WorkspaceDefaultRoleId.MEMBER]: { name: defineMessage`Member` },
};

export const workspacePermissions: Record<WorkspacePermission, { name: MacroMessageDescriptor }> = {
  [WorkspacePermission.LOANS_UPDATE_WORKSPACE_BRANCH]: {
    name: defineMessage`Change loan workspace branch`,
  },
  [WorkspacePermission.CUSTOMERS_VIEW]: {
    name: defineMessage`View customers`,
  },
  [WorkspacePermission.CUSTOMERS_VIEW_CONTACT]: {
    name: defineMessage`View customer phone number and contact`,
  },
  [WorkspacePermission.CUSTOMERS_CREATE]: {
    name: defineMessage`Create customer`,
  },
  [WorkspacePermission.CUSTOMERS_UPDATE_INFO]: {
    name: defineMessage`Update customer info`,
  },
  [WorkspacePermission.CUSTOMERS_ASSIGN]: {
    name: defineMessage`Assign customer to member`,
  },
  [WorkspacePermission.CUSTOMER_KYCS_MANAGER]: {
    name: defineMessage`Manage customer KYC`,
  },
  [WorkspacePermission.LOANS_VIEW]: {
    name: defineMessage`View all loans`,
  },
  [WorkspacePermission.LOANS_APPROVE]: {
    name: defineMessage`Approve loan`,
  },
  [WorkspacePermission.LOANS_FULFILL]: {
    name: defineMessage`Fulfill loan`,
  },
  [WorkspacePermission.LOANS_CREATOR]: {
    name: defineMessage`Create/update loan`,
  },
  [WorkspacePermission.LOANS_PAY]: {
    name: defineMessage`Pay loan`,
  },
  [WorkspacePermission.LOANS_ARCHIVE]: {
    name: defineMessage`Archive loan`,
  },
  [WorkspacePermission.BOOKING_VIEW]: {
    name: defineMessage`View bookings`,
  },
  [WorkspacePermission.BOOKING_MANAGER]: {
    name: defineMessage`Manage bookings`,
  },
  [WorkspacePermission.RECEIPTS_VIEW]: {
    name: defineMessage`View receipts`,
  },
  [WorkspacePermission.RECEIPTS_CREATE]: {
    name: defineMessage`Create receipt`,
  },
  [WorkspacePermission.RECEIPTS_CENSORSHIP]: {
    name: defineMessage`Censor receipts`,
  },
  [WorkspacePermission.PRODUCTS_SERVICES_WRITE]: {
    name: defineMessage`Create product/service`,
  },
  [WorkspacePermission.PARTNERS_WRITE]: {
    name: defineMessage`Manage partners`,
  },
  [WorkspacePermission.HRM_TIMEKEEPINGS_CENSORSHIP]: {
    name: defineMessage`Censor timekeeping`,
  },
  [WorkspacePermission.HRM_SALARIES_MANAGER]: {
    name: defineMessage`Manage salaries`,
  },
  [WorkspacePermission.WORKSPACE_MEMBERS_VIEW]: {
    name: defineMessage`View members`,
  },
  [WorkspacePermission.WORKSPACE_MEMBERS_MANAGER]: {
    name: defineMessage`Manage members`,
  },
  [WorkspacePermission.WORKSPACE_ROLES_MANAGER]: {
    name: defineMessage`Manage roles`,
  },
  [WorkspacePermission.WORKSPACE_SETTINGS]: {
    name: defineMessage`Change settings`,
  },
  [WorkspacePermission.WORKSPACE_BILLINGS_MANAGER]: {
    name: defineMessage`Manage billings`,
  },
  [WorkspacePermission.REPORTS_VIEW]: {
    name: defineMessage`View reports`,
  },
  [WorkspacePermission.PRESCRIPTIONS_WRITE]: {
    name: defineMessage`Manage prescriptions`,
  },
  [WorkspacePermission.MESSAGE_BOXES_MANAGER]: {
    name: defineMessage`Manage message boxes`,
  },
  [WorkspacePermission.TABLE_SLOTS_WRITE]: {
    name: defineMessage`Manage tables`,
  },
  [WorkspacePermission.COUPONS_MANAGER]: {
    name: defineMessage`Manage coupons`,
  },
  [WorkspacePermission.VOUCHERS_MANAGER]: {
    name: defineMessage`Manage vouchers`,
  },
  [WorkspacePermission.CUSTOMERS_ARCHIVE]: {
    name: defineMessage`Archive customer`,
  },
  [WorkspacePermission.RECEIPTS_ARCHIVE]: {
    name: defineMessage`Archive receipt`,
  },
  [WorkspacePermission.RECEIPTS_UPDATE]: {
    name: defineMessage`Update receipt`,
  },
  [WorkspacePermission.WORKSPACE_BRANCHES_FULL_ACCESS]: {
    name: defineMessage`Access all branches`,
  },
  [WorkspacePermission.ORDERS_VIEW]: {
    name: defineMessage`View orders / service ticket`,
  },
  [WorkspacePermission.ORDERS_CREATE]: {
    name: defineMessage`Create order / service ticket`,
  },
  [WorkspacePermission.ORDERS_UPDATE]: {
    name: defineMessage`Update order / service ticket`,
  },
  [WorkspacePermission.ORDERS_ARCHIVE]: {
    name: defineMessage`Archive order / service ticket`,
  },
  [WorkspacePermission.PRODUCT_STOCK_IN]: {
    name: defineMessage`Stock in`,
  },
  [WorkspacePermission.PRODUCT_STOCK_OUT]: {
    name: defineMessage`Stock out`,
  },
  [WorkspacePermission.PRODUCT_STOCK_IN_REVERT]: {
    name: defineMessage`Revert stock in`,
  },
  [WorkspacePermission.PRODUCT_STOCK_OUT_REVERT]: {
    name: defineMessage`Revert stock out`,
  },
  [WorkspacePermission.EXPORT_DATA]: {
    name: defineMessage`Export data`,
  },
  [WorkspacePermission.PRODUCT_STOCK_VIEW]: {
    name: defineMessage`View stock`,
  },
  [WorkspacePermission.PRODUCT_COMBOS_VIEW]: {
    name: defineMessage`View Combos`,
  },
  [WorkspacePermission.PRODUCT_COMBOS_MANAGER]: {
    name: defineMessage`Manage Combos`,
  },
  [WorkspacePermission.CUSTOMER_FORMS_MANAGER]: {
    name: defineMessage`Manage customer forms`,
  },
  [WorkspacePermission.LOANS_CUSTOM_FULFILLED_AT]: {
    name: defineMessage`Change fulfilled at`,
  },
  [WorkspacePermission.POSTS_VIEW]: {
    name: defineMessage`View posts`,
  },
  [WorkspacePermission.POSTS_MANAGER]: {
    name: defineMessage`Manage posts`,
  },
  [WorkspacePermission.CUSTOM_FIELDS_MANAGER]: {
    name: defineMessage`Manage custom fields`,
  },
  [WorkspacePermission.PROMOTIONS_VIEW]: {
    name: defineMessage`View promotions`,
  },
  [WorkspacePermission.PROMOTIONS_MANAGER]: {
    name: defineMessage`Manage promotions`,
  },
  [WorkspacePermission.CATEGORIES_VIEW]: {
    name: defineMessage`View categories`,
  },
  [WorkspacePermission.CATEGORIES_MANAGER]: {
    name: defineMessage`Manage categories`,
  },
  [WorkspacePermission.LOANS_APPROVED_REVERTED]: {
    name: defineMessage`Revert loan approve`,
  },
  [WorkspacePermission.RECEIPTS_REVERT_PAYMENT]: {
    name: defineMessage`Revert payment`,
  },
  [WorkspacePermission.LOANS_FULFILLED_REVERTED]: {
    name: defineMessage`Revert loan fulfill`,
  },
  [WorkspacePermission.RECEIPTS_EXPORT_E_INVOICE]: {
    name: defineMessage`Export e-invoice`,
  },
  [WorkspacePermission.ATTENDANCE_RECORDS_MANAGER]: {
    name: defineMessage`Manage attendance records`,
  },
};
