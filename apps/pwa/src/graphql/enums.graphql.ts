/** Available activity types */
export const ActivityType = {
  Comment: 'COMMENT',
  Common: 'COMMON'
} as const;

export type ActivityType = typeof ActivityType[keyof typeof ActivityType];
/** Available admin actions */
export const AdminAction = {
  AggregateWorkspaceStats: 'AGGREGATE_WORKSPACE_STATS',
  PureReports: 'PURE_REPORTS',
  ResetCache: 'RESET_CACHE',
  SearchReindex: 'SEARCH_REINDEX',
  SyncLoans: 'SYNC_LOANS',
  SyncReceipts: 'SYNC_RECEIPTS'
} as const;

export type AdminAction = typeof AdminAction[keyof typeof AdminAction];
/** Available locales */
export const AppLocale = {
  En: 'en',
  Vi: 'vi'
} as const;

export type AppLocale = typeof AppLocale[keyof typeof AppLocale];
/** Attendance record method */
export const AttendanceRecordMethod = {
  Default: 'DEFAULT',
  Manual: 'MANUAL'
} as const;

export type AttendanceRecordMethod = typeof AttendanceRecordMethod[keyof typeof AttendanceRecordMethod];
/** Attendance record status */
export const AttendanceRecordStatus = {
  Approved: 'APPROVED',
  Pending: 'PENDING',
  Rejected: 'REJECTED'
} as const;

export type AttendanceRecordStatus = typeof AttendanceRecordStatus[keyof typeof AttendanceRecordStatus];
/** Attendance record type */
export const AttendanceRecordType = {
  CheckIn: 'CHECK_IN',
  CheckOut: 'CHECK_OUT'
} as const;

export type AttendanceRecordType = typeof AttendanceRecordType[keyof typeof AttendanceRecordType];
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
/** Available category types */
export const CategoryType = {
  Common: 'COMMON',
  Posts: 'POSTS',
  Products: 'PRODUCTS'
} as const;

export type CategoryType = typeof CategoryType[keyof typeof CategoryType];
/** Type of welcome input in channel widget */
export const ChannelWidgetWelcomeInputType = {
  Email: 'EMAIL',
  Name: 'NAME',
  Number: 'NUMBER',
  Phone: 'PHONE',
  Text: 'TEXT'
} as const;

export type ChannelWidgetWelcomeInputType = typeof ChannelWidgetWelcomeInputType[keyof typeof ChannelWidgetWelcomeInputType];
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
/** Available customer form statuses */
export const CustomerFormStatus = {
  Cancelled: 'CANCELLED',
  Completed: 'COMPLETED',
  Pending: 'PENDING'
} as const;

export type CustomerFormStatus = typeof CustomerFormStatus[keyof typeof CustomerFormStatus];
/** Customer KYC status */
export const CustomerKycStatus = {
  Approved: 'APPROVED',
  Pending: 'PENDING',
  Rejected: 'REJECTED'
} as const;

export type CustomerKycStatus = typeof CustomerKycStatus[keyof typeof CustomerKycStatus];
/** DynamicSelectionOperator */
export const DynamicSelectionOperator = {
  Excludes: 'EXCLUDES',
  Includes: 'INCLUDES'
} as const;

export type DynamicSelectionOperator = typeof DynamicSelectionOperator[keyof typeof DynamicSelectionOperator];
/** Available entity sources */
export const EntitySource = {
  Import: 'IMPORT',
  Internal: 'INTERNAL',
  ZaloOa: 'ZALO_OA'
} as const;

export type EntitySource = typeof EntitySource[keyof typeof EntitySource];
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
  AttendanceRecordApproved: 'ATTENDANCE_RECORD_APPROVED',
  AttendanceRecordNew: 'ATTENDANCE_RECORD_NEW',
  AttendanceRecordRejected: 'ATTENDANCE_RECORD_REJECTED',
  AttendanceSettingUpdated: 'ATTENDANCE_SETTING_UPDATED',
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
  PluginZaloOaRemoved: 'PLUGIN_ZALO_OA_REMOVED',
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
  ReportMetricsSynced: 'REPORT_METRICS_SYNCED',
  ReportTimeSeriesSynced: 'REPORT_TIME_SERIES_SYNCED',
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
export const LoanPackageType = {
  FixedCapital: 'FIXED_CAPITAL',
  Installment: 'INSTALLMENT',
  UnfixedCapital: 'UNFIXED_CAPITAL'
} as const;

export type LoanPackageType = typeof LoanPackageType[keyof typeof LoanPackageType];
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
/** The type of location (province, district, ward) */
export const LocationType = {
  District: 'district',
  Province: 'province',
  Ward: 'ward'
} as const;

