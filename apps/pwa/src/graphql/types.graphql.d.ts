export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  /** The `AnyType` scalar type represents any value without restrictions. */
  AnyType: { input: any; output: any; }
  /** The `JSONObject` scalar type represents JSON objects as specified by [ECMA-404](http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-404.pdf). */
  JSONObject: { input: any; output: any; }
};

export type ActivitiesPaginated = {
  __typename: 'ActivitiesPaginated';
  results: Array<Activity>;
  total: Scalars['Float']['output'];
};

export type Activity = {
  __typename: 'Activity';
  _id: Scalars['String']['output'];
  childCount: Maybe<Scalars['Float']['output']>;
  content: Maybe<Scalars['String']['output']>;
  contentLastModifiedAt: Maybe<Scalars['Float']['output']>;
  contextId: Scalars['String']['output'];
  contextType: Scalars['String']['output'];
  createdAt: Maybe<Scalars['Float']['output']>;
  createdByUser: WorkspaceMember;
  data: Maybe<Scalars['JSONObject']['output']>;
  isPinned: Maybe<Scalars['Boolean']['output']>;
  parentId: Maybe<Scalars['String']['output']>;
  pinnedAt: Maybe<Scalars['Float']['output']>;
  pinnedByUser: WorkspaceMember;
  pinnedByUserId: Maybe<Scalars['String']['output']>;
  reactionsCount: ReactionsCount;
  type: ActivityType;
  updatedAt: Maybe<Scalars['Float']['output']>;
};

/** Available activity types */
export const ActivityType = {
  Comment: 'COMMENT',
  Common: 'COMMON'
} as const;

export type ActivityType = typeof ActivityType[keyof typeof ActivityType];
export type AppConfig = {
  __typename: 'AppConfig';
  UTC: Scalars['String']['output'];
  firebase: FirebaseClientConfig;
  metaAppId: Scalars['String']['output'];
  metaAppScope: Array<Scalars['String']['output']>;
  metaAppVersion: Scalars['String']['output'];
  name: Scalars['String']['output'];
  timeZone: Scalars['String']['output'];
  version: Scalars['String']['output'];
  workspaceDomainIP: Scalars['String']['output'];
  zaloAppId: Scalars['String']['output'];
};

/** Available locales */
export const AppLocale = {
  En: 'EN',
  Vi: 'VI'
} as const;

export type AppLocale = typeof AppLocale[keyof typeof AppLocale];
export type BaseCustomFieldValue = {
  __typename: 'BaseCustomFieldValue';
  customFieldId: Scalars['String']['output'];
  value: Maybe<Scalars['AnyType']['output']>;
};

export type Booking = {
  __typename: 'Booking';
  _id: Scalars['String']['output'];
  assigneeUserIds: Array<Scalars['String']['output']>;
  assigneeUsers: Array<WorkspaceMember>;
  createdAt: Maybe<Scalars['Float']['output']>;
  customFieldValues: Maybe<Array<CustomFieldValue>>;
  customer: Maybe<Customer>;
  customerId: Maybe<Scalars['String']['output']>;
  endTime: Scalars['Float']['output'];
  note: Maybe<Scalars['String']['output']>;
  reasonForCancellation: Maybe<Scalars['String']['output']>;
  refs: Maybe<Array<Scalars['String']['output']>>;
  startTime: Scalars['Float']['output'];
  status: BookingStatus;
  title: Maybe<Scalars['String']['output']>;
  transferToBookingId: Maybe<Scalars['String']['output']>;
  updatedAt: Maybe<Scalars['Float']['output']>;
  workspaceId: Scalars['String']['output'];
};

/** Booking statuses */
export const BookingStatus = {
  Cancelled: 'CANCELLED',
  CheckIn: 'CHECK_IN',
  Completed: 'COMPLETED',
  InProgress: 'IN_PROGRESS',
  JustCreated: 'JUST_CREATED',
  Rescheduled: 'RESCHEDULED'
} as const;

export type BookingStatus = typeof BookingStatus[keyof typeof BookingStatus];
export type BookingsPaginated = {
  __typename: 'BookingsPaginated';
  results: Array<Booking>;
  total: Scalars['Float']['output'];
};

export type CategoriesPaginated = {
  __typename: 'CategoriesPaginated';
  results: Array<Category>;
  total: Scalars['Float']['output'];
};

export type Category = {
  __typename: 'Category';
  _id: Scalars['String']['output'];
  createdAt: Maybe<Scalars['Float']['output']>;
  customFieldValues: Maybe<Array<CustomFieldValue>>;
  customFields: Array<CustomField>;
  description: Maybe<Scalars['String']['output']>;
  icon: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  order: Scalars['Float']['output'];
  parentId: Maybe<Scalars['String']['output']>;
  refs: Maybe<Array<Scalars['String']['output']>>;
  slug: Scalars['String']['output'];
  thumbnail: Maybe<Scalars['String']['output']>;
  type: CategoryType;
  updatedAt: Maybe<Scalars['Float']['output']>;
};

/** Available category types */
export const CategoryType = {
  Common: 'COMMON',
  Posts: 'POSTS',
  Products: 'PRODUCTS'
} as const;

export type CategoryType = typeof CategoryType[keyof typeof CategoryType];
export type CheckInLocation = {
  __typename: 'CheckInLocation';
  coordinates: Coordinates;
  disabled: Maybe<Scalars['Boolean']['output']>;
  name: Scalars['String']['output'];
  radius: Scalars['Float']['output'];
};

export type CheckInLocationInput = {
  coordinates: CoordinatesInput;
  disabled?: InputMaybe<Scalars['Boolean']['input']>;
  name: Scalars['String']['input'];
  radius: Scalars['Float']['input'];
};

export type ConfigTaskStatuses = {
  __typename: 'ConfigTaskStatuses';
  isInherited: Scalars['Boolean']['output'];
  statuses: Array<TaskStatus>;
  workspaceStatuses: Array<TaskStatus>;
};

export type Coordinates = {
  __typename: 'Coordinates';
  lat: Scalars['Float']['output'];
  lng: Scalars['Float']['output'];
};

export type CoordinatesInput = {
  lat: Scalars['Float']['input'];
  lng: Scalars['Float']['input'];
};

export type Coupon = {
  __typename: 'Coupon';
  _id: Scalars['String']['output'];
  code: Maybe<Scalars['String']['output']>;
  createdAt: Maybe<Scalars['Float']['output']>;
  customFieldValues: Maybe<Array<CustomFieldValue>>;
  customerId: Maybe<Scalars['String']['output']>;
  expiredAt: Maybe<Scalars['Float']['output']>;
  isExpired: Maybe<Scalars['Boolean']['output']>;
  quantity: Scalars['Float']['output'];
  receiptId: Maybe<Scalars['String']['output']>;
  refs: Maybe<Array<Scalars['String']['output']>>;
  rule: CouponRule;
  ruleId: Scalars['String']['output'];
  ticketId: Maybe<Scalars['String']['output']>;
  updatedAt: Maybe<Scalars['Float']['output']>;
};

export type CouponRule = {
  __typename: 'CouponRule';
  _id: Scalars['String']['output'];
  benefits: Array<CouponRuleBenefit>;
  createdAt: Maybe<Scalars['Float']['output']>;
  customFieldValues: Maybe<Array<CustomFieldValue>>;
  description: Maybe<Scalars['String']['output']>;
  image: Maybe<Scalars['String']['output']>;
  isActive: Scalars['Boolean']['output'];
  isCumulative: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
  refs: Maybe<Array<Scalars['String']['output']>>;
  terms: Array<CouponRuleTerm>;
  updatedAt: Maybe<Scalars['Float']['output']>;
};

export type CouponRuleBenefit = {
  __typename: 'CouponRuleBenefit';
  data: Scalars['AnyType']['output'];
  type: CouponRuleBenefitType;
};

/** Available coupon rule benefit types */
export const CouponRuleBenefitType = {
  DiscountOnProduct: 'DISCOUNT_ON_PRODUCT',
  DiscountOnTotal: 'DISCOUNT_ON_TOTAL',
  FreeOnProduct: 'FREE_ON_PRODUCT'
} as const;

export type CouponRuleBenefitType = typeof CouponRuleBenefitType[keyof typeof CouponRuleBenefitType];
export type CouponRuleTerm = {
  __typename: 'CouponRuleTerm';
  data: Scalars['AnyType']['output'];
  type: CouponRuleTermType;
};

/** Available coupon rule term types */
export const CouponRuleTermType = {
  LimitProducts: 'LIMIT_PRODUCTS',
  MinimumTotal: 'MINIMUM_TOTAL'
} as const;

export type CouponRuleTermType = typeof CouponRuleTermType[keyof typeof CouponRuleTermType];
export type CouponRulesPaginated = {
  __typename: 'CouponRulesPaginated';
  results: Array<CouponRule>;
  total: Scalars['Float']['output'];
};

export type CouponsPaginated = {
  __typename: 'CouponsPaginated';
  results: Array<Coupon>;
  total: Scalars['Float']['output'];
};

export type CreateTaskInput = {
  _id?: InputMaybe<Scalars['String']['input']>;
  assigneeUserIds?: InputMaybe<Array<Scalars['String']['input']>>;
  customerId?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  dueDate?: InputMaybe<Scalars['Float']['input']>;
  estimatedTime?: InputMaybe<Scalars['Float']['input']>;
  folderId?: InputMaybe<Scalars['String']['input']>;
  isArchived?: InputMaybe<Scalars['Boolean']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  order?: InputMaybe<Scalars['Float']['input']>;
  parentId?: InputMaybe<Scalars['String']['input']>;
  partnerIds?: InputMaybe<Array<Scalars['String']['input']>>;
  points?: InputMaybe<Scalars['Float']['input']>;
  priority?: InputMaybe<TaskPriority>;
  startDate?: InputMaybe<Scalars['Float']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
  tagIds?: InputMaybe<Array<Scalars['String']['input']>>;
  timeTrackings?: InputMaybe<Array<TaskTimeTrackingInput>>;
  workspaceBranchId?: InputMaybe<Scalars['String']['input']>;
};

export type CustomField = {
  __typename: 'CustomField';
  _id: Scalars['String']['output'];
  config: Maybe<Scalars['JSONObject']['output']>;
  createdAt: Maybe<Scalars['Float']['output']>;
  customFieldValues: Maybe<Array<CustomFieldValue>>;
  description: Maybe<Scalars['String']['output']>;
  entities: Array<Scalars['String']['output']>;
  key: Maybe<Scalars['String']['output']>;
  label: Scalars['String']['output'];
  order: Scalars['Float']['output'];
  placeholder: Maybe<Scalars['String']['output']>;
  refs: Maybe<Array<Scalars['String']['output']>>;
  type: CustomFieldType;
  updatedAt: Maybe<Scalars['Float']['output']>;
};

/** Available custom field types */
export const CustomFieldType = {
  Date: 'DATE',
  File: 'FILE',
  MultiSelect: 'MULTI_SELECT',
  Number: 'NUMBER',
  Select: 'SELECT',
  Switch: 'SWITCH',
  Text: 'TEXT',
  Textarea: 'TEXTAREA'
} as const;

export type CustomFieldType = typeof CustomFieldType[keyof typeof CustomFieldType];
export type CustomFieldValue = {
  __typename: 'CustomFieldValue';
  config: Maybe<Scalars['JSONObject']['output']>;
  customFieldId: Scalars['String']['output'];
  key: Maybe<Scalars['String']['output']>;
  type: CustomFieldType;
  value: Maybe<Scalars['AnyType']['output']>;
};

export type CustomFieldValueInput = {
  customFieldId: Scalars['String']['input'];
  value?: InputMaybe<Scalars['AnyType']['input']>;
};

export type CustomFieldsPaginated = {
  __typename: 'CustomFieldsPaginated';
  results: Array<CustomField>;
  total: Scalars['Float']['output'];
};

export type Customer = {
  __typename: 'Customer';
  _id: Scalars['String']['output'];
  assigneeUserIds: Maybe<Array<Scalars['String']['output']>>;
  avatar: Maybe<Scalars['String']['output']>;
  birthday: Maybe<Scalars['Float']['output']>;
  birthdayDate: Maybe<Scalars['Float']['output']>;
  birthdayMonth: Maybe<Scalars['Float']['output']>;
  code: Scalars['String']['output'];
  codePrefix: Maybe<Scalars['String']['output']>;
  createdAt: Maybe<Scalars['Float']['output']>;
  customFieldValues: Maybe<Array<CustomFieldValue>>;
  email: Maybe<Scalars['String']['output']>;
  gender: Maybe<Gender>;
  lastCheckin: Maybe<Scalars['Float']['output']>;
  location: Maybe<LocationEntity>;
  medicalHistory: Maybe<Array<Scalars['String']['output']>>;
  name: Scalars['String']['output'];
  phone: Maybe<Scalars['String']['output']>;
  plainCode: Maybe<Scalars['String']['output']>;
  presenterCustomerId: Maybe<Scalars['String']['output']>;
  refs: Maybe<Array<Scalars['String']['output']>>;
  relatedCustomerIds: Maybe<Array<Scalars['String']['output']>>;
  salaryAmount: Maybe<Scalars['Float']['output']>;
  secondaryLocation: Maybe<LocationEntity>;
  tagIds: Maybe<Array<Scalars['String']['output']>>;
  updatedAt: Maybe<Scalars['Float']['output']>;
  vnLocation: Maybe<LocationEntity>;
  vnSecondaryLocation: Maybe<LocationEntity>;
  workspaceBranch: Maybe<WorkspaceBranch>;
  workspaceBranchId: Maybe<Scalars['String']['output']>;
};

export type CustomerForm = {
  __typename: 'CustomerForm';
  _id: Scalars['String']['output'];
  cancelReason: Maybe<Scalars['String']['output']>;
  createdAt: Maybe<Scalars['Float']['output']>;
  customFieldValues: Maybe<Array<CustomFieldValue>>;
  dynamicData: Maybe<Scalars['AnyType']['output']>;
  email: Maybe<Scalars['String']['output']>;
  location: Maybe<LocationEntity>;
  name: Scalars['String']['output'];
  phone: Scalars['String']['output'];
  refs: Maybe<Array<Scalars['String']['output']>>;
  status: CustomerFormStatus;
  updatedAt: Maybe<Scalars['Float']['output']>;
  vnLocation: Maybe<LocationEntity>;
  workspaceBranch: Maybe<WorkspaceBranch>;
};

