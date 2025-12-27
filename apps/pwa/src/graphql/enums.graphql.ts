/** Available activity types */
export const ActivityType = {
  Comment: 'COMMENT',
  Common: 'COMMON'
} as const;

export type ActivityType = typeof ActivityType[keyof typeof ActivityType];
/** Available locales */
export const AppLocale = {
  En: 'EN',
  Vi: 'VI'
} as const;

export type AppLocale = typeof AppLocale[keyof typeof AppLocale];
/** Available category types */
export const CategoryType = {
  Common: 'COMMON',
  Posts: 'POSTS',
  Products: 'PRODUCTS'
} as const;

export type CategoryType = typeof CategoryType[keyof typeof CategoryType];
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
/** Available loan asset types */
export const LoanAssetType = {
  BusinessPermit: 'BUSINESS_PERMIT',
  CarRegistration: 'CAR_REGISTRATION',
  Icloud: 'ICLOUD',
  LandCertificate: 'LAND_CERTIFICATE',
  MotobikeRegistration: 'MOTOBIKE_REGISTRATION'
} as const;

export type LoanAssetType = typeof LoanAssetType[keyof typeof LoanAssetType];
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
/** Available external storage providers */
export const PluginExternalStorageProvider = {
  AwsS3: 'AWS_S3'
} as const;

export type PluginExternalStorageProvider = typeof PluginExternalStorageProvider[keyof typeof PluginExternalStorageProvider];
/** Available product types */
export const ProductType = {
  Combo: 'COMBO',
  Product: 'PRODUCT',
  Service: 'SERVICE',
  Voucher: 'VOUCHER'
} as const;

export type ProductType = typeof ProductType[keyof typeof ProductType];
/** Available reaction types */
export const ReactionType = {
  Celebrate: 'CELEBRATE',
  Eyes: 'EYES',
  Laugh: 'LAUGH',
  Like: 'LIKE',
  Love: 'LOVE'
} as const;

export type ReactionType = typeof ReactionType[keyof typeof ReactionType];
/** Available sort directions */
export const SortDirection = {
  Asc: 'ASC',
  Desc: 'DESC'
} as const;

export type SortDirection = typeof SortDirection[keyof typeof SortDirection];
/** Available tag types */
export const TagType = {
  Customer: 'CUSTOMER',
  MessageBox: 'MESSAGE_BOX',
  Task: 'TASK',
  TaskFolder: 'TASK_FOLDER'
} as const;

export type TagType = typeof TagType[keyof typeof TagType];
/** Available task statuses context types */
export const TaskContextType = {
  Folder: 'FOLDER'
} as const;

export type TaskContextType = typeof TaskContextType[keyof typeof TaskContextType];
/** Available task priorities */
export const TaskPriority = {
  High: 'HIGH',
  Low: 'LOW',
  Medium: 'MEDIUM',
  Urgent: 'URGENT'
} as const;

export type TaskPriority = typeof TaskPriority[keyof typeof TaskPriority];