export type LocationType = typeof LocationType[keyof typeof LocationType];
/** Type of the message attachment */
export const MessageAttachmentType = {
  Audio: 'AUDIO',
  File: 'FILE',
  Image: 'IMAGE',
  Sticker: 'STICKER',
  Unknown: 'UNKNOWN',
  Video: 'VIDEO'
} as const;

export type MessageAttachmentType = typeof MessageAttachmentType[keyof typeof MessageAttachmentType];
/** Platform type of the message box */
export const MessageBoxPlatformType = {
  MessageHub: 'MESSAGE_HUB',
  MetaPage: 'META_PAGE',
  Zalo: 'ZALO'
} as const;

export type MessageBoxPlatformType = typeof MessageBoxPlatformType[keyof typeof MessageBoxPlatformType];
/** Status of the message box */
export const MessageBoxStatus = {
  Closed: 'CLOSED',
  Expired: 'EXPIRED',
  InProgress: 'IN_PROGRESS',
  Waiting: 'WAITING'
} as const;

export type MessageBoxStatus = typeof MessageBoxStatus[keyof typeof MessageBoxStatus];
/** Position of the widget on the client screen */
export const MessageHubWidgetPosition = {
  Left: 'LEFT',
  Right: 'RIGHT'
} as const;

export type MessageHubWidgetPosition = typeof MessageHubWidgetPosition[keyof typeof MessageHubWidgetPosition];
/** The resource from which the message is sent */
export const MessageResource = {
  AiAssistant: 'AI_ASSISTANT',
  Internal: 'INTERNAL',
  Webhook: 'WEBHOOK'
} as const;

export type MessageResource = typeof MessageResource[keyof typeof MessageResource];
/** Status of the message */
export const MessageStatus = {
  Pending: 'PENDING',
  Readed: 'READED',
  Sent: 'SENT',
  SentFailed: 'SENT_FAILED'
} as const;

export type MessageStatus = typeof MessageStatus[keyof typeof MessageStatus];
/** Type of the message */
export const MessageType = {
  Receive: 'RECEIVE',
  Send: 'SEND'
} as const;

export type MessageType = typeof MessageType[keyof typeof MessageType];
/** Connection status of the Meta Page */
export const MetaPageInfoStatus = {
  Connected: 'CONNECTED',
  ConnectedWithOtherWorkspace: 'CONNECTED_WITH_OTHER_WORKSPACE',
  NotConnected: 'NOT_CONNECTED'
} as const;

export type MetaPageInfoStatus = typeof MetaPageInfoStatus[keyof typeof MetaPageInfoStatus];
/** Status of the Meta Page connection */
export const MetaPageStatus = {
  Active: 'ACTIVE',
  Inactive: 'INACTIVE'
} as const;

export type MetaPageStatus = typeof MetaPageStatus[keyof typeof MetaPageStatus];
/** Icon of the notification */
export const NotificationIcon = {
  Message: 'MESSAGE'
} as const;

export type NotificationIcon = typeof NotificationIcon[keyof typeof NotificationIcon];
/** Status of the notification */
export const NotificationStatus = {
  JustCreated: 'JUST_CREATED',
  ListViewed: 'LIST_VIEWED',
  Readed: 'READED'
} as const;

export type NotificationStatus = typeof NotificationStatus[keyof typeof NotificationStatus];
/** Type of the notification */
export const NotificationType = {
  Error: 'ERROR',
  Info: 'INFO',
  Success: 'SUCCESS',
  Warning: 'WARNING'
} as const;