/** Available customer form statuses */
export const CustomerFormStatus = {
  Cancelled: 'CANCELLED',
  Completed: 'COMPLETED',
  Pending: 'PENDING'
} as const;

export type CustomerFormStatus = typeof CustomerFormStatus[keyof typeof CustomerFormStatus];
export type CustomerFormsPaginated = {
  __typename: 'CustomerFormsPaginated';
  results: Array<CustomerForm>;
  total: Scalars['Float']['output'];
};

export type CustomersPaginated = {
  __typename: 'CustomersPaginated';
  results: Array<Customer>;
  total: Scalars['Float']['output'];
};

export type DeviceEntity = {
  __typename: 'DeviceEntity';
  _id: Scalars['String']['output'];
  createdAt: Maybe<Scalars['Float']['output']>;
  customFieldValues: Maybe<Array<CustomFieldValue>>;
  identifyId: Maybe<Scalars['String']['output']>;
  lastActiveAt: Scalars['Float']['output'];
  locale: Maybe<AppLocale>;
  notificationToken: Maybe<Scalars['String']['output']>;
  refs: Maybe<Array<Scalars['String']['output']>>;
  updatedAt: Maybe<Scalars['Float']['output']>;
  userAgent: Scalars['String']['output'];
  userId: Maybe<Scalars['String']['output']>;
};

export type DisplayWidget = {
  __typename: 'DisplayWidget';
  id: Scalars['String']['output'];
  state: Maybe<Scalars['JSONObject']['output']>;
  type: Scalars['String']['output'];
};

export type DisplayWidgetInput = {
  id: Scalars['String']['input'];
  state?: InputMaybe<Scalars['JSONObject']['input']>;
  type: Scalars['String']['input'];
};

export type EInvoice = {
  __typename: 'EInvoice';
  _id: Scalars['String']['output'];
  createdAt: Maybe<Scalars['Float']['output']>;
  customFieldValues: Maybe<Array<CustomFieldValue>>;
  invoiceData: Maybe<Scalars['JSONObject']['output']>;
  invoiceId: Scalars['String']['output'];
  isCancelled: Maybe<Scalars['Boolean']['output']>;
  provider: PluginEInvoicesProviderType;
  providerData: Maybe<Scalars['JSONObject']['output']>;
  providerId: Scalars['String']['output'];
  receiptCode: Scalars['String']['output'];
  receiptId: Scalars['String']['output'];
  refs: Maybe<Array<Scalars['String']['output']>>;
  updatedAt: Maybe<Scalars['Float']['output']>;
  url: Maybe<Scalars['String']['output']>;
};

export type Event = {
  __typename: 'Event';
  _id: Scalars['String']['output'];
  actionType: Maybe<EventDataActionType>;
  channel: Maybe<EventChannel>;
  createdAt: Maybe<Scalars['Float']['output']>;
  customFieldValues: Maybe<Array<CustomFieldValue>>;
  data: Maybe<Scalars['JSONObject']['output']>;
  persist: Maybe<Scalars['Boolean']['output']>;
  ref: Maybe<Scalars['String']['output']>;
  refs: Maybe<Array<Scalars['String']['output']>>;
  sessionId: Maybe<Scalars['String']['output']>;
  time: Scalars['Float']['output'];
  type: EventType;
  updatedAt: Maybe<Scalars['Float']['output']>;
  user: Maybe<WorkspaceMember>;
  userId: Maybe<Scalars['String']['output']>;
  variant: Maybe<EventVariant>;
};

/** Available event channels */
export const EventChannel = {
  None: 'NONE',
  Personal: 'PERSONAL',
  Workspace: 'WORKSPACE'
} as const;

export type EventChannel = typeof EventChannel[keyof typeof EventChannel];
/** Available event data action types */
export const EventDataActionType = {
  Archived: 'ARCHIVED',
  Create: 'CREATE',
  Update: 'UPDATE'
} as const;

export type EventDataActionType = typeof EventDataActionType[keyof typeof EventDataActionType];
/** Available event types */
export const EventType = {
  ActivityArchived: 'ACTIVITY_ARCHIVED',
  ActivityNew: 'ACTIVITY_NEW',
  ActivitySynced: 'ACTIVITY_SYNCED',
  ActivityUpdated: 'ACTIVITY_UPDATED',
  BankTransactionCancelled: 'BANK_TRANSACTION_CANCELLED',
  BankTransactionFailed: 'BANK_TRANSACTION_FAILED',
  BankTransactionFulfilled: 'BANK_TRANSACTION_FULFILLED',
  BankTransactionPaid: 'BANK_TRANSACTION_PAID',
  BookingCancelled: 'BOOKING_CANCELLED',
  BookingCheckin: 'BOOKING_CHECKIN',
  BookingCompleted: 'BOOKING_COMPLETED',
  BookingInProgress: 'BOOKING_IN_PROGRESS',
  BookingNew: 'BOOKING_NEW',
  BookingUpdated: 'BOOKING_UPDATED',
  CategoryArchived: 'CATEGORY_ARCHIVED',
  CategoryNew: 'CATEGORY_NEW',
  CategoryUpdated: 'CATEGORY_UPDATED',
  CommentNew: 'COMMENT_NEW',
  CommentPinned: 'COMMENT_PINNED',
  CommentRemoved: 'COMMENT_REMOVED',
  CommentUnpinned: 'COMMENT_UNPINNED',
  CommentUpdated: 'COMMENT_UPDATED',
  CouponsCreated: 'COUPONS_CREATED',
  CouponsUsed: 'COUPONS_USED',
  CouponRulesArchived: 'COUPON_RULES_ARCHIVED',
  CouponRulesCreated: 'COUPON_RULES_CREATED',
  CouponRulesUpdated: 'COUPON_RULES_UPDATED',
  CustomerArchived: 'CUSTOMER_ARCHIVED',
  CustomerAssignToUser: 'CUSTOMER_ASSIGN_TO_USER',
  CustomerBulkUpdateWorkspaceBranch: 'CUSTOMER_BULK_UPDATE_WORKSPACE_BRANCH',
  CustomerContactsUpdated: 'CUSTOMER_CONTACTS_UPDATED',
  CustomerFormArchived: 'CUSTOMER_FORM_ARCHIVED',
  CustomerFormNew: 'CUSTOMER_FORM_NEW',
  CustomerFormUpdated: 'CUSTOMER_FORM_UPDATED',
  CustomerKycApproved: 'CUSTOMER_KYC_APPROVED',
  CustomerKycPending: 'CUSTOMER_KYC_PENDING',
  CustomerKycRejected: 'CUSTOMER_KYC_REJECTED',
  CustomerNew: 'CUSTOMER_NEW',
  CustomerUnassignUser: 'CUSTOMER_UNASSIGN_USER',
  CustomerUpdated: 'CUSTOMER_UPDATED',
  CustomFieldsNew: 'CUSTOM_FIELDS_NEW',
  CustomFieldsRemoved: 'CUSTOM_FIELDS_REMOVED',
  CustomFieldsUpdated: 'CUSTOM_FIELDS_UPDATED',
  EInvoiceCreated: 'E_INVOICE_CREATED',
  EInvoiceRemoved: 'E_INVOICE_REMOVED',
  FileNew: 'FILE_NEW',
  FileRemoved: 'FILE_REMOVED',
  HrmTimekeepingManualApproval: 'HRM_TIMEKEEPING_MANUAL_APPROVAL',
  HrmTimekeepingMemberCheckIn: 'HRM_TIMEKEEPING_MEMBER_CHECK_IN',
  HrmTimekeepingMemberCheckOut: 'HRM_TIMEKEEPING_MEMBER_CHECK_OUT',
  HrmTimekeepingRejected: 'HRM_TIMEKEEPING_REJECTED',
  HrmTimekeepingRemoved: 'HRM_TIMEKEEPING_REMOVED',
  LoansApproved: 'LOANS_APPROVED',
  LoansApprovedReverted: 'LOANS_APPROVED_REVERTED',
  LoansArchived: 'LOANS_ARCHIVED',
  LoansChangeWorkspaceBranch: 'LOANS_CHANGE_WORKSPACE_BRANCH',
  LoansCompleted: 'LOANS_COMPLETED',
  LoansFulfilled: 'LOANS_FULFILLED',
  LoansFulfilledReverted: 'LOANS_FULFILLED_REVERTED',
  LoansJustCreated: 'LOANS_JUST_CREATED',
  LoansLiquidation: 'LOANS_LIQUIDATION',
  LoansPending: 'LOANS_PENDING',
  LoansRejected: 'LOANS_REJECTED',
  LoansRevertLiquidation: 'LOANS_REVERT_LIQUIDATION',
  LoansRevertRejected: 'LOANS_REVERT_REJECTED',
  LoansSynced: 'LOANS_SYNCED',
  LoansUpdated: 'LOANS_UPDATED',
  MessageBoxClosed: 'MESSAGE_BOX_CLOSED',
  MessageBoxInProgress: 'MESSAGE_BOX_IN_PROGRESS',
  MessageBoxNew: 'MESSAGE_BOX_NEW',
  MessageBoxNewMessage: 'MESSAGE_BOX_NEW_MESSAGE',
  MessageBoxRemoved: 'MESSAGE_BOX_REMOVED',
  MessageBoxUpdated: 'MESSAGE_BOX_UPDATED',
  MessageBoxWaiting: 'MESSAGE_BOX_WAITING',
  MessageNew: 'MESSAGE_NEW',
  MessageUpdated: 'MESSAGE_UPDATED',
  NotificationCleaned: 'NOTIFICATION_CLEANED',
  NotificationListViewed: 'NOTIFICATION_LIST_VIEWED',
  NotificationNew: 'NOTIFICATION_NEW',
  NotificationReaded: 'NOTIFICATION_READED',
  OrderArchived: 'ORDER_ARCHIVED',
  OrderNew: 'ORDER_NEW',
  OrderSynced: 'ORDER_SYNCED',
  OrderUpdated: 'ORDER_UPDATED',
  PartnerArchived: 'PARTNER_ARCHIVED',
  PartnerNew: 'PARTNER_NEW',
  PartnerUpdated: 'PARTNER_UPDATED',
  PluginAiAssistantsNew: 'PLUGIN_AI_ASSISTANTS_NEW',
  PluginAiAssistantsRemoved: 'PLUGIN_AI_ASSISTANTS_REMOVED',
  PluginAiAssistantsUpdated: 'PLUGIN_AI_ASSISTANTS_UPDATED',
  PluginMessageHubsNew: 'PLUGIN_MESSAGE_HUBS_NEW',
  PluginMessageHubsRemoved: 'PLUGIN_MESSAGE_HUBS_REMOVED',
  PluginMessageHubsUpdated: 'PLUGIN_MESSAGE_HUBS_UPDATED',
  PluginMetaPagesDisconnected: 'PLUGIN_META_PAGES_DISCONNECTED',
  PluginMetaPagesUpdated: 'PLUGIN_META_PAGES_UPDATED',
  PluginZaloOaActive: 'PLUGIN_ZALO_OA_ACTIVE',
  PluginZaloOaDisabled: 'PLUGIN_ZALO_OA_DISABLED',
  PluginZaloOaEnabled: 'PLUGIN_ZALO_OA_ENABLED',
  PluginZaloOaInactive: 'PLUGIN_ZALO_OA_INACTIVE',
  PluginZaloOaUpdated: 'PLUGIN_ZALO_OA_UPDATED',
  PostArchived: 'POST_ARCHIVED',
  PostNew: 'POST_NEW',
  PostUpdated: 'POST_UPDATED',
  PrescriptionsNew: 'PRESCRIPTIONS_NEW',
  PrescriptionsRemoved: 'PRESCRIPTIONS_REMOVED',
  PrescriptionsUpdated: 'PRESCRIPTIONS_UPDATED',
  ProductArchived: 'PRODUCT_ARCHIVED',
  ProductComboNew: 'PRODUCT_COMBO_NEW',
  ProductComboUpdate: 'PRODUCT_COMBO_UPDATE',
  ProductNew: 'PRODUCT_NEW',
  ProductStockIn: 'PRODUCT_STOCK_IN',
  ProductStockInMultiple: 'PRODUCT_STOCK_IN_MULTIPLE',
  ProductStockInRevert: 'PRODUCT_STOCK_IN_REVERT',
  ProductStockOut: 'PRODUCT_STOCK_OUT',
  ProductStockOutRevert: 'PRODUCT_STOCK_OUT_REVERT',
  ProductSupplyRecordNew: 'PRODUCT_SUPPLY_RECORD_NEW',
  ProductUpdate: 'PRODUCT_UPDATE',
  ProductVouchersNew: 'PRODUCT_VOUCHERS_NEW',
  PromotionArchived: 'PROMOTION_ARCHIVED',
  PromotionNew: 'PROMOTION_NEW',
  PromotionUpdated: 'PROMOTION_UPDATED',
  ReactionAdded: 'REACTION_ADDED',
  ReactionRemoved: 'REACTION_REMOVED',
  ReceiptArchived: 'RECEIPT_ARCHIVED',
  ReceiptChangeWorkspaceBranch: 'RECEIPT_CHANGE_WORKSPACE_BRANCH',
  ReceiptDisbursement: 'RECEIPT_DISBURSEMENT',
  ReceiptNew: 'RECEIPT_NEW',
  ReceiptPaid: 'RECEIPT_PAID',
  ReceiptRevertPayment: 'RECEIPT_REVERT_PAYMENT',
  ReceiptSynced: 'RECEIPT_SYNCED',
  ReceiptUnarchived: 'RECEIPT_UNARCHIVED',
  ReceiptUpdated: 'RECEIPT_UPDATED',
  ReportRangeSynced: 'REPORT_RANGE_SYNCED',
  ReportRealtimeSynced: 'REPORT_REALTIME_SYNCED',
  TableSlotArchived: 'TABLE_SLOT_ARCHIVED',
  TableSlotNew: 'TABLE_SLOT_NEW',
  TableSlotUpdated: 'TABLE_SLOT_UPDATED',
  TagsArchived: 'TAGS_ARCHIVED',
  TagsUpdated: 'TAGS_UPDATED',
  TagNew: 'TAG_NEW',
  TasksUpdated: 'TASKS_UPDATED',
  TaskArchived: 'TASK_ARCHIVED',
  TaskAssigned: 'TASK_ASSIGNED',
  TaskDescriptionUpdated: 'TASK_DESCRIPTION_UPDATED',
  TaskMetricSynced: 'TASK_METRIC_SYNCED',
  TaskNameUpdated: 'TASK_NAME_UPDATED',
  TaskNew: 'TASK_NEW',
  TaskPriorityUpdated: 'TASK_PRIORITY_UPDATED',
  TaskStatusUpdated: 'TASK_STATUS_UPDATED',
  TaskSynced: 'TASK_SYNCED',
  UserOffline: 'USER_OFFLINE',
  UserOnline: 'USER_ONLINE',
  UserProfileUpdated: 'USER_PROFILE_UPDATED',
  WorkspaceApiAppArchived: 'WORKSPACE_API_APP_ARCHIVED',
  WorkspaceApiAppCreated: 'WORKSPACE_API_APP_CREATED',
  WorkspaceApiAppUpdated: 'WORKSPACE_API_APP_UPDATED',
  WorkspaceArchived: 'WORKSPACE_ARCHIVED',
  WorkspaceBillingsCashbackNew: 'WORKSPACE_BILLINGS_CASHBACK_NEW',
  WorkspaceBillingsDeposited: 'WORKSPACE_BILLINGS_DEPOSITED',
  WorkspaceBillingsPaymentNew: 'WORKSPACE_BILLINGS_PAYMENT_NEW',
  WorkspaceBillingsPaymentPaid: 'WORKSPACE_BILLINGS_PAYMENT_PAID',
  WorkspaceBillingsWithdrawn: 'WORKSPACE_BILLINGS_WITHDRAWN',
  WorkspaceBranchArchived: 'WORKSPACE_BRANCH_ARCHIVED',
  WorkspaceBranchNew: 'WORKSPACE_BRANCH_NEW',
  WorkspaceBranchUpdated: 'WORKSPACE_BRANCH_UPDATED',
  WorkspaceInviteCodeUpdated: 'WORKSPACE_INVITE_CODE_UPDATED',
  WorkspaceMemberAssignRoles: 'WORKSPACE_MEMBER_ASSIGN_ROLES',
  WorkspaceMemberJoined: 'WORKSPACE_MEMBER_JOINED',
  WorkspaceMemberLeaved: 'WORKSPACE_MEMBER_LEAVED',
  WorkspaceMemberOffline: 'WORKSPACE_MEMBER_OFFLINE',
  WorkspaceMemberOnline: 'WORKSPACE_MEMBER_ONLINE',
  WorkspaceMemberSynced: 'WORKSPACE_MEMBER_SYNCED',
  WorkspaceMemberTransferOwner: 'WORKSPACE_MEMBER_TRANSFER_OWNER',
  WorkspaceMemberUpdated: 'WORKSPACE_MEMBER_UPDATED',
  WorkspaceNew: 'WORKSPACE_NEW',
  WorkspaceRolesNew: 'WORKSPACE_ROLES_NEW',
  WorkspaceRolesRemoved: 'WORKSPACE_ROLES_REMOVED',
  WorkspaceRolesUpdated: 'WORKSPACE_ROLES_UPDATED',
  WorkspaceSettingUpdated: 'WORKSPACE_SETTING_UPDATED',
  WorkspaceStatsUpdated: 'WORKSPACE_STATS_UPDATED',
  WorkspaceSubscriptionUpdated: 'WORKSPACE_SUBSCRIPTION_UPDATED',
  WorkspaceUpdated: 'WORKSPACE_UPDATED'
} as const;

