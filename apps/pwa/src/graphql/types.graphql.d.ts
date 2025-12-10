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

export type AppConfig = {
  __typename?: 'AppConfig';
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
export type CategoriesPaginated = {
  __typename?: 'CategoriesPaginated';
  count: Scalars['Float']['output'];
  data: Array<Category>;
};

export type Category = {
  __typename?: 'Category';
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

export type CategoryEntity = {
  __typename?: 'CategoryEntity';
  _id: Scalars['String']['output'];
  createdAt: Maybe<Scalars['Float']['output']>;
  customFieldValues: Maybe<Array<CustomFieldValue>>;
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
export type ConfigTaskStatuses = {
  __typename?: 'ConfigTaskStatuses';
  count: Scalars['Float']['output'];
  isCustomized: Scalars['Boolean']['output'];
  statuses: Array<TaskStatus>;
};

export type Coordinates = {
  __typename?: 'Coordinates';
  lat: Scalars['Float']['output'];
  lng: Scalars['Float']['output'];
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
  __typename?: 'CustomField';
  config: Maybe<Scalars['JSONObject']['output']>;
  customFieldId: Scalars['String']['output'];
  key: Maybe<Scalars['String']['output']>;
  type: CustomFieldType;
  value: Maybe<Scalars['AnyType']['output']>;
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
  __typename?: 'CustomFieldValue';
  customFieldId: Scalars['String']['output'];
  value: Maybe<Scalars['AnyType']['output']>;
};

export type CustomFieldValueInput = {
  customFieldId: Scalars['String']['input'];
  value?: InputMaybe<Scalars['AnyType']['input']>;
};

export type Customer = {
  __typename?: 'Customer';
  _id: Scalars['String']['output'];
  assigneeUserIds: Maybe<Array<Scalars['String']['output']>>;
  avatar: Maybe<Scalars['String']['output']>;
  birthday: Maybe<Scalars['Float']['output']>;
  birthdayDate: Maybe<Scalars['Float']['output']>;
  birthdayMonth: Maybe<Scalars['Float']['output']>;
  code: Scalars['String']['output'];
  codePrefix: Scalars['String']['output'];
  createdAt: Maybe<Scalars['Float']['output']>;
  customFieldValues: Maybe<Array<CustomFieldValue>>;
  email: Maybe<Scalars['String']['output']>;
  gender: Maybe<Gender>;
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
};

export type CustomersPaginated = {
  __typename?: 'CustomersPaginated';
  count: Scalars['Float']['output'];
  data: Array<Customer>;
};

export type DeviceEntity = {
  __typename?: 'DeviceEntity';
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

export type Event = {
  __typename?: 'Event';
  _id: Scalars['String']['output'];
  actionType: Maybe<EventDataActionType>;
  channel: EventChannel;
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
  WorkspaceMemberJoined: 'WORKSPACE_MEMBER_JOINED',
  WorkspaceMemberLeaved: 'WORKSPACE_MEMBER_LEAVED',
  WorkspaceMemberOffline: 'WORKSPACE_MEMBER_OFFLINE',
  WorkspaceMemberOnline: 'WORKSPACE_MEMBER_ONLINE',
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
export type File = {
  __typename?: 'File';
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
  workspaceId: Scalars['String']['output'];
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
export type FirebaseClientConfig = {
  __typename?: 'FirebaseClientConfig';
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
export type LocationEntity = {
  __typename?: 'LocationEntity';
  address: Maybe<Scalars['String']['output']>;
  coordinates: Maybe<Coordinates>;
  districtId: Maybe<Scalars['String']['output']>;
  provinceId: Maybe<Scalars['String']['output']>;
  wardId: Maybe<Scalars['String']['output']>;
};

export type Mutation = {
  __typename?: 'Mutation';
  bulkUpdateTags: Array<Tag>;
  bulkUpdateTasks: Array<Task>;
  createCategory: Category;
  createProduct: Product;
  createTag: Tag;
  createTask: Task;
  deleteCategory: Scalars['Boolean']['output'];
  duplicateTask: Task;
  externalStorageVerifyDna: File;
  generateCategorySlug: Scalars['String']['output'];
  healthcheckPluginExternalStorage: Scalars['Boolean']['output'];
  interactCategory: Scalars['Boolean']['output'];
  pluginExternalStorageSignUploadUrl: SignUploadUrlResponse;
  registerDevice: DeviceEntity;
  removePluginExternalStorage: Scalars['Boolean']['output'];
  removeTag: Scalars['Boolean']['output'];
  setPluginExternalStorage: PluginExternalStorage;
  setTaskStatuses: Array<TaskStatus>;
  syncTask: SyncTaskResult;
  toggleDisablePluginExternalStorage: Scalars['Boolean']['output'];
  updateCategory: Category;
};


export type MutationBulkUpdateTagsArgs = {
  items: Array<UpdateTagInput>;
};


export type MutationBulkUpdateTasksArgs = {
  items: Array<UpdateTaskInput>;
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


export type MutationDeleteCategoryArgs = {
  id: Scalars['String']['input'];
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
  refs?: InputMaybe<Array<Scalars['String']['input']>>;
};


export type MutationRegisterDeviceArgs = {
  input: RegisterDeviceDto;
};


export type MutationRemoveTagArgs = {
  id: Scalars['String']['input'];
};


export type MutationSetPluginExternalStorageArgs = {
  accessKeyId?: InputMaybe<Scalars['String']['input']>;
  bucketName?: InputMaybe<Scalars['String']['input']>;
  endpointUrl?: InputMaybe<Scalars['String']['input']>;
  provider: PluginExternalStorageProvider;
  region?: InputMaybe<Scalars['String']['input']>;
  secretAccessKey?: InputMaybe<Scalars['String']['input']>;
};


export type MutationSetTaskStatusesArgs = {
  contextId?: InputMaybe<Scalars['String']['input']>;
  contextType?: InputMaybe<TaskStatusesContextType>;
  statuses?: InputMaybe<Array<TaskStatusInput>>;
};


export type MutationSyncTaskArgs = {
  _id: Scalars['String']['input'];
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

export type PartnerEntity = {
  __typename?: 'PartnerEntity';
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

export type PluginExternalStorage = {
  __typename?: 'PluginExternalStorage';
  bucketName: Maybe<Scalars['String']['output']>;
  endpointUrl: Maybe<Scalars['String']['output']>;
  isDisabled: Maybe<Scalars['Boolean']['output']>;
  provider: PluginExternalStorageProvider;
  region: Maybe<Scalars['String']['output']>;
};

/** Available external storage providers */
export const PluginExternalStorageProvider = {
  AwsS3: 'AWS_S3'
} as const;

export type PluginExternalStorageProvider = typeof PluginExternalStorageProvider[keyof typeof PluginExternalStorageProvider];
export type Product = {
  __typename?: 'Product';
  _id: Scalars['String']['output'];
  category: Maybe<CategoryEntity>;
  categoryId: Maybe<Scalars['String']['output']>;
  code: Maybe<Scalars['String']['output']>;
  combos: Maybe<Array<ProductCombo>>;
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
  __typename?: 'ProductCombo';
  productId: Scalars['String']['output'];
  quantity: Scalars['Float']['output'];
};

export type ProductComboInput = {
  productId: Scalars['String']['input'];
  quantity: Scalars['Float']['input'];
};

export type ProductSupply = {
  __typename?: 'ProductSupply';
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
export type Query = {
  __typename?: 'Query';
  appConfig: AppConfig;
  categoriesPaginated: CategoriesPaginated;
  category: Category;
  customers: CustomersPaginated;
  event: Event;
  getCategoriesByIds: Array<Category>;
  getCategoryBySlug: Category;
  getFileInfo: File;
  getProductByIds: Array<Product>;
  pluginExternalStorage: Maybe<PluginExternalStorage>;
  siblingTasks: SiblingTasks;
  tagBySlug: Tag;
  tags: Tags;
  task: Task;
  taskByCode: Task;
  taskStatuses: ConfigTaskStatuses;
  tasks: TasksPaginated;
  tasksCount: Scalars['Float']['output'];
  userWorkspaceMember: WorkspaceMember;
  workspaceMembers: WorkspaceMembersPaginated;
};


export type QueryCategoriesPaginatedArgs = {
  limit?: InputMaybe<Scalars['Float']['input']>;
  offset?: InputMaybe<Scalars['Float']['input']>;
  query?: InputMaybe<Scalars['JSONObject']['input']>;
};


export type QueryCategoryArgs = {
  id: Scalars['String']['input'];
};


export type QueryCustomersArgs = {
  ids?: InputMaybe<Array<Scalars['String']['input']>>;
  limit?: InputMaybe<Scalars['Float']['input']>;
  offset?: InputMaybe<Scalars['Float']['input']>;
};


export type QueryEventArgs = {
  id: Scalars['String']['input'];
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
  type?: InputMaybe<Scalars['String']['input']>;
};


export type QueryTaskArgs = {
  _id: Scalars['String']['input'];
};


export type QueryTaskByCodeArgs = {
  code: Scalars['String']['input'];
};


export type QueryTaskStatusesArgs = {
  contextId?: InputMaybe<Scalars['String']['input']>;
  contextType?: InputMaybe<TaskStatusesContextType>;
};


export type QueryTasksArgs = {
  all?: InputMaybe<Scalars['Boolean']['input']>;
  assigneeUserIds?: InputMaybe<Array<Scalars['String']['input']>>;
  folderId?: InputMaybe<Scalars['String']['input']>;
  ids?: InputMaybe<Array<Scalars['String']['input']>>;
  limit?: InputMaybe<Scalars['Float']['input']>;
  offset?: InputMaybe<Scalars['Float']['input']>;
  parentId?: InputMaybe<Scalars['String']['input']>;
  partnerIds?: InputMaybe<Array<Scalars['String']['input']>>;
  priority?: InputMaybe<TaskPriority>;
  status?: InputMaybe<Scalars['String']['input']>;
  tagIds?: InputMaybe<Array<Scalars['String']['input']>>;
};


export type QueryTasksCountArgs = {
  all?: InputMaybe<Scalars['Boolean']['input']>;
  assigneeUserIds?: InputMaybe<Array<Scalars['String']['input']>>;
  folderId?: InputMaybe<Scalars['String']['input']>;
  ids?: InputMaybe<Array<Scalars['String']['input']>>;
  limit?: InputMaybe<Scalars['Float']['input']>;
  offset?: InputMaybe<Scalars['Float']['input']>;
  parentId?: InputMaybe<Scalars['String']['input']>;
  partnerIds?: InputMaybe<Array<Scalars['String']['input']>>;
  priority?: InputMaybe<TaskPriority>;
  status?: InputMaybe<Scalars['String']['input']>;
  tagIds?: InputMaybe<Array<Scalars['String']['input']>>;
};


export type QueryWorkspaceMembersArgs = {
  ids?: InputMaybe<Array<Scalars['String']['input']>>;
  ignoreSelf?: InputMaybe<Scalars['Boolean']['input']>;
  limit?: InputMaybe<Scalars['Float']['input']>;
  offset?: InputMaybe<Scalars['Float']['input']>;
};

export type RegisterDeviceDto = {
  identifyId: Scalars['String']['input'];
  locale?: InputMaybe<AppLocale>;
};

export type RelatedEntity = {
  __typename?: 'RelatedEntity';
  data: Maybe<Scalars['JSONObject']['output']>;
  entity: Scalars['String']['output'];
  id: Maybe<Scalars['String']['output']>;
  index: Maybe<Scalars['Boolean']['output']>;
};

export type SiblingTasks = {
  __typename?: 'SiblingTasks';
  next: Maybe<Task>;
  previous: Maybe<Task>;
};

export type SignUploadUrlResponse = {
  __typename?: 'SignUploadUrlResponse';
  dna: Scalars['String']['output'];
  signedUrl: Scalars['String']['output'];
};

export type SyncTaskResult = {
  __typename?: 'SyncTaskResult';
  task: Task;
  updateInfos: Array<Scalars['String']['output']>;
};

export type Tag = {
  __typename?: 'Tag';
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
export type Tags = {
  __typename?: 'Tags';
  count: Scalars['Float']['output'];
  data: Array<Tag>;
};

export type Task = {
  __typename?: 'Task';
  _id: Scalars['String']['output'];
  assigneeUserIds: Array<Scalars['String']['output']>;
  assigneeUsers: Array<WorkspaceMember>;
  childCount: Scalars['Float']['output'];
  childOrder: TaskChildOrder;
  childProgress: Scalars['Float']['output'];
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
  name: Scalars['String']['output'];
  order: Scalars['Float']['output'];
  parent: Maybe<Task>;
  parentId: Maybe<Scalars['String']['output']>;
  partnerIds: Array<Scalars['String']['output']>;
  partners: Array<PartnerEntity>;
  points: Maybe<Scalars['Float']['output']>;
  priority: Maybe<TaskPriority>;
  progress: Scalars['Float']['output'];
  refs: Maybe<Array<Scalars['String']['output']>>;
  relatedUserIds: Array<Scalars['String']['output']>;
  startDate: Maybe<Scalars['Float']['output']>;
  status: Scalars['String']['output'];
  statuses: Array<TaskStatus>;
  /** @deprecated Use folderId instead */
  tagFolderId: Maybe<Scalars['String']['output']>;
  tagIds: Array<Scalars['String']['output']>;
  tags: Array<Tag>;
  timeTrackings: Maybe<Array<TaskTimeTracking>>;
  updatedAt: Maybe<Scalars['Float']['output']>;
};

export type TaskChildOrder = {
  __typename?: 'TaskChildOrder';
  first: Maybe<Scalars['Float']['output']>;
  last: Maybe<Scalars['Float']['output']>;
};

export type TaskChildTimeline = {
  __typename?: 'TaskChildTimeline';
  dueDate: Maybe<Scalars['Float']['output']>;
  startDate: Maybe<Scalars['Float']['output']>;
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
  __typename?: 'TaskStatus';
  color: Maybe<Scalars['String']['output']>;
  contextId: Maybe<Scalars['String']['output']>;
  contextType: Maybe<TaskStatusesContextType>;
  id: Scalars['String']['output'];
  name: Maybe<Scalars['String']['output']>;
  order: Maybe<Scalars['Float']['output']>;
};

export type TaskStatusInput = {
  color?: InputMaybe<Scalars['String']['input']>;
  icon?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['String']['input'];
  name?: InputMaybe<Scalars['String']['input']>;
  order?: InputMaybe<Scalars['Float']['input']>;
};

/** Available task statuses context types */
export const TaskStatusesContextType = {
  Folder: 'FOLDER'
} as const;

export type TaskStatusesContextType = typeof TaskStatusesContextType[keyof typeof TaskStatusesContextType];
export type TaskTimeTracking = {
  __typename?: 'TaskTimeTracking';
  billable: Maybe<Scalars['Boolean']['output']>;
  endAt: Maybe<Scalars['Float']['output']>;
  id: Scalars['String']['output'];
  note: Maybe<Scalars['String']['output']>;
  startAt: Scalars['Float']['output'];
  user: Maybe<WorkspaceMember>;
  userId: Scalars['String']['output'];
  workspaceId: Scalars['String']['output'];
};

export type TaskTimeTrackingInput = {
  billable?: InputMaybe<Scalars['Boolean']['input']>;
  endAt?: InputMaybe<Scalars['Float']['input']>;
  id: Scalars['String']['input'];
  note?: InputMaybe<Scalars['String']['input']>;
  startAt: Scalars['Float']['input'];
  userId: Scalars['String']['input'];
};

export type TasksPaginated = {
  __typename?: 'TasksPaginated';
  count: Scalars['Float']['output'];
  data: Array<Task>;
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
  __typename?: 'UserAuthProvider';
  providerId: Scalars['String']['output'];
  uid: Scalars['String']['output'];
  username: Scalars['String']['output'];
};

export type WorkspaceMember = {
  __typename?: 'WorkspaceMember';
  _id: Scalars['String']['output'];
  avatar: Maybe<Scalars['String']['output']>;
  color: Maybe<Scalars['String']['output']>;
  email: Scalars['String']['output'];
  memberDisplayName: Maybe<Scalars['String']['output']>;
  memberId: Scalars['String']['output'];
  name: Scalars['String']['output'];
  phone: Maybe<Scalars['String']['output']>;
  roles: Array<WorkspaceMemberRole>;
  userId: Scalars['String']['output'];
};

export type WorkspaceMemberRole = {
  __typename?: 'WorkspaceMemberRole';
  _id: Scalars['String']['output'];
  color: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
};

export type WorkspaceMembersPaginated = {
  __typename?: 'WorkspaceMembersPaginated';
  count: Scalars['Float']['output'];
  data: Array<WorkspaceMember>;
};
