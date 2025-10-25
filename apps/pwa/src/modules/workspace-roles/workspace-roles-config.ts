import { WorkspaceType } from "../workspaces/workspaces-types";
import { WorkspacePermission } from "./workspace-roles-types";

export enum PermissionGroupKey {
  LOANS = "loans",
  CUSTOMERS = "customers",
  BOOKINGS = "bookings",
  ORDERS = "orders",
  RECEIPTS = "receipts",
  PRODUCTS_SERVICES = "products_services",
  PRODUCT_STOCKS = "product_stocks",
  PARTNERS = "partners",
  MEMBERS = "members",
  WORKSPACE = "workspace",
  PRESCRIPTIONS = "prescriptions",
  REPORTS = "reports",
  PROMOTIONS = "promotions",
  POSTS = "posts",
  CATEGORIES = "categories",
  DATA = "data",
}

export interface PermissionGroup {
  workspaceTypes?: WorkspaceType[];
  permissions: { value: WorkspacePermission; dependentPermissions?: WorkspacePermission[] }[];
}

export const permissionGroups: {
  [key in PermissionGroupKey]: PermissionGroup;
} = {
  [PermissionGroupKey.LOANS]: {
    workspaceTypes: [WorkspaceType.CREDIT],
    permissions: [
      { value: WorkspacePermission.LOANS_VIEW },
      {
        value: WorkspacePermission.LOANS_CREATOR,
        dependentPermissions: [
          WorkspacePermission.LOANS_VIEW,
          WorkspacePermission.CUSTOMERS_VIEW,
          WorkspacePermission.CUSTOMERS_VIEW_CONTACT,
          WorkspacePermission.CUSTOMERS_CREATE,
        ],
      },
      {
        value: WorkspacePermission.LOANS_APPROVE,
        dependentPermissions: [WorkspacePermission.LOANS_VIEW, WorkspacePermission.CUSTOMERS_VIEW],
      },
      {
        value: WorkspacePermission.LOANS_APPROVED_REVERTED,
        dependentPermissions: [WorkspacePermission.LOANS_VIEW, WorkspacePermission.CUSTOMERS_VIEW],
      },
      {
        value: WorkspacePermission.LOANS_FULFILL,
        dependentPermissions: [WorkspacePermission.LOANS_VIEW, WorkspacePermission.RECEIPTS_CREATE],
      },
      {
        value: WorkspacePermission.LOANS_FULFILLED_REVERTED,
        dependentPermissions: [WorkspacePermission.LOANS_VIEW, WorkspacePermission.CUSTOMERS_VIEW],
      },
      {
        value: WorkspacePermission.LOANS_CUSTOM_FULFILLED_AT,
        dependentPermissions: [WorkspacePermission.LOANS_FULFILL],
      },
      {
        value: WorkspacePermission.LOANS_PAY,
        dependentPermissions: [WorkspacePermission.LOANS_VIEW],
      },
      {
        value: WorkspacePermission.LOANS_UPDATE_WORKSPACE_BRANCH,
        dependentPermissions: [WorkspacePermission.LOANS_VIEW],
      },
      {
        value: WorkspacePermission.LOANS_ARCHIVE,
        dependentPermissions: [WorkspacePermission.LOANS_VIEW],
      },
    ],
  },
  [PermissionGroupKey.CUSTOMERS]: {
    permissions: [
      { value: WorkspacePermission.CUSTOMERS_VIEW },
      {
        value: WorkspacePermission.CUSTOMERS_CREATE,
        dependentPermissions: [WorkspacePermission.CUSTOMERS_VIEW],
      },
      {
        value: WorkspacePermission.CUSTOMERS_VIEW_CONTACT,
        dependentPermissions: [WorkspacePermission.CUSTOMERS_VIEW],
      },
      {
        value: WorkspacePermission.CUSTOMERS_UPDATE_INFO,
        dependentPermissions: [
          WorkspacePermission.CUSTOMERS_VIEW,
          WorkspacePermission.CUSTOMERS_VIEW_CONTACT,
        ],
      },
      {
        value: WorkspacePermission.CUSTOMERS_ASSIGN,
        dependentPermissions: [WorkspacePermission.CUSTOMERS_VIEW],
      },
      {
        value: WorkspacePermission.CUSTOMERS_ARCHIVE,
        dependentPermissions: [WorkspacePermission.CUSTOMERS_VIEW],
      },
      {
        value: WorkspacePermission.CUSTOMER_KYCS_MANAGER,
        dependentPermissions: [WorkspacePermission.CUSTOMERS_UPDATE_INFO],
      },
      {
        value: WorkspacePermission.MESSAGE_BOXES_MANAGER,
        dependentPermissions: [WorkspacePermission.CUSTOMERS_VIEW],
      },
      { value: WorkspacePermission.CUSTOMER_FORMS_MANAGER },
    ],
  },
  [PermissionGroupKey.PROMOTIONS]: {
    permissions: [
      { value: WorkspacePermission.PRODUCT_COMBOS_VIEW },
      {
        value: WorkspacePermission.PRODUCT_COMBOS_MANAGER,
        dependentPermissions: [
          WorkspacePermission.PRODUCT_COMBOS_VIEW,
          WorkspacePermission.PRODUCTS_SERVICES_WRITE,
        ],
      },
    ],
  },
  [PermissionGroupKey.BOOKINGS]: {
    permissions: [
      { value: WorkspacePermission.BOOKING_VIEW },
      {
        value: WorkspacePermission.BOOKING_MANAGER,
        dependentPermissions: [
          WorkspacePermission.BOOKING_VIEW,
          WorkspacePermission.CUSTOMERS_VIEW,
        ],
      },
    ],
  },
  [PermissionGroupKey.RECEIPTS]: {
    permissions: [
      { value: WorkspacePermission.RECEIPTS_VIEW },
      {
        value: WorkspacePermission.RECEIPTS_CREATE,
        dependentPermissions: [
          WorkspacePermission.RECEIPTS_VIEW,
          WorkspacePermission.CUSTOMERS_VIEW,
        ],
      },
      {
        value: WorkspacePermission.RECEIPTS_UPDATE,
        dependentPermissions: [
          WorkspacePermission.RECEIPTS_VIEW,
          WorkspacePermission.CUSTOMERS_VIEW,
        ],
      },
      {
        value: WorkspacePermission.RECEIPTS_CENSORSHIP,
        dependentPermissions: [
          WorkspacePermission.RECEIPTS_VIEW,
          WorkspacePermission.CUSTOMERS_VIEW,
        ],
      },
      {
        value: WorkspacePermission.RECEIPTS_REVERT_PAYMENT,
        dependentPermissions: [
          WorkspacePermission.RECEIPTS_VIEW,
          WorkspacePermission.CUSTOMERS_VIEW,
        ],
      },
      {
        value: WorkspacePermission.RECEIPTS_EXPORT_E_INVOICE,
        dependentPermissions: [WorkspacePermission.RECEIPTS_VIEW],
      },
    ],
  },
  [PermissionGroupKey.ORDERS]: {
    permissions: [
      { value: WorkspacePermission.ORDERS_VIEW },
      {
        value: WorkspacePermission.ORDERS_CREATE,
        dependentPermissions: [
          WorkspacePermission.ORDERS_VIEW,
          WorkspacePermission.CUSTOMERS_VIEW,
          WorkspacePermission.RECEIPTS_CREATE,
        ],
      },
      {
        value: WorkspacePermission.ORDERS_UPDATE,
        dependentPermissions: [WorkspacePermission.ORDERS_VIEW],
      },
      {
        value: WorkspacePermission.ORDERS_ARCHIVE,
        dependentPermissions: [WorkspacePermission.ORDERS_VIEW],
      },
    ],
  },
  [PermissionGroupKey.PRODUCTS_SERVICES]: {
    permissions: [{ value: WorkspacePermission.PRODUCTS_SERVICES_WRITE }],
  },
  [PermissionGroupKey.PRODUCT_STOCKS]: {
    permissions: [
      { value: WorkspacePermission.PRODUCT_STOCK_VIEW },
      {
        value: WorkspacePermission.PRODUCT_STOCK_IN,
        dependentPermissions: [
          WorkspacePermission.PRODUCTS_SERVICES_WRITE,
          WorkspacePermission.PRODUCT_STOCK_VIEW,
        ],
      },
      {
        value: WorkspacePermission.PRODUCT_STOCK_IN_REVERT,
        dependentPermissions: [
          WorkspacePermission.PRODUCTS_SERVICES_WRITE,
          WorkspacePermission.PRODUCT_STOCK_VIEW,
        ],
      },
      {
        value: WorkspacePermission.PRODUCT_STOCK_OUT,
        dependentPermissions: [
          WorkspacePermission.PRODUCTS_SERVICES_WRITE,
          WorkspacePermission.PRODUCT_STOCK_VIEW,
        ],
      },
      {
        value: WorkspacePermission.PRODUCT_STOCK_OUT_REVERT,
        dependentPermissions: [
          WorkspacePermission.PRODUCTS_SERVICES_WRITE,
          WorkspacePermission.PRODUCT_STOCK_VIEW,
        ],
      },
    ],
  },
  [PermissionGroupKey.PRESCRIPTIONS]: {
    workspaceTypes: [WorkspaceType.CLINIC, WorkspaceType.DENTAL, WorkspaceType.HOSPITAL],
    permissions: [{ value: WorkspacePermission.PRESCRIPTIONS_WRITE }],
  },
  [PermissionGroupKey.PARTNERS]: {
    permissions: [{ value: WorkspacePermission.PARTNERS_WRITE }],
  },
  [PermissionGroupKey.MEMBERS]: {
    permissions: [
      { value: WorkspacePermission.WORKSPACE_MEMBERS_VIEW },
      {
        value: WorkspacePermission.WORKSPACE_MEMBERS_MANAGER,
        dependentPermissions: [WorkspacePermission.WORKSPACE_MEMBERS_VIEW],
      },
    ],
  },
  [PermissionGroupKey.WORKSPACE]: {
    permissions: [
      { value: WorkspacePermission.WORKSPACE_SETTINGS },
      { value: WorkspacePermission.WORKSPACE_BRANCHES_FULL_ACCESS },
    ],
  },
  [PermissionGroupKey.POSTS]: {
    permissions: [
      { value: WorkspacePermission.POSTS_VIEW },
      {
        value: WorkspacePermission.POSTS_MANAGER,
        dependentPermissions: [WorkspacePermission.POSTS_VIEW],
      },
    ],
  },
  [PermissionGroupKey.CATEGORIES]: {
    permissions: [
      { value: WorkspacePermission.CATEGORIES_VIEW },
      {
        value: WorkspacePermission.CATEGORIES_MANAGER,
        dependentPermissions: [WorkspacePermission.CATEGORIES_VIEW],
      },
    ],
  },
  [PermissionGroupKey.REPORTS]: {
    permissions: [{ value: WorkspacePermission.REPORTS_VIEW }],
  },
  [PermissionGroupKey.DATA]: {
    permissions: [{ value: WorkspacePermission.EXPORT_DATA }],
  },
};