export type EventType = typeof EventType[keyof typeof EventType];
/** Available event variants */
export const EventVariant = {
  Info: 'INFO',
  Negative: 'NEGATIVE',
  Positive: 'POSITIVE',
  Warning: 'WARNING'
} as const;

export type EventVariant = typeof EventVariant[keyof typeof EventVariant];
export type EventsPaginated = {
  __typename: 'EventsPaginated';
  results: Array<Event>;
  total: Scalars['Float']['output'];
};

export type File = {
  __typename: 'File';
  _id: Scalars['String']['output'];
  createdAt: Maybe<Scalars['Float']['output']>;
  customFieldValues: Maybe<Array<CustomFieldValue>>;
  externalUrl: Maybe<Scalars['String']['output']>;
  fileName: Scalars['String']['output'];
  path: Scalars['String']['output'];
  ref: Maybe<Scalars['String']['output']>;
  refs: Maybe<Array<Scalars['String']['output']>>;
  relatedCustomerId: Maybe<Scalars['String']['output']>;
  relatedHrmTimekeepingId: Maybe<Scalars['String']['output']>;
  relatedMessageBoxId: Maybe<Scalars['String']['output']>;
  relatedMessageId: Maybe<Scalars['String']['output']>;
  relatedProductId: Maybe<Scalars['String']['output']>;
  relatedReceiptId: Maybe<Scalars['String']['output']>;
  relativePath: Maybe<Scalars['String']['output']>;
  size: Maybe<Scalars['Float']['output']>;
  thumbnail: Maybe<Scalars['String']['output']>;
  type: FileType;
  updatedAt: Maybe<Scalars['Float']['output']>;
  uploadByUserId: Maybe<Scalars['String']['output']>;
  url: Scalars['String']['output'];
};

/** Available file types */
export const FileType = {
  Audio: 'AUDIO',
  MsExcel: 'MS_EXCEL',
  MsPowerpoint: 'MS_POWERPOINT',
  MsWord: 'MS_WORD',
  Pdf: 'PDF',
  Photo: 'PHOTO',
  Unknown: 'UNKNOWN',
  Video: 'VIDEO'
} as const;

export type FileType = typeof FileType[keyof typeof FileType];
export type FilesPaginated = {
  __typename: 'FilesPaginated';
  results: Array<File>;
  total: Scalars['Float']['output'];
};

export type FirebaseClientConfig = {
  __typename: 'FirebaseClientConfig';
  apiKey: Scalars['String']['output'];
  appId: Scalars['String']['output'];
  authDomain: Scalars['String']['output'];
  measurementId: Scalars['String']['output'];
  messagingSenderId: Scalars['String']['output'];
  projectId: Scalars['String']['output'];
  storageBucket: Scalars['String']['output'];
};

/** Available genders */
export const Gender = {
  Female: 'FEMALE',
  Male: 'MALE',
  Other: 'OTHER'
} as const;

export type Gender = typeof Gender[keyof typeof Gender];
/** Available task statuses modes */
export const GetTaskStatusesMode = {
  Edit: 'EDIT',
  View: 'VIEW'
} as const;

export type GetTaskStatusesMode = typeof GetTaskStatusesMode[keyof typeof GetTaskStatusesMode];
export type HrmTimekeepingsRules = {
  __typename: 'HrmTimekeepingsRules';
  acceptLatenessUpToMins: Maybe<Scalars['Float']['output']>;
  acceptLocations: Maybe<Array<CheckInLocation>>;
  acceptOverTimeAtLeastMins: Maybe<Scalars['Float']['output']>;
  requirePhoto: Maybe<Scalars['Boolean']['output']>;
};

export type HrmTimekeepingsRulesInput = {
  acceptLatenessUpToMins?: InputMaybe<Scalars['Float']['input']>;
  acceptLocations?: InputMaybe<Array<CheckInLocationInput>>;
  acceptOverTimeAtLeastMins?: InputMaybe<Scalars['Float']['input']>;
  requirePhoto?: InputMaybe<Scalars['Boolean']['input']>;
};

export type LateInterestRate = {
  __typename: 'LateInterestRate';
  lateDays: Scalars['Float']['output'];
  rate: Scalars['Float']['output'];
};

export type LateInterestRateInput = {
  lateDays: Scalars['Float']['input'];
  rate: Scalars['Float']['input'];
};

export type Loan = {
  __typename: 'Loan';
  _count: Scalars['Float']['output'];
  _id: Maybe<Scalars['String']['output']>;
  amount: Scalars['Float']['output'];
  assetData: Maybe<Scalars['AnyType']['output']>;
  assetType: LoanAssetType;
  code: Scalars['String']['output'];
  coord: Maybe<Coordinates>;
  createdAt: Maybe<Scalars['Float']['output']>;
  customFieldValues: Maybe<Array<BaseCustomFieldValue>>;
  customer: Customer;
  customerCidNumber: Maybe<Scalars['String']['output']>;
  customerId: Scalars['String']['output'];
  fulfilledAt: Maybe<Scalars['Float']['output']>;
  id: Scalars['String']['output'];
  isHasLateInterestReceipt: Maybe<Scalars['Boolean']['output']>;
  isLiquidated: Maybe<Scalars['Boolean']['output']>;
  metadata: Maybe<Scalars['AnyType']['output']>;
  nextReceiptAt: Maybe<Scalars['Float']['output']>;
  package: Scalars['JSONObject']['output'];
  packageId: Scalars['String']['output'];
  packagePeriodDays: Scalars['Float']['output'];
  payment: Maybe<Scalars['AnyType']['output']>;
  paymentPeriods: Maybe<Scalars['AnyType']['output']>;
  paymentProgress: Maybe<Scalars['AnyType']['output']>;
  refs: Maybe<Array<Scalars['String']['output']>>;
  rejectReason: Maybe<Scalars['String']['output']>;
  relatedEntities: Maybe<Array<RelatedEntity>>;
  signature: Maybe<Scalars['String']['output']>;
  status: LoanStatus;
  updatedAt: Maybe<Scalars['Float']['output']>;
  workspaceBranch: Maybe<WorkspaceBranch>;
  workspaceBranchId: Maybe<Scalars['String']['output']>;
};

/** Available loan asset types */
export const LoanAssetType = {
  BusinessPermit: 'BUSINESS_PERMIT',
  CarRegistration: 'CAR_REGISTRATION',
  Icloud: 'ICLOUD',
  LandCertificate: 'LAND_CERTIFICATE',
  MotobikeRegistration: 'MOTOBIKE_REGISTRATION'
} as const;

export type LoanAssetType = typeof LoanAssetType[keyof typeof LoanAssetType];
export type LoanPackage = {
  __typename: 'LoanPackage';
  assetTypes: Array<LoanAssetType>;
  /** Chi phí vay */
  contractFee: Scalars['Float']['output'];
  /** 1 tháng, 2 tháng, 3 tháng, 6 tháng, 12 tháng -> Quy đổi ra ngày */
  days: Scalars['Float']['output'];
  description: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  /** Lãi phạt */
  lateInterestRates: Array<LateInterestRate>;
  liquidationFeeRate: Maybe<Scalars['Float']['output']>;
  /** Số ngày trong kỳ vay (10, 15, 30) */
  periodDaysOptions: Array<Scalars['Float']['output']>;
  type: LoanPackageType;
  /** Tỷ lệ trả gốc */
  unFixedCapitalRates: Array<Array<Scalars['Float']['output']>>;
};

export type LoanPackageInput = {
  assetTypes: Array<LoanAssetType>;
  /** Chi phí vay */
  contractFee: Scalars['Float']['input'];
  /** 1 tháng, 2 tháng, 3 tháng, 6 tháng, 12 tháng -> Quy đổi ra ngày */
  days: Scalars['Float']['input'];
  description?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['String']['input'];
  /** Lãi phạt */
  lateInterestRates: Array<LateInterestRateInput>;
  liquidationFeeRate?: InputMaybe<Scalars['Float']['input']>;
  /** Số ngày trong kỳ vay (10, 15, 30) */
  periodDaysOptions: Array<Scalars['Float']['input']>;
  type: LoanPackageType;
  /** Tỷ lệ trả gốc */
  unFixedCapitalRates: Array<Array<Scalars['Float']['input']>>;
};

export const LoanPackageType = {
  FixedCapital: 'FIXED_CAPITAL',
  Installment: 'INSTALLMENT',
  UnfixedCapital: 'UNFIXED_CAPITAL'
} as const;

export type LoanPackageType = typeof LoanPackageType[keyof typeof LoanPackageType];
export type LoanSettings = {
  __typename: 'LoanSettings';
  assetEstimationPriceSpreadRate: Maybe<Scalars['Float']['output']>;
  contractLiquidationPdfUrl: Maybe<Scalars['String']['output']>;
  contractPdfUrl: Maybe<Scalars['String']['output']>;
  isAutoSelectWorkspaceBranch: Maybe<Scalars['Boolean']['output']>;
  liquidationFeeRate: Maybe<Scalars['Float']['output']>;
  loanPackages: Array<LoanPackage>;
  receiptPdfUrl: Maybe<Scalars['String']['output']>;
  warningReceiptBeforeDays: Maybe<Scalars['Float']['output']>;
};

export type LoanSettingsInput = {
  assetEstimationPriceSpreadRate?: InputMaybe<Scalars['Float']['input']>;
  contractLiquidationPdfUrl?: InputMaybe<Scalars['String']['input']>;
  contractPdfUrl?: InputMaybe<Scalars['String']['input']>;
  isAutoSelectWorkspaceBranch?: InputMaybe<Scalars['Boolean']['input']>;
  liquidationFeeRate?: InputMaybe<Scalars['Float']['input']>;
  loanPackages: Array<LoanPackageInput>;
  receiptPdfUrl?: InputMaybe<Scalars['String']['input']>;
  warningReceiptBeforeDays?: InputMaybe<Scalars['Float']['input']>;
};

/** Available loan statuses */
export const LoanStatus = {
  Approved: 'APPROVED',
  Completed: 'COMPLETED',
  Fulfilled: 'FULFILLED',
  Overdue: 'OVERDUE',
  Pending: 'PENDING',
  PendingSign: 'PENDING_SIGN',
  Rejected: 'REJECTED'
} as const;

export type LoanStatus = typeof LoanStatus[keyof typeof LoanStatus];
export type LoansPaginated = {
  __typename: 'LoansPaginated';
  results: Array<Loan>;
  total: Scalars['Float']['output'];
};

export type LocationEntity = {
  __typename: 'LocationEntity';
  address: Maybe<Scalars['String']['output']>;
  coordinates: Maybe<Coordinates>;
  districtId: Maybe<Scalars['String']['output']>;
  provinceId: Maybe<Scalars['String']['output']>;
  wardId: Maybe<Scalars['String']['output']>;
};

export type LocationInput = {
  address?: InputMaybe<Scalars['String']['input']>;
  coordinates?: InputMaybe<CoordinatesInput>;
  districtId?: InputMaybe<Scalars['String']['input']>;
  provinceId?: InputMaybe<Scalars['String']['input']>;
  wardId?: InputMaybe<Scalars['String']['input']>;
};

