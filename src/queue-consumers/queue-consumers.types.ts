export enum QueueName {
  HEALTH_CHECK_LOANS = '[Loans] Health Check',
  REJECT_PENDING_LOANS = '[Loans] Reject Pending',
  SYNC_LOAN = '[Loans] Sync',

  SEND_MAIL = '[Mail] Send Mail',
  SEARCH_INDEX = '[Search] Search Index',
  AI_ASSISTANT_RESPONSE_MESSAGE_BOX = '[AI Assistant] Response Message Box',
  FORWARD_META_WEBHOOKS = '[Meta Webhooks] Forward Meta Webhooks',
  META_PAGES_WEBHOOK = '[Meta Pages] Webhook',

  SYNC_WORKSPACE_REPORTS = '[Reports] Sync Workspace',
  SYNC_REPORT = '[Reports] Sync',
  EXPORT_TIME_SERIES_REPORT = '[Reports] Export Time Series Report',
  PURGE_WORKSPACE_REPORTS = '[Reports] Purge Workspace Reports',

  SYNC_RECEIPT = '[Receipts] Sync',

  SYNC_ORDER = '[Orders] Sync',

  SYNC_TASK = '[Tasks] Sync',
  SYNC_TASK_METRICS = '[Tasks] Sync Metrics',

  SYNC_ACTIVITY = '[Activity] Sync',

  NOTIFY_NEW_BOOKING_TO_ZALO_GMF_GROUP = '[Bookings] Notify Zalo GMF Group',
  NOTIFY_NEW_CUSTOMER_TO_ZALO_GMF_GROUP = '[Customers] Notify New Customer To Zalo GMF Group',
  NOTIFY_NEW_MESSAGE_BOX_TO_ZALO_GMF_GROUP = '[Message Boxes] Notify New Message Box To Zalo GMF Group',

  ZALO_OA_ZNS_NEW_BOOKING = '[Zalo OA] ZNS New Booking',
  ZALO_OA_WEBHOOK = '[Zalo OA] Webhook',

  PLUGIN_E_INVOICES_CREATE_INVOICE = '[Plugin E Invoices] Create Invoice',

  PROCESS_FILE_EXPORT = '[File Exports] Process',

  EXTERNAL_STORAGE_FETCH_SIZE = '[External Storage] Fetch Size',

  AGGREGATE_WORKSPACE_STATS = '[Workspace] Aggregate Workspace Stats',
  REGISTER_WORKSPACE_SCHEDULE = '[Workspace] Register Workspace Schedule',

  SEND_NOTIFICATION = '[Notifications] Send Notification',
  CAPTURE_EVENT = '[Events] Capture Event',
  SEND_USER_EVENT = '[Users] Send User Event',
}