export type NotificationType = typeof NotificationType[keyof typeof NotificationType];
/** Order discount type */
export const OrderDiscountType = {
  Combo: 'COMBO',
  Direct: 'DIRECT',
  Promotion: 'PROMOTION'
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
/** Available periods for reports */
export const Period = {
  Date: 'DATE',
  Month: 'MONTH',
  Week: 'WEEK',
  Year: 'YEAR'
} as const;

export type Period = typeof Period[keyof typeof Period];
/** Provider of the AI assistant plugin */
export const PluginAiAssistantProvider = {
  Dify: 'DIFY',
  VonicDify: 'VONIC_DIFY'
} as const;

export type PluginAiAssistantProvider = typeof PluginAiAssistantProvider[keyof typeof PluginAiAssistantProvider];
/** Status of the AI assistant plugin */
export const PluginAiAssistantStatus = {
  Active: 'ACTIVE',
  Inactive: 'INACTIVE'
} as const;

export type PluginAiAssistantStatus = typeof PluginAiAssistantStatus[keyof typeof PluginAiAssistantStatus];
/** Status of the plugin e-invoices provider */
export const PluginEInvoicesProviderStatus = {
  Active: 'ACTIVE',
  AuthFailed: 'AUTH_FAILED',
  Inactive: 'INACTIVE'
} as const;

export type PluginEInvoicesProviderStatus = typeof PluginEInvoicesProviderStatus[keyof typeof PluginEInvoicesProviderStatus];
/** Available plugin e-invoices provider types */
export const PluginEInvoicesProviderType = {
  Matbao: 'MATBAO',
  MatbaoDemo: 'MATBAO_DEMO'
} as const;

export type PluginEInvoicesProviderType = typeof PluginEInvoicesProviderType[keyof typeof PluginEInvoicesProviderType];
/** Available external storage providers */
export const PluginExternalStorageProvider = {
  AwsS3: 'AWS_S3'
} as const;

export type PluginExternalStorageProvider = typeof PluginExternalStorageProvider[keyof typeof PluginExternalStorageProvider];
/** Status of Zalo OA connection */
export const PluginZaloOaStatus = {
  Active: 'ACTIVE',
  Inactive: 'INACTIVE'
} as const;

export type PluginZaloOaStatus = typeof PluginZaloOaStatus[keyof typeof PluginZaloOaStatus];
/** Template IDs for Zalo OA ZNS messages */
export const PluginZaloOaZnsTemplateId = {
  Booking: 'BOOKING',
  CustomerBirthday: 'CUSTOMER_BIRTHDAY',
  LoanFulfilled: 'LOAN_FULFILLED',
  LoanReceiptPaid: 'LOAN_RECEIPT_PAID',
  LoanReceiptPartialPay: 'LOAN_RECEIPT_PARTIAL_PAY',
  LoanReceiptRemind: 'LOAN_RECEIPT_REMIND',
  Otp: 'OTP'
} as const;

export type PluginZaloOaZnsTemplateId = typeof PluginZaloOaZnsTemplateId[keyof typeof PluginZaloOaZnsTemplateId];
/** Product combo source type */
export const ProductComboSourceType = {
  Manual: 'MANUAL',
  Order: 'ORDER'
} as const;

export type ProductComboSourceType = typeof ProductComboSourceType[keyof typeof ProductComboSourceType];
/** Product combo status */
export const ProductComboStatus = {
  Active: 'ACTIVE',
  Expired: 'EXPIRED',
  Inactive: 'INACTIVE',
  OutOfStock: 'OUT_OF_STOCK',
  SourceUnavailable: 'SOURCE_UNAVAILABLE'
} as const;

export type ProductComboStatus = typeof ProductComboStatus[keyof typeof ProductComboStatus];
/** Product stock record type */
export const ProductStockRecordType = {
  StockIn: 'STOCK_IN',
  StockOut: 'STOCK_OUT'
} as const;

export type ProductStockRecordType = typeof ProductStockRecordType[keyof typeof ProductStockRecordType];
/** Available product types */
export const ProductType = {
  Combo: 'COMBO',
  Product: 'PRODUCT',
  Service: 'SERVICE',
  Voucher: 'VOUCHER'
} as const;

export type ProductType = typeof ProductType[keyof typeof ProductType];
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
/** Report status values */
export const ReportStatus = {
  JustCreated: 'JUST_CREATED',
  Synced: 'SYNCED',
  Syncing: 'SYNCING'
} as const;

export type ReportStatus = typeof ReportStatus[keyof typeof ReportStatus];
/** Report types */
export const ReportType = {
  Metrics: 'METRICS',
  TimeSeries: 'TIME_SERIES'
} as const;

export type ReportType = typeof ReportType[keyof typeof ReportType];
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
/** Available roles of a user */
export const UserRole = {
  Admin: 'ADMIN',
  BusinessPartner: 'BUSINESS_PARTNER',
  Member: 'MEMBER',
  SysAdmin: 'SYS_ADMIN',
  Tester: 'TESTER'
} as const;

export type UserRole = typeof UserRole[keyof typeof UserRole];
/** The working time type of the workspace member */
export const WorkspaceMemberWorkingTimeType = {
  Freelancer: 'FREELANCER',
  Fulltime: 'FULLTIME'
} as const;

export type WorkspaceMemberWorkingTimeType = typeof WorkspaceMemberWorkingTimeType[keyof typeof WorkspaceMemberWorkingTimeType];
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
/** Status of Zalo OA GMF Group */
export const ZaloOaGmfGroupStatus = {
  Disabled: 'disabled',
  Enabled: 'enabled'
} as const;

export type ZaloOaGmfGroupStatus = typeof ZaloOaGmfGroupStatus[keyof typeof ZaloOaGmfGroupStatus];