export type Mutation = {
  __typename: 'Mutation';
  addActivity: Activity;
  addReaction: Scalars['Boolean']['output'];
  archiveActivity: Activity;
  assignWorkspaceMemberRoles: WorkspaceMember;
  bulkUpdateTags: Array<Tag>;
  bulkUpdateTasks: Array<Task>;
  cancelBooking: Booking;
  createBooking: Booking;
  createCategory: Category;
  createProduct: Product;
  createTag: Tag;
  createTask: Task;
  createWorkspaceRole: WorkspaceRole;
  deleteCategory: Scalars['Boolean']['output'];
  deleteWorkspaceRole: Scalars['Boolean']['output'];
  duplicateTask: Task;
  externalStorageVerifyDna: File;
  fetchExternalStorageSize: Scalars['Float']['output'];
  generateCategorySlug: Scalars['String']['output'];
  generateWorkspaceInviteCode: Scalars['String']['output'];
  healthcheckPluginExternalStorage: Scalars['Boolean']['output'];
  interactCategory: Scalars['Boolean']['output'];
  pluginExternalStorageSignUploadUrl: SignUploadUrlResponse;
  registerDevice: DeviceEntity;
  removePluginExternalStorage: Scalars['Boolean']['output'];
  removeReaction: Scalars['Boolean']['output'];
  removeTag: Scalars['Boolean']['output'];
  rescheduleBooking: Booking;
  setPluginExternalStorage: PluginExternalStorage;
  syncTask: SyncTaskResult;
  toggleDisablePluginExternalStorage: Scalars['Boolean']['output'];
  updateActivity: Activity;
  updateBooking: Booking;
  updateCategory: Category;
  updateTaskStatuses: Array<TaskStatus>;
  updateWorkspace: Workspace;
  updateWorkspaceMember: WorkspaceMember;
  updateWorkspaceRole: WorkspaceRole;
  updateWorkspaceSetting: WorkspaceSetting;
};


export type MutationAddActivityArgs = {
  content?: InputMaybe<Scalars['String']['input']>;
  contextId: Scalars['String']['input'];
  contextType: Scalars['String']['input'];
  parentId?: InputMaybe<Scalars['String']['input']>;
  type: ActivityType;
};


export type MutationAddReactionArgs = {
  entity: Scalars['String']['input'];
  entityId: Scalars['String']['input'];
  type: ReactionType;
};


export type MutationArchiveActivityArgs = {
  id: Scalars['String']['input'];
};


export type MutationAssignWorkspaceMemberRolesArgs = {
  memberId: Scalars['String']['input'];
  roleIds: Array<Scalars['String']['input']>;
};


export type MutationBulkUpdateTagsArgs = {
  items: Array<UpdateTagInput>;
};


export type MutationBulkUpdateTasksArgs = {
  items: Array<UpdateTaskInput>;
};


export type MutationCancelBookingArgs = {
  id: Scalars['String']['input'];
  reason: Scalars['String']['input'];
};


export type MutationCreateBookingArgs = {
  assigneeUserIds?: InputMaybe<Array<Scalars['String']['input']>>;
  createdAt?: InputMaybe<Scalars['Float']['input']>;
  customerId?: InputMaybe<Scalars['String']['input']>;
  endTime: Scalars['Float']['input'];
  note?: InputMaybe<Scalars['String']['input']>;
  reasonForCancellation?: InputMaybe<Scalars['String']['input']>;
  startTime: Scalars['Float']['input'];
  status: BookingStatus;
  title?: InputMaybe<Scalars['String']['input']>;
  workspaceBranchId?: InputMaybe<Scalars['String']['input']>;
};


export type MutationCreateCategoryArgs = {
  customFieldValues?: InputMaybe<Array<CustomFieldValueInput>>;
  description?: InputMaybe<Scalars['String']['input']>;
  icon?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  order?: InputMaybe<Scalars['Float']['input']>;
  parentId?: InputMaybe<Scalars['String']['input']>;
  slug?: InputMaybe<Scalars['String']['input']>;
  thumbnail?: InputMaybe<Scalars['String']['input']>;
  type?: InputMaybe<CategoryType>;
};


export type MutationCreateProductArgs = {
  categoryId?: InputMaybe<Scalars['String']['input']>;
  code?: InputMaybe<Scalars['String']['input']>;
  combos?: InputMaybe<Array<ProductComboInput>>;
  combosExpireInDays?: InputMaybe<Scalars['Float']['input']>;
  content?: InputMaybe<Scalars['String']['input']>;
  customFieldValues?: InputMaybe<Array<CustomFieldValueInput>>;
  defaultQtyPerUse?: InputMaybe<Scalars['Float']['input']>;
  displayName?: InputMaybe<Scalars['String']['input']>;
  image?: InputMaybe<Scalars['String']['input']>;
  isHiddenInReceiptWhenNoPrice?: InputMaybe<Scalars['Boolean']['input']>;
  isStockCheck?: InputMaybe<Scalars['Boolean']['input']>;
  maxPrice?: InputMaybe<Scalars['Float']['input']>;
  minPrice?: InputMaybe<Scalars['Float']['input']>;
  name: Scalars['String']['input'];
  price: Scalars['Float']['input'];
  productCode?: InputMaybe<Scalars['String']['input']>;
  supplies?: InputMaybe<Array<ProductSupplyInput>>;
  tags?: InputMaybe<Array<Scalars['String']['input']>>;
  type: ProductType;
  unit: Scalars['String']['input'];
  voucherAmount?: InputMaybe<Scalars['Float']['input']>;
  voucherExcludeProductIds?: InputMaybe<Array<Scalars['String']['input']>>;
  voucherExpireInDays?: InputMaybe<Scalars['Float']['input']>;
  voucherIncludeProductIds?: InputMaybe<Array<Scalars['String']['input']>>;
  warningOutOfDateBeforeDays?: InputMaybe<Scalars['Float']['input']>;
  warningOutOfStockQty?: InputMaybe<Scalars['Float']['input']>;
};


export type MutationCreateTagArgs = {
  input: TagDto;
};


export type MutationCreateTaskArgs = {
  input: CreateTaskInput;
};


export type MutationCreateWorkspaceRoleArgs = {
  color?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  permissions: Array<Scalars['String']['input']>;
};


export type MutationDeleteCategoryArgs = {
  id: Scalars['String']['input'];
};


export type MutationDeleteWorkspaceRoleArgs = {
  _id: Scalars['String']['input'];
};


export type MutationDuplicateTaskArgs = {
  _id: Scalars['String']['input'];
  overwrite?: InputMaybe<CreateTaskInput>;
};


export type MutationExternalStorageVerifyDnaArgs = {
  dna: Scalars['String']['input'];
};


export type MutationGenerateCategorySlugArgs = {
  name: Scalars['String']['input'];
};


export type MutationInteractCategoryArgs = {
  id: Scalars['String']['input'];
};


export type MutationPluginExternalStorageSignUploadUrlArgs = {
  fileName: Scalars['String']['input'];
  id?: InputMaybe<Scalars['String']['input']>;
  refs?: InputMaybe<Array<Scalars['String']['input']>>;
};


export type MutationRegisterDeviceArgs = {
  input: RegisterDeviceDto;
};


export type MutationRemoveReactionArgs = {
  entity: Scalars['String']['input'];
  entityId: Scalars['String']['input'];
  type: ReactionType;
};


export type MutationRemoveTagArgs = {
  id: Scalars['String']['input'];
};


export type MutationRescheduleBookingArgs = {
  assigneeUserIds?: InputMaybe<Array<Scalars['String']['input']>>;
  createdAt?: InputMaybe<Scalars['Float']['input']>;
  customerId?: InputMaybe<Scalars['String']['input']>;
  endTime: Scalars['Float']['input'];
  note?: InputMaybe<Scalars['String']['input']>;
  prevBookingId: Scalars['String']['input'];
  reasonForCancellation?: InputMaybe<Scalars['String']['input']>;
  startTime: Scalars['Float']['input'];
  status: BookingStatus;
  title?: InputMaybe<Scalars['String']['input']>;
  workspaceBranchId?: InputMaybe<Scalars['String']['input']>;
};


export type MutationSetPluginExternalStorageArgs = {
  accessKeyId?: InputMaybe<Scalars['String']['input']>;
  bucketName?: InputMaybe<Scalars['String']['input']>;
  endpointUrl?: InputMaybe<Scalars['String']['input']>;
  provider: PluginExternalStorageProvider;
  region?: InputMaybe<Scalars['String']['input']>;
  secretAccessKey?: InputMaybe<Scalars['String']['input']>;
};


export type MutationSyncTaskArgs = {
  _id: Scalars['String']['input'];
};


export type MutationUpdateActivityArgs = {
  content?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['String']['input'];
};


export type MutationUpdateBookingArgs = {
  assigneeUserIds?: InputMaybe<Array<Scalars['String']['input']>>;
  customerId?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['String']['input'];
  note?: InputMaybe<Scalars['String']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
};


export type MutationUpdateCategoryArgs = {
  customFieldValues?: InputMaybe<Array<CustomFieldValueInput>>;
  description?: InputMaybe<Scalars['String']['input']>;
  icon?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['String']['input'];
  name: Scalars['String']['input'];
  order?: InputMaybe<Scalars['Float']['input']>;
  parentId?: InputMaybe<Scalars['String']['input']>;
  slug?: InputMaybe<Scalars['String']['input']>;
  thumbnail?: InputMaybe<Scalars['String']['input']>;
  type?: InputMaybe<CategoryType>;
};


export type MutationUpdateTaskStatusesArgs = {
  contextId?: InputMaybe<Scalars['String']['input']>;
  contextType?: InputMaybe<TaskContextType>;
  isInherited?: InputMaybe<Scalars['Boolean']['input']>;
  statuses: Array<TaskStatusInput>;
};


export type MutationUpdateWorkspaceArgs = {
  appColor?: InputMaybe<Scalars['String']['input']>;
  appColorShape?: InputMaybe<Scalars['Float']['input']>;
  appDomain?: InputMaybe<Scalars['String']['input']>;
  appIcon?: InputMaybe<Scalars['String']['input']>;
  appName?: InputMaybe<Scalars['String']['input']>;
  hotline?: InputMaybe<Scalars['String']['input']>;
  locale?: InputMaybe<AppLocale>;
  location?: InputMaybe<LocationInput>;
  logo?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  phone?: InputMaybe<Scalars['String']['input']>;
  type: WorkspaceType;
};


export type MutationUpdateWorkspaceMemberArgs = {
  color?: InputMaybe<Scalars['String']['input']>;
  displayName?: InputMaybe<Scalars['String']['input']>;
  memberId: Scalars['String']['input'];
  workingTimeType?: InputMaybe<WorkspaceMemberWorkingTimeType>;
  workspaceBranchIds?: InputMaybe<Array<Scalars['String']['input']>>;
};


export type MutationUpdateWorkspaceRoleArgs = {
  _id: Scalars['String']['input'];
  color?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  permissions: Array<Scalars['String']['input']>;
};


export type MutationUpdateWorkspaceSettingArgs = {
  allowDuplicateBookings?: InputMaybe<Scalars['Boolean']['input']>;
  allowPayTicketMultipleTimes?: InputMaybe<Scalars['Boolean']['input']>;
  allowTip?: InputMaybe<Scalars['Boolean']['input']>;
  bankAccount?: InputMaybe<PluginBankAccountInput>;
  bookingsAutoRemindCustomerBookingBeforeDays?: InputMaybe<Scalars['Float']['input']>;
  bookingsAutoRemindCustomerBookingTime?: InputMaybe<Scalars['String']['input']>;
  currencyCode?: InputMaybe<Scalars['String']['input']>;
  hrmTimeKeepingsRules?: InputMaybe<HrmTimekeepingsRulesInput>;
  isAuthSessionRestricted?: InputMaybe<Scalars['Boolean']['input']>;
  loanSettings?: InputMaybe<LoanSettingsInput>;
  mailer?: InputMaybe<PluginMailerAccountInput>;
  memberPermissions?: InputMaybe<Array<Scalars['String']['input']>>;
  privacyPolicy?: InputMaybe<Scalars['String']['input']>;
  receiptImagesRequired?: InputMaybe<Scalars['Boolean']['input']>;
  receiptPaymentMethodDefault?: InputMaybe<ReceiptPaymentMethod>;
  schedule?: InputMaybe<WorkspaceScheduleInput>;
  searchSettings?: InputMaybe<WorkspaceSearchSettingsInput>;
  termsOfService?: InputMaybe<Scalars['String']['input']>;
  view?: InputMaybe<WorkspaceViewInput>;
  zaloOaGmfGroupSettings?: InputMaybe<Scalars['JSONObject']['input']>;
};

export type Order = {
  __typename: 'Order';
  _count: Scalars['Float']['output'];
  _id: Maybe<Scalars['String']['output']>;
  assigneeUserIds: Maybe<Array<Scalars['String']['output']>>;
  assigneeUsers: Array<WorkspaceMember>;
  code: Scalars['String']['output'];
  comboIds: Maybe<Array<Scalars['String']['output']>>;
  couponIds: Maybe<Array<Scalars['String']['output']>>;
  createdAt: Maybe<Scalars['Float']['output']>;
  createdByUser: WorkspaceMember;
  customFieldValues: Maybe<Array<BaseCustomFieldValue>>;
  discounts: Array<OrderDiscount>;
  id: Scalars['String']['output'];
  isFulfilled: Maybe<Scalars['Boolean']['output']>;
  items: Scalars['AnyType']['output'];
  note: Maybe<Scalars['String']['output']>;
  paidAmount: Scalars['Float']['output'];
  paymentStatus: OrderPaymentStatus;
  promotionIds: Maybe<Array<Scalars['String']['output']>>;
  refs: Maybe<Array<Scalars['String']['output']>>;
  relatedCustomer: Maybe<Customer>;
  relatedCustomerId: Maybe<Scalars['String']['output']>;
  relatedEntities: Maybe<Array<RelatedEntity>>;
  relatedUserIds: Maybe<Array<Scalars['String']['output']>>;
  totalAmount: Scalars['Float']['output'];
  type: Maybe<OrderType>;
  updatedAt: Maybe<Scalars['Float']['output']>;
  voucherIds: Maybe<Array<Scalars['String']['output']>>;
};

export type OrderDiscount = {
  __typename: 'OrderDiscount';
  amount: Scalars['Float']['output'];
  productComboId: Maybe<Scalars['String']['output']>;
  productCouponId: Maybe<Scalars['String']['output']>;
  productId: Maybe<Scalars['String']['output']>;
  productQuantity: Maybe<Scalars['Float']['output']>;
  productVoucherAmount: Maybe<Scalars['Float']['output']>;
  productVoucherId: Maybe<Scalars['String']['output']>;
  promotionId: Maybe<Scalars['String']['output']>;
  type: OrderDiscountType;
};

/** Order discount type */
export const OrderDiscountType = {
  Combo: 'COMBO',
  Coupon: 'COUPON',
  Direct: 'DIRECT',
  Promotion: 'PROMOTION',
  Voucher: 'VOUCHER'
} as const;

export type OrderDiscountType = typeof OrderDiscountType[keyof typeof OrderDiscountType];
/** Order payment status */
export const OrderPaymentStatus = {
  Completed: 'COMPLETED',
  Processing: 'PROCESSING'
} as const;

export type OrderPaymentStatus = typeof OrderPaymentStatus[keyof typeof OrderPaymentStatus];
/** Order type */
export const OrderType = {
  Common: 'COMMON'
} as const;

export type OrderType = typeof OrderType[keyof typeof OrderType];
export type OrdersPaginated = {
  __typename: 'OrdersPaginated';
  results: Array<Order>;
  total: Scalars['Float']['output'];
};

export type Partner = {
  __typename: 'Partner';
  _id: Scalars['String']['output'];
  createdAt: Maybe<Scalars['Float']['output']>;
  customFieldValues: Maybe<Array<CustomFieldValue>>;
  email: Maybe<Scalars['String']['output']>;
  logo: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  phone: Maybe<Scalars['String']['output']>;
  refs: Maybe<Array<Scalars['String']['output']>>;
  updatedAt: Maybe<Scalars['Float']['output']>;
};

export type PartnersPaginated = {
  __typename: 'PartnersPaginated';
  results: Array<Partner>;
  total: Scalars['Float']['output'];
};

export type PluginBankAccount = {
  __typename: 'PluginBankAccount';
  accountName: Maybe<Scalars['String']['output']>;
  accountNumber: Scalars['String']['output'];
  bankId: Scalars['Float']['output'];
};

export type PluginBankAccountInput = {
  accountName?: InputMaybe<Scalars['String']['input']>;
  accountNumber: Scalars['String']['input'];
  bankId: Scalars['Float']['input'];
};

export type PluginEInvoicesPaginated = {
  __typename: 'PluginEInvoicesPaginated';
  results: Array<EInvoice>;
  total: Scalars['Float']['output'];
};

/** Available plugin e-invoices provider types */
export const PluginEInvoicesProviderType = {
  Matbao: 'MATBAO',
  MatbaoDemo: 'MATBAO_DEMO'
} as const;

export type PluginEInvoicesProviderType = typeof PluginEInvoicesProviderType[keyof typeof PluginEInvoicesProviderType];
export type PluginExternalStorage = {
  __typename: 'PluginExternalStorage';
  bucketName: Maybe<Scalars['String']['output']>;
  endpointUrl: Maybe<Scalars['String']['output']>;
  isDisabled: Maybe<Scalars['Boolean']['output']>;
  provider: PluginExternalStorageProvider;
  region: Maybe<Scalars['String']['output']>;
  size: Maybe<Scalars['Float']['output']>;
};

/** Available external storage providers */
export const PluginExternalStorageProvider = {
  AwsS3: 'AWS_S3'
} as const;

export type PluginExternalStorageProvider = typeof PluginExternalStorageProvider[keyof typeof PluginExternalStorageProvider];
export type PluginMailerAccount = {
  __typename: 'PluginMailerAccount';
  pass: Scalars['String']['output'];
  user: Scalars['String']['output'];
};

export type PluginMailerAccountInput = {
  pass: Scalars['String']['input'];
  user: Scalars['String']['input'];
};

export type Posts = {
  __typename: 'Posts';
  _id: Scalars['String']['output'];
  categoryId: Maybe<Scalars['String']['output']>;
  content: Maybe<Scalars['JSONObject']['output']>;
  contentHtml: Maybe<Scalars['String']['output']>;
  createdAt: Maybe<Scalars['Float']['output']>;
  customFieldValues: Maybe<Array<CustomFieldValue>>;
  excerpt: Maybe<Scalars['String']['output']>;
  meta: Maybe<Scalars['JSONObject']['output']>;
  productId: Maybe<Scalars['String']['output']>;
  publishedAt: Maybe<Scalars['Float']['output']>;
  refs: Maybe<Array<Scalars['String']['output']>>;
  slug: Scalars['String']['output'];
  thumbnail: Maybe<Scalars['String']['output']>;
  title: Scalars['String']['output'];
  updatedAt: Maybe<Scalars['Float']['output']>;
};

export type PostsPaginated = {
  __typename: 'PostsPaginated';
  results: Array<Posts>;
  total: Scalars['Float']['output'];
};

export type Prescription = {
  __typename: 'Prescription';
  _id: Scalars['String']['output'];
  createdAt: Maybe<Scalars['Float']['output']>;
  customFieldValues: Maybe<Array<CustomFieldValue>>;
  items: Scalars['AnyType']['output'];
  name: Scalars['String']['output'];
  note: Maybe<Scalars['String']['output']>;
  refs: Maybe<Array<Scalars['String']['output']>>;
  updatedAt: Maybe<Scalars['Float']['output']>;
};

export type PrescriptionsPaginated = {
  __typename: 'PrescriptionsPaginated';
  results: Array<Prescription>;
  total: Scalars['Float']['output'];
};

export type Product = {
  __typename: 'Product';
  _id: Scalars['String']['output'];
  category: Maybe<Category>;
  categoryId: Maybe<Scalars['String']['output']>;
  code: Maybe<Scalars['String']['output']>;
  combos: Maybe<Array<ProductComboValue>>;
  combosExpireInDays: Maybe<Scalars['Float']['output']>;
  content: Maybe<Scalars['String']['output']>;
  createdAt: Maybe<Scalars['Float']['output']>;
  customFieldValues: Maybe<Array<CustomFieldValue>>;
  defaultQtyPerUse: Maybe<Scalars['Float']['output']>;
  displayName: Maybe<Scalars['String']['output']>;
  image: Maybe<Scalars['String']['output']>;
  inStock: Maybe<Scalars['Float']['output']>;
  isHiddenInReceiptWhenNoPrice: Maybe<Scalars['Boolean']['output']>;
  isStockCheck: Maybe<Scalars['Boolean']['output']>;
  maxPrice: Maybe<Scalars['Float']['output']>;
  minPrice: Maybe<Scalars['Float']['output']>;
  name: Scalars['String']['output'];
  price: Scalars['Float']['output'];
  productCode: Maybe<Scalars['String']['output']>;
  refs: Maybe<Array<Scalars['String']['output']>>;
  supplies: Maybe<Array<ProductSupply>>;
  tags: Array<Scalars['String']['output']>;
  type: ProductType;
  unit: Scalars['String']['output'];
  updatedAt: Maybe<Scalars['Float']['output']>;
  voucherAmount: Maybe<Scalars['Float']['output']>;
  voucherExcludeProductIds: Maybe<Array<Scalars['String']['output']>>;
  voucherExpireInDays: Maybe<Scalars['Float']['output']>;
  voucherIncludeProductIds: Maybe<Array<Scalars['String']['output']>>;
  warningOutOfDateBeforeDays: Maybe<Scalars['Float']['output']>;
  warningOutOfStockQty: Maybe<Scalars['Float']['output']>;
  workspaceId: Scalars['String']['output'];
};

export type ProductCombo = {
  __typename: 'ProductCombo';
  _count: Scalars['Float']['output'];
  _id: Maybe<Scalars['String']['output']>;
  createdAt: Maybe<Scalars['Float']['output']>;
  customFieldValues: Maybe<Array<BaseCustomFieldValue>>;
  customerId: Scalars['String']['output'];
  expireAt: Maybe<Scalars['Float']['output']>;
  id: Scalars['String']['output'];
  productId: Scalars['String']['output'];
  productRefs: Array<ProductComboRef>;
  refs: Maybe<Array<Scalars['String']['output']>>;
  relatedEntities: Maybe<Array<RelatedEntity>>;
  sourceId: Scalars['String']['output'];
  status: ProductComboStatus;
  updatedAt: Maybe<Scalars['Float']['output']>;
};

export type ProductComboInput = {
  productId: Scalars['String']['input'];
  quantity: Scalars['Float']['input'];
};

export type ProductComboRef = {
  __typename: 'ProductComboRef';
  productRefId: Scalars['String']['output'];
  productRefRevenue: Scalars['Float']['output'];
  quantity: Scalars['Float']['output'];
  quantityUsed: Scalars['Float']['output'];
};

/** Product combo status */
export const ProductComboStatus = {
  Active: 'ACTIVE',
  Expired: 'EXPIRED',
  Inactive: 'INACTIVE',
  OutOfStock: 'OUT_OF_STOCK',
  SourceUnavailable: 'SOURCE_UNAVAILABLE'
} as const;

export type ProductComboStatus = typeof ProductComboStatus[keyof typeof ProductComboStatus];
export type ProductComboValue = {
  __typename: 'ProductComboValue';
  productId: Scalars['String']['output'];
  quantity: Scalars['Float']['output'];
};

export type ProductCombosPaginated = {
  __typename: 'ProductCombosPaginated';
  results: Array<ProductCombo>;
  total: Scalars['Float']['output'];
};

export type ProductStock = {
  __typename: 'ProductStock';
  _count: Scalars['Float']['output'];
  _id: Maybe<Scalars['String']['output']>;
  code: Maybe<Scalars['String']['output']>;
  costPrice: Scalars['Float']['output'];
  createdAt: Maybe<Scalars['Float']['output']>;
  createdByUser: WorkspaceMember;
  customFieldValues: Maybe<Array<BaseCustomFieldValue>>;
  expireAt: Scalars['Float']['output'];
  id: Scalars['String']['output'];
  note: Maybe<Scalars['String']['output']>;
  product: Product;
  productId: Scalars['String']['output'];
  quantity: Scalars['Float']['output'];
  records: Scalars['AnyType']['output'];
  refs: Maybe<Array<Scalars['String']['output']>>;
  relatedEntities: Maybe<Array<RelatedEntity>>;
  remainQuantity: Scalars['Float']['output'];
  updatedAt: Maybe<Scalars['Float']['output']>;
};

export type ProductStockRecord = {
  __typename: 'ProductStockRecord';
  _count: Scalars['Float']['output'];
  _id: Maybe<Scalars['String']['output']>;
  createdAt: Maybe<Scalars['Float']['output']>;
  createdByUser: Maybe<WorkspaceMember>;
  customFieldValues: Maybe<Array<BaseCustomFieldValue>>;
  id: Scalars['String']['output'];
  note: Maybe<Scalars['String']['output']>;
  product: Product;
  productId: Scalars['String']['output'];
  productStockId: Scalars['String']['output'];
  quantity: Scalars['Float']['output'];
  ref: Maybe<Scalars['String']['output']>;
  refs: Maybe<Array<Scalars['String']['output']>>;
  relatedEntities: Maybe<Array<RelatedEntity>>;
  relatedOrderId: Maybe<Scalars['String']['output']>;
  relatedProduct: Maybe<Product>;
  relatedProductId: Maybe<Scalars['String']['output']>;
  stockCode: Scalars['String']['output'];
  type: ProductStockRecordType;
  updatedAt: Maybe<Scalars['Float']['output']>;
};

export type ProductStockRecordPaginated = {
  __typename: 'ProductStockRecordPaginated';
  results: Array<ProductStockRecord>;
  total: Scalars['Float']['output'];
};

/** Product stock record type */
export const ProductStockRecordType = {
  StockIn: 'STOCK_IN',
  StockOut: 'STOCK_OUT'
} as const;

export type ProductStockRecordType = typeof ProductStockRecordType[keyof typeof ProductStockRecordType];
export type ProductStocksPaginated = {
  __typename: 'ProductStocksPaginated';
  results: Array<ProductStock>;
  total: Scalars['Float']['output'];
};

export type ProductSupply = {
  __typename: 'ProductSupply';
  productId: Scalars['String']['output'];
  quantity: Scalars['Float']['output'];
};

export type ProductSupplyInput = {
  productId: Scalars['String']['input'];
  quantity: Scalars['Float']['input'];
};

/** Available product types */
export const ProductType = {
  Combo: 'COMBO',
  Product: 'PRODUCT',
  Service: 'SERVICE',
  Voucher: 'VOUCHER'
} as const;

export type ProductType = typeof ProductType[keyof typeof ProductType];
export type ProductVoucher = {
  __typename: 'ProductVoucher';
  _id: Scalars['String']['output'];
  amount: Scalars['Float']['output'];
  createdAt: Maybe<Scalars['Float']['output']>;
  customFieldValues: Maybe<Array<CustomFieldValue>>;
  customerId: Scalars['String']['output'];
  expireAt: Maybe<Scalars['Float']['output']>;
  productVoucherId: Scalars['String']['output'];
  ref: Scalars['String']['output'];
  refs: Maybe<Array<Scalars['String']['output']>>;
  relatedTicketId: Scalars['String']['output'];
  status: ProductVoucherStatus;
  updatedAt: Maybe<Scalars['Float']['output']>;
};

/** Product voucher status */
export const ProductVoucherStatus = {
  Active: 'ACTIVE',
  Expired: 'EXPIRED',
  Inactive: 'INACTIVE',
  OutOfAmount: 'OUT_OF_AMOUNT'
} as const;

export type ProductVoucherStatus = typeof ProductVoucherStatus[keyof typeof ProductVoucherStatus];
export type ProductVouchersPaginated = {
  __typename: 'ProductVouchersPaginated';
  results: Array<ProductVoucher>;
  total: Scalars['Float']['output'];
};

export type ProductsPaginated = {
  __typename: 'ProductsPaginated';
  results: Array<Product>;
  total: Scalars['Float']['output'];
};

export type Promotion = {
  __typename: 'Promotion';
  _count: Scalars['Float']['output'];
  _id: Maybe<Scalars['String']['output']>;
  createdAt: Maybe<Scalars['Float']['output']>;
  customFieldValues: Maybe<Array<BaseCustomFieldValue>>;
  customersSelection: Maybe<Scalars['JSONObject']['output']>;
  description: Maybe<Scalars['String']['output']>;
  expireAt: Maybe<Scalars['Float']['output']>;
  id: Scalars['String']['output'];
  image: Maybe<Scalars['String']['output']>;
  limitPerCustomer: Maybe<Scalars['Float']['output']>;
  name: Scalars['String']['output'];
  productsSelection: Maybe<Scalars['JSONObject']['output']>;
  refs: Maybe<Array<Scalars['String']['output']>>;
  relatedEntities: Maybe<Array<RelatedEntity>>;
  status: PromotionStatus;
  type: PromotionType;
  updatedAt: Maybe<Scalars['Float']['output']>;
  value: Scalars['Float']['output'];
};

/** Promotion status */
export const PromotionStatus = {
  Active: 'ACTIVE',
  Closed: 'CLOSED',
  Expired: 'EXPIRED'
} as const;

export type PromotionStatus = typeof PromotionStatus[keyof typeof PromotionStatus];
/** Promotion type */
export const PromotionType = {
  DiscountAmount: 'DISCOUNT_AMOUNT',
  DiscountRate: 'DISCOUNT_RATE'
} as const;

export type PromotionType = typeof PromotionType[keyof typeof PromotionType];
export type PromotionsPaginated = {
  __typename: 'PromotionsPaginated';
  results: Array<Promotion>;
  total: Scalars['Float']['output'];
};

export type Query = {
  __typename: 'Query';
  activities: ActivitiesPaginated;
  activity: Activity;
  appConfig: AppConfig;
  booking: Booking;
  bookings: BookingsPaginated;
  categories: CategoriesPaginated;
  category: Category;
  couponRules: CouponRulesPaginated;
  coupons: CouponsPaginated;
  customFields: CustomFieldsPaginated;
  customer: Customer;
  customerForms: CustomerFormsPaginated;
  customers: CustomersPaginated;
  eInvoices: PluginEInvoicesPaginated;
  event: Event;
  events: EventsPaginated;
  files: FilesPaginated;
  getCategoriesByIds: Array<Category>;
  getCategoryBySlug: Category;
  getFileInfo: File;
  getProductByIds: Array<Product>;
  loan: Loan;
  loans: LoansPaginated;
  orders: OrdersPaginated;
  partners: PartnersPaginated;
  pluginExternalStorage: Maybe<PluginExternalStorage>;
  post: Posts;
  posts: PostsPaginated;
  prescriptions: PrescriptionsPaginated;
  productCombos: ProductCombosPaginated;
  productStockRecords: ProductStockRecordPaginated;
  productStocks: ProductStocksPaginated;
  productVouchers: ProductVouchersPaginated;
  products: ProductsPaginated;
  promotions: PromotionsPaginated;
  reactions: ReactionsPaginated;
  reactionsCount: ReactionsCount;
  receipts: ReceiptsPaginated;
  search: Array<SearchResult>;
  siblingTasks: SiblingTasks;
  tagBySlug: Tag;
  tags: TagsPaginated;
  task: Task;
  taskByCode: Task;
  taskMetrics: TaskMetrics;
  taskStatuses: ConfigTaskStatuses;
  tasks: TasksPaginated;
  tasksCount: Scalars['Float']['output'];
  userWorkspaceMember: WorkspaceMember;
  userWorkspaceMembers: Array<WorkspaceMember>;
  workspace: Workspace;
  workspaceApiApps: WorkspaceApiAppsPaginated;
  workspaceBranches: WorkspaceBranchesPaginated;
  workspaceInviteInformation: WorkspaceInviteInformation;
  workspaceMember: WorkspaceMember;
  workspaceMembers: WorkspaceMembersPaginated;
  workspaceMembersByIds: Array<WorkspaceMember>;
  workspaceMembersOnlineStatus: Array<WorkspaceMemberOnlineStatus>;
  workspaceRoles: Array<WorkspaceRole>;
  workspaceSetting: WorkspaceSetting;
  workspaceStats: WorkspaceStatsPaginated;
};


export type QueryActivitiesArgs = {
  contextId: Scalars['String']['input'];
  contextType: Scalars['String']['input'];
  ids?: InputMaybe<Array<Scalars['String']['input']>>;
  limit?: InputMaybe<Scalars['Float']['input']>;
  offset?: InputMaybe<Scalars['Float']['input']>;
  parentId?: InputMaybe<Scalars['String']['input']>;
  sortCreatedAt?: InputMaybe<SortDirection>;
  type?: InputMaybe<ActivityType>;
};


export type QueryActivityArgs = {
  id: Scalars['String']['input'];
};


export type QueryBookingArgs = {
  id: Scalars['String']['input'];
};


export type QueryBookingsArgs = {
  limit?: InputMaybe<Scalars['Float']['input']>;
  offset?: InputMaybe<Scalars['Float']['input']>;
  query?: InputMaybe<Scalars['JSONObject']['input']>;
};


export type QueryCategoriesArgs = {
  limit?: InputMaybe<Scalars['Float']['input']>;
  offset?: InputMaybe<Scalars['Float']['input']>;
  query?: InputMaybe<Scalars['JSONObject']['input']>;
};


export type QueryCategoryArgs = {
  id: Scalars['String']['input'];
};


export type QueryCouponRulesArgs = {
  limit?: InputMaybe<Scalars['Float']['input']>;
  offset?: InputMaybe<Scalars['Float']['input']>;
  query?: InputMaybe<Scalars['JSONObject']['input']>;
};


export type QueryCouponsArgs = {
  limit?: InputMaybe<Scalars['Float']['input']>;
  offset?: InputMaybe<Scalars['Float']['input']>;
  query?: InputMaybe<Scalars['JSONObject']['input']>;
};


export type QueryCustomFieldsArgs = {
  limit?: InputMaybe<Scalars['Float']['input']>;
  offset?: InputMaybe<Scalars['Float']['input']>;
  query?: InputMaybe<Scalars['JSONObject']['input']>;
};


export type QueryCustomerArgs = {
  id: Scalars['String']['input'];
};


export type QueryCustomerFormsArgs = {
  limit?: InputMaybe<Scalars['Float']['input']>;
  offset?: InputMaybe<Scalars['Float']['input']>;
  query?: InputMaybe<Scalars['JSONObject']['input']>;
};


export type QueryCustomersArgs = {
  ids?: InputMaybe<Array<Scalars['String']['input']>>;
  limit?: InputMaybe<Scalars['Float']['input']>;
  offset?: InputMaybe<Scalars['Float']['input']>;
  sortCreatedAt?: InputMaybe<SortDirection>;
};


export type QueryEInvoicesArgs = {
  limit?: InputMaybe<Scalars['Float']['input']>;
  offset?: InputMaybe<Scalars['Float']['input']>;
  query?: InputMaybe<Scalars['JSONObject']['input']>;
};


export type QueryEventArgs = {
  id: Scalars['String']['input'];
};


export type QueryEventsArgs = {
  limit?: InputMaybe<Scalars['Float']['input']>;
  offset?: InputMaybe<Scalars['Float']['input']>;
  ref?: InputMaybe<Scalars['String']['input']>;
  type?: InputMaybe<EventType>;
  userId?: InputMaybe<Scalars['String']['input']>;
};


export type QueryFilesArgs = {
  limit?: InputMaybe<Scalars['Float']['input']>;
  offset?: InputMaybe<Scalars['Float']['input']>;
  query?: InputMaybe<Scalars['JSONObject']['input']>;
};


export type QueryGetCategoriesByIdsArgs = {
  ids: Array<Scalars['String']['input']>;
};


export type QueryGetCategoryBySlugArgs = {
  slug: Scalars['String']['input'];
};


export type QueryGetFileInfoArgs = {
  fileId: Scalars['String']['input'];
};


export type QueryGetProductByIdsArgs = {
  ids: Array<Scalars['String']['input']>;
};


export type QueryLoanArgs = {
  id: Scalars['String']['input'];
};


export type QueryLoansArgs = {
  customerCidNumber?: InputMaybe<Scalars['String']['input']>;
  customerId?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Float']['input']>;
  offset?: InputMaybe<Scalars['Float']['input']>;
  query?: InputMaybe<Scalars['JSONObject']['input']>;
  sortCreatedAt?: InputMaybe<SortDirection>;
  status?: InputMaybe<Array<LoanStatus>>;
};


export type QueryOrdersArgs = {
  limit?: InputMaybe<Scalars['Float']['input']>;
  offset?: InputMaybe<Scalars['Float']['input']>;
  query?: InputMaybe<Scalars['JSONObject']['input']>;
};


export type QueryPartnersArgs = {
  limit?: InputMaybe<Scalars['Float']['input']>;
  offset?: InputMaybe<Scalars['Float']['input']>;
  query?: InputMaybe<Scalars['JSONObject']['input']>;
};


export type QueryPostArgs = {
  id: Scalars['String']['input'];
};


export type QueryPostsArgs = {
  limit?: InputMaybe<Scalars['Float']['input']>;
  offset?: InputMaybe<Scalars['Float']['input']>;
  query?: InputMaybe<Scalars['JSONObject']['input']>;
};


export type QueryPrescriptionsArgs = {
  limit?: InputMaybe<Scalars['Float']['input']>;
  offset?: InputMaybe<Scalars['Float']['input']>;
  query?: InputMaybe<Scalars['JSONObject']['input']>;
};


export type QueryProductCombosArgs = {
  limit?: InputMaybe<Scalars['Float']['input']>;
  offset?: InputMaybe<Scalars['Float']['input']>;
  query?: InputMaybe<Scalars['JSONObject']['input']>;
};


export type QueryProductStockRecordsArgs = {
  limit?: InputMaybe<Scalars['Float']['input']>;
  offset?: InputMaybe<Scalars['Float']['input']>;
  query?: InputMaybe<Scalars['JSONObject']['input']>;
};


export type QueryProductStocksArgs = {
  limit?: InputMaybe<Scalars['Float']['input']>;
  offset?: InputMaybe<Scalars['Float']['input']>;
  query?: InputMaybe<Scalars['JSONObject']['input']>;
};


export type QueryProductVouchersArgs = {
  limit?: InputMaybe<Scalars['Float']['input']>;
  offset?: InputMaybe<Scalars['Float']['input']>;
  query?: InputMaybe<Scalars['JSONObject']['input']>;
};


export type QueryProductsArgs = {
  limit?: InputMaybe<Scalars['Float']['input']>;
  offset?: InputMaybe<Scalars['Float']['input']>;
  query?: InputMaybe<Scalars['JSONObject']['input']>;
};


export type QueryPromotionsArgs = {
  limit?: InputMaybe<Scalars['Float']['input']>;
  offset?: InputMaybe<Scalars['Float']['input']>;
  query?: InputMaybe<Scalars['JSONObject']['input']>;
};


export type QueryReactionsArgs = {
  entity: Scalars['String']['input'];
  entityId: Scalars['String']['input'];
  ids?: InputMaybe<Array<Scalars['String']['input']>>;
  limit?: InputMaybe<Scalars['Float']['input']>;
  offset?: InputMaybe<Scalars['Float']['input']>;
  sortCreatedAt?: InputMaybe<SortDirection>;
};


export type QueryReactionsCountArgs = {
  entity: Scalars['String']['input'];
  entityId: Scalars['String']['input'];
};


export type QueryReceiptsArgs = {
  limit?: InputMaybe<Scalars['Float']['input']>;
  offset?: InputMaybe<Scalars['Float']['input']>;
  query?: InputMaybe<Scalars['JSONObject']['input']>;
};


export type QuerySearchArgs = {
  entities: Array<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  query: Scalars['String']['input'];
};


export type QuerySiblingTasksArgs = {
  _id: Scalars['String']['input'];
};


export type QueryTagBySlugArgs = {
  slug: Scalars['String']['input'];
};


export type QueryTagsArgs = {
  ids?: InputMaybe<Array<Scalars['String']['input']>>;
  limit?: InputMaybe<Scalars['Float']['input']>;
  offset?: InputMaybe<Scalars['Float']['input']>;
  sortCreatedAt?: InputMaybe<SortDirection>;
  type?: InputMaybe<Scalars['String']['input']>;
};


export type QueryTaskArgs = {
  _id: Scalars['String']['input'];
};


export type QueryTaskByCodeArgs = {
  code: Scalars['String']['input'];
};


export type QueryTaskMetricsArgs = {
  contextId?: InputMaybe<Scalars['String']['input']>;
  contextType: TaskContextType;
};


export type QueryTaskStatusesArgs = {
  contextId?: InputMaybe<Scalars['String']['input']>;
  contextType?: InputMaybe<TaskContextType>;
  mode?: InputMaybe<GetTaskStatusesMode>;
};


export type QueryTasksArgs = {
  all?: InputMaybe<Scalars['Boolean']['input']>;
  assigneeUserIds?: InputMaybe<Array<Scalars['String']['input']>>;
  folderId?: InputMaybe<Scalars['String']['input']>;
  fromTrackingTime?: InputMaybe<Scalars['Float']['input']>;
  ids?: InputMaybe<Array<Scalars['String']['input']>>;
  isClosedOnly?: InputMaybe<Scalars['Boolean']['input']>;
  isProgressOnly?: InputMaybe<Scalars['Boolean']['input']>;
  limit?: InputMaybe<Scalars['Float']['input']>;
  offset?: InputMaybe<Scalars['Float']['input']>;
  parentId?: InputMaybe<Scalars['String']['input']>;
  partnerIds?: InputMaybe<Array<Scalars['String']['input']>>;
  priority?: InputMaybe<TaskPriority>;
  sortCreatedAt?: InputMaybe<SortDirection>;
  status?: InputMaybe<Scalars['String']['input']>;
  tagIds?: InputMaybe<Array<Scalars['String']['input']>>;
  toTrackingTime?: InputMaybe<Scalars['Float']['input']>;
};


export type QueryTasksCountArgs = {
  all?: InputMaybe<Scalars['Boolean']['input']>;
  assigneeUserIds?: InputMaybe<Array<Scalars['String']['input']>>;
  folderId?: InputMaybe<Scalars['String']['input']>;
  fromTrackingTime?: InputMaybe<Scalars['Float']['input']>;
  ids?: InputMaybe<Array<Scalars['String']['input']>>;
  isClosedOnly?: InputMaybe<Scalars['Boolean']['input']>;
  isProgressOnly?: InputMaybe<Scalars['Boolean']['input']>;
  limit?: InputMaybe<Scalars['Float']['input']>;
  offset?: InputMaybe<Scalars['Float']['input']>;
  parentId?: InputMaybe<Scalars['String']['input']>;
  partnerIds?: InputMaybe<Array<Scalars['String']['input']>>;
  priority?: InputMaybe<TaskPriority>;
  sortCreatedAt?: InputMaybe<SortDirection>;
  status?: InputMaybe<Scalars['String']['input']>;
  tagIds?: InputMaybe<Array<Scalars['String']['input']>>;
  toTrackingTime?: InputMaybe<Scalars['Float']['input']>;
};


export type QueryWorkspaceApiAppsArgs = {
  limit?: InputMaybe<Scalars['Float']['input']>;
  offset?: InputMaybe<Scalars['Float']['input']>;
  query?: InputMaybe<Scalars['JSONObject']['input']>;
};


export type QueryWorkspaceBranchesArgs = {
  limit?: InputMaybe<Scalars['Float']['input']>;
  offset?: InputMaybe<Scalars['Float']['input']>;
  query?: InputMaybe<Scalars['JSONObject']['input']>;
};


export type QueryWorkspaceInviteInformationArgs = {
  inviteCode: Scalars['String']['input'];
};


export type QueryWorkspaceMemberArgs = {
  userId: Scalars['String']['input'];
};


export type QueryWorkspaceMembersArgs = {
  ids?: InputMaybe<Array<Scalars['String']['input']>>;
  ignoreSelf?: InputMaybe<Scalars['Boolean']['input']>;
  limit?: InputMaybe<Scalars['Float']['input']>;
  offset?: InputMaybe<Scalars['Float']['input']>;
  query?: InputMaybe<Scalars['JSONObject']['input']>;
  sortCreatedAt?: InputMaybe<SortDirection>;
  userId?: InputMaybe<Array<Scalars['String']['input']>>;
};


export type QueryWorkspaceMembersByIdsArgs = {
  ids: Array<Scalars['String']['input']>;
};


export type QueryWorkspaceStatsArgs = {
  limit?: InputMaybe<Scalars['Float']['input']>;
  offset?: InputMaybe<Scalars['Float']['input']>;
  query?: InputMaybe<Scalars['JSONObject']['input']>;
};

export type Reaction = {
  __typename: 'Reaction';
  createdAt: Scalars['Float']['output'];
  type: ReactionType;
  user: WorkspaceMember;
  userId: Scalars['String']['output'];
};

export type ReactionCount = {
  __typename: 'ReactionCount';
  count: Scalars['Float']['output'];
  type: ReactionType;
  userIds: Array<Scalars['String']['output']>;
};

/** Available reaction types */
export const ReactionType = {
  Angry: 'ANGRY',
  Dislike: 'DISLIKE',
  Eyes: 'EYES',
  Laugh: 'LAUGH',
  Like: 'LIKE',
  Love: 'LOVE',
  Sad: 'SAD',
  Surprise: 'SURPRISE'
} as const;

export type ReactionType = typeof ReactionType[keyof typeof ReactionType];
export type ReactionsCount = {
  __typename: 'ReactionsCount';
  reactions: Array<ReactionCount>;
};

export type ReactionsPaginated = {
  __typename: 'ReactionsPaginated';
  results: Array<Reaction>;
  total: Scalars['Float']['output'];
};

export type Receipt = {
  __typename: 'Receipt';
  _count: Scalars['Float']['output'];
  _id: Maybe<Scalars['String']['output']>;
  amount: Scalars['Float']['output'];
  assigneeUserIds: Maybe<Array<Scalars['String']['output']>>;
  cashierUser: Maybe<WorkspaceMember>;
  cashierUserId: Maybe<Scalars['String']['output']>;
  code: Scalars['String']['output'];
  createdAt: Maybe<Scalars['Float']['output']>;
  customFieldValues: Maybe<Array<BaseCustomFieldValue>>;
  data: Maybe<Scalars['AnyType']['output']>;
  disbursementUser: Maybe<WorkspaceMember>;
  disbursementUserId: Maybe<Scalars['String']['output']>;
  expireAt: Maybe<Scalars['Float']['output']>;
  giveAmount: Maybe<Scalars['AnyType']['output']>;
  id: Scalars['String']['output'];
  note: Maybe<Scalars['String']['output']>;
  paidAt: Maybe<Scalars['Float']['output']>;
  paymentMethod: Maybe<ReceiptPaymentMethod>;
  ref: Scalars['String']['output'];
  refs: Maybe<Array<Scalars['String']['output']>>;
  relatedCustomer: Maybe<Customer>;
  relatedCustomerId: Maybe<Scalars['String']['output']>;
  relatedEntities: Maybe<Array<RelatedEntity>>;
  relatedLoanCode: Maybe<Scalars['String']['output']>;
  relatedLoanId: Maybe<Scalars['String']['output']>;
  relatedOrderId: Maybe<Scalars['String']['output']>;
  relatedPartnerId: Maybe<Scalars['String']['output']>;
  relatedTicketId: Maybe<Scalars['String']['output']>;
  status: ReceiptStatus;
  tipAmount: Maybe<Scalars['AnyType']['output']>;
  type: ReceiptType;
  updatedAt: Maybe<Scalars['Float']['output']>;
  workspaceBranch: Maybe<WorkspaceBranch>;
};

/** Receipt payment method */
export const ReceiptPaymentMethod = {
  BankCard: 'BANK_CARD',
  BankTransfer: 'BANK_TRANSFER',
  Cash: 'CASH'
} as const;

export type ReceiptPaymentMethod = typeof ReceiptPaymentMethod[keyof typeof ReceiptPaymentMethod];
/** Receipt status */
export const ReceiptStatus = {
  Paid: 'PAID',
  Pending: 'PENDING'
} as const;

export type ReceiptStatus = typeof ReceiptStatus[keyof typeof ReceiptStatus];
/** Receipt type */
export const ReceiptType = {
  Expense: 'EXPENSE',
  Income: 'INCOME'
} as const;

export type ReceiptType = typeof ReceiptType[keyof typeof ReceiptType];
export type ReceiptsPaginated = {
  __typename: 'ReceiptsPaginated';
  results: Array<Receipt>;
  total: Scalars['Float']['output'];
};

export type RegisterDeviceDto = {
  identifyId: Scalars['String']['input'];
  locale?: InputMaybe<AppLocale>;
};

export type RelatedEntity = {
  __typename: 'RelatedEntity';
  data: Maybe<Scalars['JSONObject']['output']>;
  entity: Scalars['String']['output'];
  id: Maybe<Scalars['String']['output']>;
  index: Maybe<Scalars['Boolean']['output']>;
};

export type SearchResult = {
  entity: Scalars['String']['output'];
  id: Scalars['String']['output'];
};

export type SearchResultCategory = SearchResult & {
  __typename: 'SearchResultCategory';
  entity: Scalars['String']['output'];
  id: Scalars['String']['output'];
  name: Scalars['String']['output'];
};

export type SearchResultCustomer = SearchResult & {
  __typename: 'SearchResultCustomer';
  code: Scalars['String']['output'];
  entity: Scalars['String']['output'];
  id: Scalars['String']['output'];
  name: Scalars['String']['output'];
  phone: Maybe<Scalars['String']['output']>;
};

export type SearchResultLoan = SearchResult & {
  __typename: 'SearchResultLoan';
  code: Scalars['String']['output'];
  customerName: Scalars['String']['output'];
  customerPhone: Maybe<Scalars['String']['output']>;
  entity: Scalars['String']['output'];
  id: Scalars['String']['output'];
};

export type SearchResultOrders = SearchResult & {
  __typename: 'SearchResultOrders';
  code: Scalars['String']['output'];
  entity: Scalars['String']['output'];
  id: Scalars['String']['output'];
};

export type SearchResultPartner = SearchResult & {
  __typename: 'SearchResultPartner';
  entity: Scalars['String']['output'];
  id: Scalars['String']['output'];
  name: Scalars['String']['output'];
  phone: Maybe<Scalars['String']['output']>;
};

export type SearchResultPrescriptions = SearchResult & {
  __typename: 'SearchResultPrescriptions';
  entity: Scalars['String']['output'];
  id: Scalars['String']['output'];
  name: Scalars['String']['output'];
  note: Scalars['String']['output'];
};

export type SearchResultProduct = SearchResult & {
  __typename: 'SearchResultProduct';
  entity: Scalars['String']['output'];
  id: Scalars['String']['output'];
  name: Scalars['String']['output'];
};

export type SearchResultReceipt = SearchResult & {
  __typename: 'SearchResultReceipt';
  code: Scalars['String']['output'];
  entity: Scalars['String']['output'];
  id: Scalars['String']['output'];
};

export type SearchResultTags = SearchResult & {
  __typename: 'SearchResultTags';
  entity: Scalars['String']['output'];
  id: Scalars['String']['output'];
  name: Scalars['String']['output'];
  type: Scalars['String']['output'];
};

export type SearchResultTask = SearchResult & {
  __typename: 'SearchResultTask';
  code: Scalars['String']['output'];
  entity: Scalars['String']['output'];
  id: Scalars['String']['output'];
  name: Scalars['String']['output'];
};

export type SearchResultWorkspaceMember = SearchResult & {
  __typename: 'SearchResultWorkspaceMember';
  avatar: Maybe<Scalars['String']['output']>;
  color: Maybe<Scalars['String']['output']>;
  email: Scalars['String']['output'];
  entity: Scalars['String']['output'];
  id: Scalars['String']['output'];
  memberId: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  phone: Maybe<Scalars['String']['output']>;
  userId: Scalars['String']['output'];
};

export type SiblingTasks = {
  __typename: 'SiblingTasks';
  next: Maybe<Task>;
  previous: Maybe<Task>;
};

export type SignUploadUrlResponse = {
  __typename: 'SignUploadUrlResponse';
  dna: Scalars['String']['output'];
  signedUrl: Scalars['String']['output'];
};

/** Available sort directions */
export const SortDirection = {
  Asc: 'ASC',
  Desc: 'DESC'
} as const;

export type SortDirection = typeof SortDirection[keyof typeof SortDirection];
export type SyncTaskResult = {
  __typename: 'SyncTaskResult';
  task: Task;
  updateInfos: Array<Scalars['String']['output']>;
};

export type Tag = {
  __typename: 'Tag';
  _id: Scalars['String']['output'];
  color: Maybe<Scalars['String']['output']>;
  createdAt: Maybe<Scalars['Float']['output']>;
  customFieldValues: Maybe<Array<CustomFieldValue>>;
  name: Scalars['String']['output'];
  order: Scalars['Float']['output'];
  refs: Maybe<Array<Scalars['String']['output']>>;
  slug: Scalars['String']['output'];
  type: TagType;
  updatedAt: Maybe<Scalars['Float']['output']>;
};

export type TagDto = {
  color?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  order?: InputMaybe<Scalars['Float']['input']>;
  type: TagType;
};

/** Available tag types */
export const TagType = {
  Customer: 'CUSTOMER',
  MessageBox: 'MESSAGE_BOX',
  Task: 'TASK',
  TaskFolder: 'TASK_FOLDER'
} as const;

export type TagType = typeof TagType[keyof typeof TagType];
export type TagsPaginated = {
  __typename: 'TagsPaginated';
  results: Array<Tag>;
  total: Scalars['Float']['output'];
};

export type Task = {
  __typename: 'Task';
  _id: Scalars['String']['output'];
  assigneeUserIds: Array<Scalars['String']['output']>;
  assigneeUsers: Array<WorkspaceMember>;
  childCount: Scalars['Float']['output'];
  childDueDate: Maybe<Scalars['Float']['output']>;
  childEstimatedTime: Maybe<Scalars['Float']['output']>;
  childOrder: TaskChildOrder;
  childProgress: Scalars['Float']['output'];
  childStartDate: Maybe<Scalars['Float']['output']>;
  childTimeline: Maybe<TaskChildTimeline>;
  closedAt: Maybe<Scalars['Float']['output']>;
  code: Scalars['String']['output'];
  createdAt: Maybe<Scalars['Float']['output']>;
  customFieldValues: Maybe<Array<CustomFieldValue>>;
  customFields: Array<CustomField>;
  customer: Maybe<Customer>;
  customerId: Maybe<Scalars['String']['output']>;
  description: Maybe<Scalars['String']['output']>;
  dueDate: Maybe<Scalars['Float']['output']>;
  estimatedTime: Maybe<Scalars['Float']['output']>;
  folder: Maybe<Tag>;
  folderId: Maybe<Scalars['String']['output']>;
  isArchived: Maybe<Scalars['Boolean']['output']>;
  mentionedUserIds: Array<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  order: Scalars['Float']['output'];
  parent: Maybe<Task>;
  parentId: Maybe<Scalars['String']['output']>;
  partnerIds: Array<Scalars['String']['output']>;
  partners: Array<Partner>;
  points: Maybe<Scalars['Float']['output']>;
  priority: Maybe<TaskPriority>;
  progress: Scalars['Float']['output'];
  refs: Maybe<Array<Scalars['String']['output']>>;
  relatedUserIds: Array<Scalars['String']['output']>;
  startDate: Maybe<Scalars['Float']['output']>;
  status: Scalars['String']['output'];
  statuses: Array<TaskStatus>;
  tagIds: Array<Scalars['String']['output']>;
  tags: Array<Tag>;
  timeTrackings: Maybe<Array<TaskTimeTracking>>;
  updatedAt: Maybe<Scalars['Float']['output']>;
};

export type TaskChildOrder = {
  __typename: 'TaskChildOrder';
  first: Maybe<Scalars['Float']['output']>;
  last: Maybe<Scalars['Float']['output']>;
};

export type TaskChildTimeline = {
  __typename: 'TaskChildTimeline';
  dueDate: Maybe<Scalars['Float']['output']>;
  startDate: Maybe<Scalars['Float']['output']>;
};

/** Available task statuses context types */
export const TaskContextType = {
  Folder: 'FOLDER'
} as const;

export type TaskContextType = typeof TaskContextType[keyof typeof TaskContextType];
export type TaskMetrics = {
  __typename: 'TaskMetrics';
  contextId: Maybe<Scalars['String']['output']>;
  contextType: TaskContextType;
  dueDate: Maybe<Scalars['Float']['output']>;
  estimatedTime: Maybe<Scalars['Float']['output']>;
  inProgressTasks: Maybe<Scalars['Float']['output']>;
  overdueTasks: Maybe<Scalars['Float']['output']>;
  progress: Maybe<Scalars['Float']['output']>;
  startDate: Maybe<Scalars['Float']['output']>;
  totalTasks: Maybe<Scalars['Float']['output']>;
};

/** Available task priorities */
export const TaskPriority = {
  High: 'HIGH',
  Low: 'LOW',
  Medium: 'MEDIUM',
  Urgent: 'URGENT'
} as const;

export type TaskPriority = typeof TaskPriority[keyof typeof TaskPriority];
export type TaskStatus = {
  __typename: 'TaskStatus';
  color: Maybe<Scalars['String']['output']>;
  contextId: Maybe<Scalars['String']['output']>;
  contextType: Maybe<TaskContextType>;
  id: Scalars['String']['output'];
  name: Maybe<Scalars['String']['output']>;
  order: Scalars['Float']['output'];
  progress: Scalars['Float']['output'];
};

export type TaskStatusInput = {
  color?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['String']['input'];
  name?: InputMaybe<Scalars['String']['input']>;
  order?: InputMaybe<Scalars['Float']['input']>;
};

export type TaskTimeTracking = {
  __typename: 'TaskTimeTracking';
  endAt: Maybe<Scalars['Float']['output']>;
  id: Scalars['String']['output'];
  note: Maybe<Scalars['String']['output']>;
  startAt: Scalars['Float']['output'];
  user: Maybe<WorkspaceMember>;
  userId: Scalars['String']['output'];
  workspaceId: Scalars['String']['output'];
};

export type TaskTimeTrackingInput = {
  endAt?: InputMaybe<Scalars['Float']['input']>;
  id: Scalars['String']['input'];
  note?: InputMaybe<Scalars['String']['input']>;
  startAt: Scalars['Float']['input'];
  userId: Scalars['String']['input'];
};

export type TasksPaginated = {
  __typename: 'TasksPaginated';
  results: Array<Task>;
  total: Scalars['Float']['output'];
};

export type UpdateTagInput = {
  _id: Scalars['String']['input'];
  color?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  order?: InputMaybe<Scalars['Float']['input']>;
};

export type UpdateTaskInput = {
  _id: Scalars['String']['input'];
  assigneeUserIds?: InputMaybe<Array<Scalars['String']['input']>>;
  customerId?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  dueDate?: InputMaybe<Scalars['Float']['input']>;
  estimatedTime?: InputMaybe<Scalars['Float']['input']>;
  folderId?: InputMaybe<Scalars['String']['input']>;
  isArchived?: InputMaybe<Scalars['Boolean']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  order?: InputMaybe<Scalars['Float']['input']>;
  parentId?: InputMaybe<Scalars['String']['input']>;
  partnerIds?: InputMaybe<Array<Scalars['String']['input']>>;
  points?: InputMaybe<Scalars['Float']['input']>;
  priority?: InputMaybe<TaskPriority>;
  startDate?: InputMaybe<Scalars['Float']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
  tagIds?: InputMaybe<Array<Scalars['String']['input']>>;
  timeTrackings?: InputMaybe<Array<TaskTimeTrackingInput>>;
  workspaceBranchId?: InputMaybe<Scalars['String']['input']>;
};

export type UserAuthProvider = {
  __typename: 'UserAuthProvider';
  providerId: Scalars['String']['output'];
  uid: Scalars['String']['output'];
  username: Scalars['String']['output'];
};

export type WorkingDayInterval = {
  __typename: 'WorkingDayInterval';
  /** 1: Monday, 2: Tuesday, 3: Wednesday, 4: Thursday, 5: Friday, 6: Saturday, 7: Sunday */
  day: Scalars['Float']['output'];
  /** Format: HH:mm */
  end: Scalars['String']['output'];
  id: Scalars['String']['output'];
  shift: Maybe<Scalars['String']['output']>;
  /** Format: HH:mm */
  start: Scalars['String']['output'];
};

export type WorkingDayIntervalInput = {
  /** 1: Monday, 2: Tuesday, 3: Wednesday, 4: Thursday, 5: Friday, 6: Saturday, 7: Sunday */
  day: Scalars['Float']['input'];
  /** Format: HH:mm */
  end: Scalars['String']['input'];
  id: Scalars['String']['input'];
  shift?: InputMaybe<Scalars['String']['input']>;
  /** Format: HH:mm */
  start: Scalars['String']['input'];
};

export type Workspace = {
  __typename: 'Workspace';
  _id: Scalars['String']['output'];
  appColor: Maybe<Scalars['String']['output']>;
  appColorShape: Maybe<Scalars['Float']['output']>;
  appDomain: Maybe<Scalars['String']['output']>;
  appIcon: Maybe<Scalars['String']['output']>;
  appName: Maybe<Scalars['String']['output']>;
  branches: Scalars['Float']['output'];
  code: Scalars['String']['output'];
  hotline: Maybe<Scalars['String']['output']>;
  inviteCode: Maybe<Scalars['String']['output']>;
  isArchived: Maybe<Scalars['Boolean']['output']>;
  locale: Maybe<AppLocale>;
  location: Maybe<LocationEntity>;
  logo: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  phone: Maybe<Scalars['String']['output']>;
  type: WorkspaceType;
};

export type WorkspaceApiApp = {
  __typename: 'WorkspaceApiApp';
  _id: Scalars['String']['output'];
  authVersion: Scalars['Float']['output'];
  createdAt: Maybe<Scalars['Float']['output']>;
  customFieldValues: Maybe<Array<CustomFieldValue>>;
  enabled: Scalars['Boolean']['output'];
  member: WorkspaceMember;
  memberId: Scalars['String']['output'];
  refs: Maybe<Array<Scalars['String']['output']>>;
  secretKey: Scalars['String']['output'];
  updatedAt: Maybe<Scalars['Float']['output']>;
  userId: Scalars['String']['output'];
};

export type WorkspaceApiAppsPaginated = {
  __typename: 'WorkspaceApiAppsPaginated';
  results: Array<WorkspaceApiApp>;
  total: Scalars['Float']['output'];
};

export type WorkspaceBranch = {
  __typename: 'WorkspaceBranch';
  _id: Scalars['String']['output'];
  createdAt: Maybe<Scalars['Float']['output']>;
  customFieldValues: Maybe<Array<CustomFieldValue>>;
  hotline: Maybe<Scalars['String']['output']>;
  location: LocationEntity;
  name: Scalars['String']['output'];
  refs: Maybe<Array<Scalars['String']['output']>>;
  updatedAt: Maybe<Scalars['Float']['output']>;
};

export type WorkspaceBranchesPaginated = {
  __typename: 'WorkspaceBranchesPaginated';
  results: Array<WorkspaceBranch>;
  total: Scalars['Float']['output'];
};

export type WorkspaceInviteInformation = {
  __typename: 'WorkspaceInviteInformation';
  appColor: Maybe<Scalars['String']['output']>;
  appColorShape: Maybe<Scalars['Float']['output']>;
  hotline: Maybe<Scalars['String']['output']>;
  logo: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  phone: Maybe<Scalars['String']['output']>;
  type: WorkspaceType;
  workspaceId: Scalars['String']['output'];
};

export type WorkspaceMember = {
  __typename: 'WorkspaceMember';
  _id: Scalars['String']['output'];
  avatar: Maybe<Scalars['String']['output']>;
  color: Maybe<Scalars['String']['output']>;
  email: Scalars['String']['output'];
  joinedAt: Maybe<Scalars['Float']['output']>;
  memberDisplayName: Maybe<Scalars['String']['output']>;
  memberId: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  permissions: Array<Scalars['String']['output']>;
  phone: Maybe<Scalars['String']['output']>;
  roles: Array<WorkspaceMemberRole>;
  userDisplayName: Maybe<Scalars['String']['output']>;
  userId: Scalars['String']['output'];
  workingTimeType: Maybe<WorkspaceMemberWorkingTimeType>;
  workspace: Workspace;
  workspaceBranches: Array<WorkspaceMemberWorkspaceBranchInfo>;
  workspaceId: Scalars['String']['output'];
};

export type WorkspaceMemberOnlineStatus = {
  __typename: 'WorkspaceMemberOnlineStatus';
  isOnline: Scalars['Boolean']['output'];
  userId: Scalars['String']['output'];
};

export type WorkspaceMemberRole = {
  __typename: 'WorkspaceMemberRole';
  _id: Scalars['String']['output'];
  color: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
};

/** The working time type of the workspace member */
export const WorkspaceMemberWorkingTimeType = {
  Freelancer: 'FREELANCER',
  Fulltime: 'FULLTIME'
} as const;

export type WorkspaceMemberWorkingTimeType = typeof WorkspaceMemberWorkingTimeType[keyof typeof WorkspaceMemberWorkingTimeType];
export type WorkspaceMemberWorkspaceBranchInfo = {
  __typename: 'WorkspaceMemberWorkspaceBranchInfo';
  _id: Scalars['String']['output'];
  name: Scalars['String']['output'];
};

export type WorkspaceMembersPaginated = {
  __typename: 'WorkspaceMembersPaginated';
  results: Array<WorkspaceMember>;
  total: Scalars['Float']['output'];
};

export type WorkspaceRole = {
  __typename: 'WorkspaceRole';
  _id: Scalars['String']['output'];
  color: Maybe<Scalars['String']['output']>;
  description: Maybe<Scalars['String']['output']>;
  isEditable: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
  permissions: Array<Scalars['String']['output']>;
};

export type WorkspaceSchedule = {
  __typename: 'WorkspaceSchedule';
  timezone: Maybe<Scalars['String']['output']>;
  workingDays: Array<WorkingDayInterval>;
};

export type WorkspaceScheduleInput = {
  timezone?: InputMaybe<Scalars['String']['input']>;
  workingDays: Array<WorkingDayIntervalInput>;
};

export type WorkspaceSearchSettings = {
  __typename: 'WorkspaceSearchSettings';
  hideEntities: Maybe<Array<Scalars['String']['output']>>;
};

export type WorkspaceSearchSettingsInput = {
  hideEntities?: InputMaybe<Array<Scalars['String']['input']>>;
};

export type WorkspaceSetting = {
  __typename: 'WorkspaceSetting';
  _id: Scalars['String']['output'];
  allowDuplicateBookings: Maybe<Scalars['Boolean']['output']>;
  allowPayTicketMultipleTimes: Maybe<Scalars['Boolean']['output']>;
  allowTip: Maybe<Scalars['Boolean']['output']>;
  bankAccount: Maybe<PluginBankAccount>;
  bookingsAutoRemindCustomerBookingBeforeDays: Maybe<Scalars['Float']['output']>;
  bookingsAutoRemindCustomerBookingTime: Maybe<Scalars['String']['output']>;
  createdAt: Maybe<Scalars['Float']['output']>;
  currencyCode: Maybe<Scalars['String']['output']>;
  customFieldValues: Maybe<Array<CustomFieldValue>>;
  hrmTimeKeepingsRules: Maybe<HrmTimekeepingsRules>;
  isAuthSessionRestricted: Maybe<Scalars['Boolean']['output']>;
  loanSettings: Maybe<LoanSettings>;
  mailer: Maybe<PluginMailerAccount>;
  memberPermissions: Maybe<Array<Scalars['String']['output']>>;
  privacyPolicy: Maybe<Scalars['String']['output']>;
  receiptImagesRequired: Maybe<Scalars['Boolean']['output']>;
  receiptPaymentMethodDefault: Maybe<ReceiptPaymentMethod>;
  refs: Maybe<Array<Scalars['String']['output']>>;
  schedule: Maybe<WorkspaceSchedule>;
  searchSettings: Maybe<WorkspaceSearchSettings>;
  termsOfService: Maybe<Scalars['String']['output']>;
  updatedAt: Maybe<Scalars['Float']['output']>;
  view: Maybe<WorkspaceView>;
  /** @deprecated Use schedule instead */
  wSlots: Maybe<Array<Scalars['AnyType']['output']>>;
  zaloOaGmfGroupSettings: Maybe<Scalars['JSONObject']['output']>;
};

export type WorkspaceStat = {
  __typename: 'WorkspaceStat';
  _id: Scalars['String']['output'];
  bookingCount: Maybe<Scalars['Float']['output']>;
  createdAt: Maybe<Scalars['Float']['output']>;
  customFieldValues: Maybe<Array<CustomFieldValue>>;
  customerCount: Maybe<Scalars['Float']['output']>;
  memberCount: Maybe<Scalars['Float']['output']>;
  orderCount: Maybe<Scalars['Float']['output']>;
  refs: Maybe<Array<Scalars['String']['output']>>;
  storageUsage: Maybe<Scalars['Float']['output']>;
  updatedAt: Maybe<Scalars['Float']['output']>;
  workspace: WorkspaceStatWorkspaceInformation;
};

export type WorkspaceStatWorkspaceInformation = {
  __typename: 'WorkspaceStatWorkspaceInformation';
  _id: Scalars['String']['output'];
  logo: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  type: WorkspaceType;
};

export type WorkspaceStatsPaginated = {
  __typename: 'WorkspaceStatsPaginated';
  results: Array<WorkspaceStat>;
  total: Scalars['Float']['output'];
};

/** Available workspace types */
export const WorkspaceType = {
  BeautySalon: 'BEAUTY_SALON',
  Business: 'BUSINESS',
  Clinic: 'CLINIC',
  Credit: 'CREDIT',
  Dental: 'DENTAL',
  Hospital: 'HOSPITAL',
  Software: 'SOFTWARE',
  Spa: 'SPA'
} as const;

export type WorkspaceType = typeof WorkspaceType[keyof typeof WorkspaceType];
export type WorkspaceView = {
  __typename: 'WorkspaceView';
  dashboardWidgets: Maybe<Array<DisplayWidget>>;
  menu: Maybe<Array<WorkspaceViewComponent>>;
  reportWidgets: Maybe<Array<DisplayWidget>>;
};

export type WorkspaceViewComponent = {
  __typename: 'WorkspaceViewComponent';
  dividerName: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  moduleId: Maybe<Scalars['String']['output']>;
  type: Scalars['String']['output'];
};

export type WorkspaceViewComponentInput = {
  dividerName?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['String']['input'];
  moduleId?: InputMaybe<Scalars['String']['input']>;
  type: Scalars['String']['input'];
};

export type WorkspaceViewInput = {
  dashboardWidgets?: InputMaybe<Array<DisplayWidgetInput>>;
  menu?: InputMaybe<Array<WorkspaceViewComponentInput>>;
  reportWidgets?: InputMaybe<Array<DisplayWidgetInput>>;
};
