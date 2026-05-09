import { AppLocale, Dictionary } from '../lang/lang.types';
import { EventType } from './events.types';

export const eventTypeDictionary: Dictionary<EventType> = {
  prefix: 'event_type',
  dictionary: {
    [EventType.CUSTOM_FIELDS_NEW]: {
      [AppLocale.en]: 'Custom field created',
      [AppLocale.vi]: 'Tạo trường tùy chỉnh',
    },
    [EventType.CUSTOM_FIELDS_UPDATED]: {
      [AppLocale.en]: 'Custom field updated',
      [AppLocale.vi]: 'Cập nhật trường tùy chỉnh',
    },
    [EventType.CUSTOM_FIELDS_REMOVED]: {
      [AppLocale.en]: 'Custom field removed',
      [AppLocale.vi]: 'Xoá trường tùy chỉnh',
    },
    [EventType.WORKSPACE_NEW]: {
      [AppLocale.en]: 'Workspace created',
      [AppLocale.vi]: 'Khởi tạo Workspace',
    },
    [EventType.WORKSPACE_UPDATED]: {
      [AppLocale.en]: 'Workspace updated',
      [AppLocale.vi]: 'Cập nhật Workspace',
    },
    [EventType.WORKSPACE_SETTING_UPDATED]: {
      [AppLocale.en]: 'Workspace setting updated',
      [AppLocale.vi]: 'Cập nhật cài đặt Workspace',
    },
    [EventType.WORKSPACE_MEMBER_JOINED]: {
      [AppLocale.en]: 'Member joined workspace',
      [AppLocale.vi]: 'Tham gia Workspace',
    },
    [EventType.WORKSPACE_MEMBER_LEAVED]: {
      [AppLocale.en]: 'Member leaved workspace',
      [AppLocale.vi]: 'Rời khỏi Workspace',
    },
    [EventType.WORKSPACE_MEMBER_UPDATED]: {
      [AppLocale.en]: 'Member updated',
      [AppLocale.vi]: 'Cập nhật thành viên',
    },
    [EventType.WORKSPACE_MEMBER_TRANSFER_OWNER]: {
      [AppLocale.en]: 'Transfer owner',
      [AppLocale.vi]: 'Chuyển quyền sở hữu',
    },
    [EventType.CUSTOMER_NEW]: {
      [AppLocale.en]: 'Customer created',
      [AppLocale.vi]: 'Khách hàng mới',
    },
    [EventType.CUSTOMER_UPDATED]: {
      [AppLocale.en]: 'Customer updated',
      [AppLocale.vi]: 'Cập nhật khách hàng',
    },
    [EventType.CUSTOMER_ASSIGN_TO_USER]: {
      [AppLocale.en]: 'Assign user',
      [AppLocale.vi]: 'Gán người dùng',
    },
    [EventType.CUSTOMER_UNASSIGN_USER]: {
      [AppLocale.en]: 'Unassign user',
      [AppLocale.vi]: 'Bỏ gán người dùng',
    },
    [EventType.CUSTOMER_BULK_UPDATE_WORKSPACE_BRANCH]: {
      [AppLocale.en]: 'Bulk update workspace branch',
      [AppLocale.vi]: 'Cập nhật chi nhánh workspace',
    },
    [EventType.BOOKING_NEW]: {
      [AppLocale.en]: 'Create booking',
      [AppLocale.vi]: 'Lịch hẹn mới',
    },
    [EventType.BOOKING_UPDATED]: {
      [AppLocale.en]: 'Update booking',
      [AppLocale.vi]: 'Cập nhật lịch hẹn',
    },
    [EventType.BOOKING_CHECKIN]: {
      [AppLocale.en]: 'Customer checkin',
      [AppLocale.vi]: 'Khách hàng đã đến',
    },
    [EventType.BOOKING_IN_PROGRESS]: {
      [AppLocale.en]: 'Next customer',
      [AppLocale.vi]: 'Khách hàng tiếp theo',
    },
    [EventType.BOOKING_COMPLETED]: {
      [AppLocale.en]: 'Booking Completed',
      [AppLocale.vi]: 'Hoàn thành lịch hẹn',
    },
    [EventType.BOOKING_CANCELLED]: {
      [AppLocale.en]: 'Booking Cancelled',
      [AppLocale.vi]: 'Hủy lịch hẹn',
    },
    [EventType.COMMENT_NEW]: {
      [AppLocale.en]: 'Comment created',
      [AppLocale.vi]: 'Bình luận mới',
    },
    [EventType.COMMENT_UPDATED]: {
      [AppLocale.en]: 'Comment updated',
      [AppLocale.vi]: 'Cập nhật bình luận',
    },
    [EventType.COMMENT_REMOVED]: {
      [AppLocale.en]: 'Comment removed',
      [AppLocale.vi]: 'Xoá bình luận',
    },
    [EventType.COMMENT_PINNED]: {
      [AppLocale.en]: 'Comment pinned',
      [AppLocale.vi]: 'Ghim bình luận',
    },
    [EventType.COMMENT_UNPINNED]: {
      [AppLocale.en]: 'Comment unpinned',
      [AppLocale.vi]: 'Bỏ ghim bình luận',
    },
    [EventType.PRODUCT_NEW]: {
      [AppLocale.en]: 'Create product',
      [AppLocale.vi]: 'Tạo sản phẩm',
    },
    [EventType.PRODUCT_UPDATE]: {
      [AppLocale.en]: 'Update product',
      [AppLocale.vi]: 'Cập nhật sản phẩm',
    },
    [EventType.PRODUCT_ARCHIVED]: {
      [AppLocale.en]: 'Archive product',
      [AppLocale.vi]: 'Xoá sản phẩm',
    },
    [EventType.REPORT_TIME_SERIES_SYNCED]: {
      [AppLocale.en]: 'Report synced',
      [AppLocale.vi]: 'Báo cáo đã được đồng bộ',
    },
    [EventType.NOTIFICATION_NEW]: {
      [AppLocale.en]: 'New notification',
      [AppLocale.vi]: 'Thông báo mới',
    },
    [EventType.NOTIFICATION_READED]: {
      [AppLocale.en]: 'Mark as read',
      [AppLocale.vi]: 'Đánh dấu đã đọc',
    },
    [EventType.NOTIFICATION_LIST_VIEWED]: {
      [AppLocale.en]: 'View notification list',
      [AppLocale.vi]: 'Xem danh sách thông báo',
    },
    [EventType.NOTIFICATION_CLEANED]: {
      [AppLocale.en]: 'Clean notifications',
      [AppLocale.vi]: 'Dọn dẹp thông báo',
    },
    [EventType.PARTNER_NEW]: {
      [AppLocale.en]: 'Create partner',
      [AppLocale.vi]: 'Tạo đối tác',
    },
    [EventType.PARTNER_UPDATED]: {
      [AppLocale.en]: 'Update partner',
      [AppLocale.vi]: 'Cập nhật đối tác',
    },
    [EventType.PARTNER_ARCHIVED]: {
      [AppLocale.en]: 'Archive partner',
      [AppLocale.vi]: 'Xoá đối tác',
    },
    [EventType.TASK_NEW]: {
      [AppLocale.en]: 'Create task',
      [AppLocale.vi]: 'Tạo công việc',
    },
    [EventType.TASK_ARCHIVED]: {
      [AppLocale.en]: 'Archive task',
      [AppLocale.vi]: 'Xoá công việc',
    },
    [EventType.FILE_NEW]: {
      [AppLocale.en]: 'Create file',
      [AppLocale.vi]: 'Tạo file',
    },
    [EventType.FILE_REMOVED]: {
      [AppLocale.en]: 'Remove file',
      [AppLocale.vi]: 'Xoá file',
    },
    [EventType.RECEIPT_NEW]: {
      [AppLocale.en]: 'Create receipt',
      [AppLocale.vi]: 'Tạo hoá đơn',
    },
    [EventType.RECEIPT_PAID]: {
      [AppLocale.en]: 'Pay receipt',
      [AppLocale.vi]: 'Thanh toán hoá đơn',
    },
    [EventType.RECEIPT_UPDATED]: {
      [AppLocale.en]: 'Update receipt',
      [AppLocale.vi]: 'Cập nhật hoá đơn',
    },
    [EventType.RECEIPT_DISBURSEMENT]: {
      [AppLocale.en]: 'Disbursement',
      [AppLocale.vi]: 'Chi tiền',
    },
    [EventType.RECEIPT_ARCHIVED]: {
      [AppLocale.en]: 'Archive receipt',
      [AppLocale.vi]: 'Xoá hoá đơn',
    },
    [EventType.PRODUCT_SUPPLY_RECORD_NEW]: {
      [AppLocale.en]: 'Product supply record created',
      [AppLocale.vi]: 'Tạo phiếu nhập xuất',
    },
    [EventType.PLUGIN_ZALO_OA_ACTIVE]: {
      [AppLocale.en]: 'Zalo OA active',
      [AppLocale.vi]: 'Kích hoạt Zalo OA',
    },
    [EventType.PLUGIN_ZALO_OA_INACTIVE]: {
      [AppLocale.en]: 'Zalo OA inactive',
      [AppLocale.vi]: 'Vô hiệu Zalo OA',
    },
    [EventType.PLUGIN_ZALO_OA_UPDATED]: {
      [AppLocale.en]: 'Zalo OA updated',
      [AppLocale.vi]: 'Cập nhật Zalo OA',
    },
    [EventType.PLUGIN_ZALO_OA_ENABLED]: {
      [AppLocale.en]: 'Zalo OA enabled',
      [AppLocale.vi]: 'Zalo OA đã được kích hoạt',
    },
    [EventType.PLUGIN_ZALO_OA_DISABLED]: {
      [AppLocale.en]: 'Zalo OA disabled',
      [AppLocale.vi]: 'Zalo OA không khả dụng',
    },
    [EventType.PLUGIN_ZALO_OA_REMOVED]: {
      [AppLocale.en]: 'Zalo OA removed',
      [AppLocale.vi]: 'Xoá Zalo OA',
    },
    [EventType.PLUGIN_META_PAGES_UPDATED]: {
      [AppLocale.en]: 'Meta pages updated',
      [AppLocale.vi]: 'Cập nhật trang meta',
    },
    [EventType.PLUGIN_META_PAGES_DISCONNECTED]: {
      [AppLocale.en]: 'Meta pages disconnected',
      [AppLocale.vi]: 'Ngắt kết nối Meta Page',
    },
    [EventType.WORKSPACE_ROLES_NEW]: {
      [AppLocale.en]: 'Role created',
      [AppLocale.vi]: 'Tạo vai trò',
    },
    [EventType.WORKSPACE_ROLES_UPDATED]: {
      [AppLocale.en]: 'Role updated',
      [AppLocale.vi]: 'Cập nhật vai trò',
    },
    [EventType.WORKSPACE_ROLES_REMOVED]: {
      [AppLocale.en]: 'Role removed',
      [AppLocale.vi]: 'Xoá vai trò',
    },
    [EventType.PRESCRIPTIONS_NEW]: {
      [AppLocale.en]: 'Prescription created',
      [AppLocale.vi]: 'Tạo đơn thuốc',
    },
    [EventType.PRESCRIPTIONS_UPDATED]: {
      [AppLocale.en]: 'Prescription updated',
      [AppLocale.vi]: 'Cập nhật đơn thuốc',
    },
    [EventType.PRESCRIPTIONS_REMOVED]: {
      [AppLocale.en]: 'Prescription removed',
      [AppLocale.vi]: 'Xoá đơn thuốc',
    },
    [EventType.MESSAGE_NEW]: {
      [AppLocale.en]: 'New message',
      [AppLocale.vi]: 'Tin nhắn mới',
    },
    [EventType.MESSAGE_UPDATED]: {
      [AppLocale.en]: 'Message updated',
      [AppLocale.vi]: 'Cập nhật tin nhắn',
    },
    [EventType.MESSAGE_BOX_NEW]: {
      [AppLocale.en]: 'New message box',
      [AppLocale.vi]: 'Hộp tin nhắn mới',
    },
    [EventType.MESSAGE_BOX_WAITING]: {
      [AppLocale.en]: 'Message box waiting',
      [AppLocale.vi]: 'Hộp tin nhắn đang chờ',
    },
    [EventType.MESSAGE_BOX_NEW_MESSAGE]: {
      [AppLocale.en]: 'New message in box',
      [AppLocale.vi]: 'Tin nhắn mới trong hộp',
    },
    [EventType.MESSAGE_BOX_IN_PROGRESS]: {
      [AppLocale.en]: 'Message box in progress',
      [AppLocale.vi]: 'Hộp tin nhắn đang thực hiện',
    },
    [EventType.MESSAGE_BOX_REMOVED]: {
      [AppLocale.en]: 'Message box removed',
      [AppLocale.vi]: 'Xoá hộp tin nhắn',
    },
    [EventType.MESSAGE_BOX_CLOSED]: {
      [AppLocale.en]: 'Message box closed',
      [AppLocale.vi]: 'Đóng hộp tin nhắn',
    },
    [EventType.MESSAGE_BOX_UPDATED]: {
      [AppLocale.en]: 'Message box updated',
      [AppLocale.vi]: 'Cập nhật hộp tin nhắn',
    },
    [EventType.MESSAGE_BOXES_PLATFORMS_UPDATED]: {
      [AppLocale.en]: 'Message boxes platforms updated',
      [AppLocale.vi]: 'Cập nhật danh sách nền tảng tin nhắn',
    },
    [EventType.WORKSPACE_BILLINGS_DEPOSITED]: {
      [AppLocale.en]: 'Billings deposited',
      [AppLocale.vi]: 'Nạp tiền',
    },
    [EventType.WORKSPACE_BILLINGS_WITHDRAWN]: {
      [AppLocale.en]: 'Billings withdrawn',
      [AppLocale.vi]: 'Rút tiền',
    },
    [EventType.WORKSPACE_BILLINGS_PAYMENT_NEW]: {
      [AppLocale.en]: 'Payment created',
      [AppLocale.vi]: 'Hoá đơn thanh toán',
    },
    [EventType.WORKSPACE_BILLINGS_CASHBACK_NEW]: {
      [AppLocale.en]: 'Cashback created',
      [AppLocale.vi]: 'Hoàn tiền',
    },
    [EventType.WORKSPACE_BILLINGS_PAYMENT_PAID]: {
      [AppLocale.en]: 'Payment paid',
      [AppLocale.vi]: 'Đã thanh toán',
    },
    [EventType.WORKSPACE_SUBSCRIPTION_UPDATED]: {
      [AppLocale.en]: 'Subscription updated',
      [AppLocale.vi]: 'Cập nhật gói dịch vụ',
    },
    [EventType.TABLE_SLOT_NEW]: {
      [AppLocale.en]: 'Table slot created',
      [AppLocale.vi]: 'Tạo slot bàn',
    },
    [EventType.TABLE_SLOT_UPDATED]: {
      [AppLocale.en]: 'Table slot updated',
      [AppLocale.vi]: 'Cập nhật slot bàn',
    },
    [EventType.TABLE_SLOT_ARCHIVED]: {
      [AppLocale.en]: 'Table slot archived',
      [AppLocale.vi]: 'Xoá slot bàn',
    },
    [EventType.BANK_TRANSACTION_PAID]: {
      [AppLocale.en]: 'Transaction paid',
      [AppLocale.vi]: 'Thanh toán',
    },
    [EventType.BANK_TRANSACTION_FULFILLED]: {
      [AppLocale.en]: 'Transaction fulfilled',
      [AppLocale.vi]: 'Hoàn thành giao dịch',
    },
    [EventType.BANK_TRANSACTION_CANCELLED]: {
      [AppLocale.en]: 'Transaction cancelled',
      [AppLocale.vi]: 'Hủy giao dịch',
    },
    [EventType.BANK_TRANSACTION_FAILED]: {
      [AppLocale.en]: 'Transaction failed',
      [AppLocale.vi]: 'Giao dịch thất bại',
    },

    [EventType.CUSTOMER_KYC_PENDING]: {
      [AppLocale.en]: 'KYC pending',
      [AppLocale.vi]: 'KYC đang chờ kiểm duyệt',
    },
    [EventType.CUSTOMER_KYC_APPROVED]: {
      [AppLocale.en]: 'KYC approved',
      [AppLocale.vi]: 'KYC đã duyệt',
    },
    [EventType.CUSTOMER_KYC_REJECTED]: {
      [AppLocale.en]: 'KYC rejected',
      [AppLocale.vi]: 'KYC bị từ chối',
    },
    [EventType.LOANS_PENDING]: {
      [AppLocale.en]: 'Loan is signed by customer, waiting for approval',
      [AppLocale.vi]: 'Hồ sơ vay mới đã được ký, chờ duyệt',
    },
    [EventType.LOANS_APPROVED]: {
      [AppLocale.vi]: 'Duyệt hồ sơ vay',
      [AppLocale.en]: 'Approve loan',
    },
    [EventType.LOANS_REJECTED]: {
      [AppLocale.en]: 'Reject loan',
      [AppLocale.vi]: 'Từ chối hồ sơ vay',
    },
    [EventType.LOANS_UPDATED]: {
      [AppLocale.en]: 'Update loan',
      [AppLocale.vi]: 'Cập nhật hồ sơ vay',
    },
    [EventType.LOANS_FULFILLED]: {
      [AppLocale.en]: 'Fulfill loan',
      [AppLocale.vi]: 'Giải ngân hồ sơ vay',
    },
    [EventType.LOANS_COMPLETED]: {
      [AppLocale.en]: 'Complete loan',
      [AppLocale.vi]: 'Hoàn thành hồ sơ vay',
    },
    [EventType.LOANS_JUST_CREATED]: {
      [AppLocale.en]: 'Create new loan contract',
      [AppLocale.vi]: 'Tạo mới hồ sơ vay',
    },
    [EventType.LOANS_ARCHIVED]: {
      [AppLocale.en]: 'Loans archived',
      [AppLocale.vi]: 'Xoá hồ sơ vay',
    },
    [EventType.LOANS_LIQUIDATION]: {
      [AppLocale.en]: 'Loans liquidation',
      [AppLocale.vi]: 'Tất toán hồ sơ vay',
    },
    [EventType.CUSTOMER_CONTACTS_UPDATED]: {
      [AppLocale.en]: 'Customer contacts updated',
      [AppLocale.vi]: 'Cập nhật thông tin liên hệ',
    },
    [EventType.PRODUCT_VOUCHERS_NEW]: {
      [AppLocale.en]: 'New voucher',
      [AppLocale.vi]: 'Voucher mới',
    },
    [EventType.PLUGIN_MESSAGE_HUBS_NEW]: {
      [AppLocale.en]: 'New message hub',
      [AppLocale.vi]: 'Message Hub mới',
    },
    [EventType.PLUGIN_MESSAGE_HUBS_UPDATED]: {
      [AppLocale.en]: 'Message hub updated',
      [AppLocale.vi]: 'Cập nhật Message Hub',
    },
    [EventType.PLUGIN_MESSAGE_HUBS_REMOVED]: {
      [AppLocale.en]: 'Message hub removed',
      [AppLocale.vi]: 'Xoá Message Hub',
    },
    [EventType.WORKSPACE_ARCHIVED]: {
      [AppLocale.en]: 'Workspace archived',
      [AppLocale.vi]: 'Workspace đã xoá',
    },
    [EventType.TAGS_ARCHIVED]: {
      [AppLocale.en]: 'Tags archived',
      [AppLocale.vi]: 'Xoá tag',
    },
    [EventType.TASKS_UPDATED]: {
      [AppLocale.en]: 'Tasks updated',
      [AppLocale.vi]: 'Cập nhật công việc',
    },
    [EventType.TASK_STATUS_UPDATED]: {
      [AppLocale.en]: 'Update task status',
      [AppLocale.vi]: 'Cập nhật trạng thái công việc',
    },
    [EventType.TASK_ASSIGNED]: {
      [AppLocale.en]: 'Task assigned',
      [AppLocale.vi]: 'Giao việc',
    },
    [EventType.RECEIPT_UNARCHIVED]: {
      [AppLocale.en]: 'Receipt unarchived',
      [AppLocale.vi]: 'Khôi phục hoá đơn',
    },
    [EventType.LOANS_REVERT_LIQUIDATION]: {
      [AppLocale.en]: 'Revert liquidation',
      [AppLocale.vi]: 'Hoàn tác tất toán',
    },
    [EventType.CUSTOMER_ARCHIVED]: {
      [AppLocale.en]: 'Customer archived',
      [AppLocale.vi]: 'Xoá khách hàng',
    },
    [EventType.TASK_NAME_UPDATED]: {
      [AppLocale.en]: 'Update task name',
      [AppLocale.vi]: 'Cập nhật tên công việc',
    },
    [EventType.TASK_DESCRIPTION_UPDATED]: {
      [AppLocale.en]: 'Update task description',
      [AppLocale.vi]: 'Cập nhật mô tả công việc',
    },
    [EventType.TASK_PRIORITY_UPDATED]: {
      [AppLocale.en]: 'Update task priority',
      [AppLocale.vi]: 'Cập nhật độ ưu tiên công việc',
    },
    [EventType.USER_PROFILE_UPDATED]: {
      [AppLocale.en]: 'Update user profile',
      [AppLocale.vi]: 'Cập nhật thông tin cá nhân',
    },
    [EventType.WORKSPACE_INVITE_CODE_UPDATED]: {
      [AppLocale.en]: 'Workspace invite code updated',
      [AppLocale.vi]: 'Cập nhật mã mời thành viên',
    },
    [EventType.PLUGIN_AI_ASSISTANTS_NEW]: {
      [AppLocale.en]: 'AI assistant created',
      [AppLocale.vi]: 'Trợ lý AI mới',
    },
    [EventType.PLUGIN_AI_ASSISTANTS_UPDATED]: {
      [AppLocale.en]: 'AI assistant updated',
      [AppLocale.vi]: 'Cập nhật trợ lý AI',
    },
    [EventType.PLUGIN_AI_ASSISTANTS_REMOVED]: {
      [AppLocale.en]: 'AI assistant removed',
      [AppLocale.vi]: 'Xoá trợ lý AI',
    },
    [EventType.WORKSPACE_BRANCH_NEW]: {
      [AppLocale.en]: 'Create new workspace branch',
      [AppLocale.vi]: 'Tạo chi nhánh mới',
    },
    [EventType.WORKSPACE_BRANCH_UPDATED]: {
      [AppLocale.en]: 'Update workspace branch',
      [AppLocale.vi]: 'Cập nhật chi nhánh',
    },
    [EventType.ORDER_NEW]: {
      [AppLocale.en]: 'Created order',
      [AppLocale.vi]: 'Tạo đơn hàng',
    },
    [EventType.ORDER_UPDATED]: {
      [AppLocale.en]: 'Updated order',
      [AppLocale.vi]: 'Cập nhật đơn hàng',
    },
    [EventType.ORDER_ARCHIVED]: {
      [AppLocale.en]: 'Archived order',
      [AppLocale.vi]: 'Xoá đơn hàng',
    },
    [EventType.PRODUCT_COMBO_UPDATE]: {
      [AppLocale.en]: 'Product combo updated',
      [AppLocale.vi]: 'Cập nhật combo sản phẩm',
    },
    [EventType.ORDER_SYNCED]: {
      [AppLocale.en]: 'Order synced',
      [AppLocale.vi]: 'Đồng bộ đơn hàng',
    },
    [EventType.LOANS_SYNCED]: {
      [AppLocale.en]: 'Loans synced',
      [AppLocale.vi]: 'Đồng bộ hồ sơ vay',
    },
    [EventType.PRODUCT_STOCK_IN]: {
      [AppLocale.en]: 'Stock in',
      [AppLocale.vi]: 'Nhập hàng',
    },
    [EventType.PRODUCT_STOCK_IN_REVERT]: {
      [AppLocale.en]: 'Stock in reverted',
      [AppLocale.vi]: 'Hoàn tác nhập hàng',
    },
    [EventType.PRODUCT_STOCK_OUT]: {
      [AppLocale.en]: 'Stock out',
      [AppLocale.vi]: 'Xuất hàng',
    },
    [EventType.PRODUCT_STOCK_OUT_REVERT]: {
      [AppLocale.en]: 'Stock out reverted',
      [AppLocale.vi]: 'Hoàn tác xuất hàng',
    },
    [EventType.PRODUCT_STOCK_IN_MULTIPLE]: {
      [AppLocale.en]: 'Stock in multiple',
      [AppLocale.vi]: 'Nhập hàng lô',
    },
    [EventType.PRODUCT_COMBO_NEW]: {
      [AppLocale.en]: 'Product combo new',
      [AppLocale.vi]: 'Combo sản phẩm mới',
    },
    [EventType.WORKSPACE_BRANCH_ARCHIVED]: {
      [AppLocale.en]: 'Workspace branch archived',
      [AppLocale.vi]: 'Chi nhánh workspace đã xoá',
    },
    [EventType.LOANS_CHANGE_WORKSPACE_BRANCH]: {
      [AppLocale.vi]: 'Thay đổi chi nhánh hồ sơ vay',
      [AppLocale.en]: 'Change loan workspace branch',
    },
    [EventType.RECEIPT_CHANGE_WORKSPACE_BRANCH]: {
      [AppLocale.vi]: 'Thay đổi chi nhánh hoá đơn',
      [AppLocale.en]: 'Change receipt workspace branch',
    },
    [EventType.WORKSPACE_API_APP_CREATED]: {
      [AppLocale.en]: 'API App created',
      [AppLocale.vi]: 'Tạo App APIs',
    },
    [EventType.WORKSPACE_API_APP_UPDATED]: {
      [AppLocale.en]: 'API App updated',
      [AppLocale.vi]: 'Cập nhật App APIs',
    },
    [EventType.WORKSPACE_API_APP_ARCHIVED]: {
      [AppLocale.en]: 'API App archived',
      [AppLocale.vi]: 'Xoá App APIs',
    },
    [EventType.REPORT_METRICS_SYNCED]: {
      [AppLocale.en]: 'Report realtime synced',
      [AppLocale.vi]: 'Báo cáo đã được đồng bộ',
    },
    [EventType.CUSTOMER_FORM_NEW]: {
      [AppLocale.en]: 'New customer form',
      [AppLocale.vi]: 'Form khách hàng mới',
    },
    [EventType.CUSTOMER_FORM_UPDATED]: {
      [AppLocale.en]: 'Customer form updated',
      [AppLocale.vi]: 'Cập nhật form khách hàng',
    },
    [EventType.CUSTOMER_FORM_ARCHIVED]: {
      [AppLocale.en]: 'Customer form archived',
      [AppLocale.vi]: 'Xoá form khách hàng',
    },
    [EventType.TASK_SYNCED]: {
      [AppLocale.en]: 'Task synced',
      [AppLocale.vi]: 'Đồng bộ công việc',
    },
    [EventType.RECEIPT_SYNCED]: {
      [AppLocale.en]: 'Receipt synced',
      [AppLocale.vi]: 'Đồng bộ hoá đơn',
    },
    [EventType.POST_NEW]: {
      [AppLocale.en]: 'Post created',
      [AppLocale.vi]: 'Tạo bài viết',
    },
    [EventType.POST_UPDATED]: {
      [AppLocale.en]: 'Post updated',
      [AppLocale.vi]: 'Cập nhật bài viết',
    },
    [EventType.POST_ARCHIVED]: {
      [AppLocale.en]: 'Post archived',
      [AppLocale.vi]: 'Xoá bài viết',
    },
    [EventType.CATEGORY_NEW]: {
      [AppLocale.en]: 'Category created',
      [AppLocale.vi]: 'Tạo danh mục',
    },
    [EventType.CATEGORY_UPDATED]: {
      [AppLocale.en]: 'Category updated',
      [AppLocale.vi]: 'Cập nhật danh mục',
    },
    [EventType.CATEGORY_ARCHIVED]: {
      [AppLocale.en]: 'Category archived',
      [AppLocale.vi]: 'Xoá danh mục',
    },
    [EventType.PROMOTION_NEW]: {
      [AppLocale.en]: 'Promotion created',
      [AppLocale.vi]: 'Tạo khuyến mãi',
    },
    [EventType.PROMOTION_UPDATED]: {
      [AppLocale.en]: 'Promotion updated',
      [AppLocale.vi]: 'Cập nhật khuyến mãi',
    },
    [EventType.PROMOTION_ARCHIVED]: {
      [AppLocale.en]: 'Promotion archived',
      [AppLocale.vi]: 'Xoá khuyến mãi',
    },
    [EventType.LOANS_APPROVED_REVERTED]: {
      [AppLocale.en]: 'Loan approved reverted',
      [AppLocale.vi]: 'Hoàn tác duyệt hồ sơ vay',
    },
    [EventType.RECEIPT_REVERT_PAYMENT]: {
      [AppLocale.en]: 'Receipt revert payment',
      [AppLocale.vi]: 'Hoàn tác thanh toán',
    },
    [EventType.LOANS_REVERT_REJECTED]: {
      [AppLocale.en]: 'Loan rejected reverted',
      [AppLocale.vi]: 'Hoàn tác từ chối hồ sơ vay',
    },
    [EventType.WORKSPACE_MEMBER_ONLINE]: {
      [AppLocale.en]: 'Workspace member online',
      [AppLocale.vi]: 'Thành viên online',
    },
    [EventType.WORKSPACE_MEMBER_OFFLINE]: {
      [AppLocale.en]: 'Workspace member offline',
      [AppLocale.vi]: 'Thành viên offline',
    },
    [EventType.USER_ONLINE]: {
      [AppLocale.en]: 'User online',
      [AppLocale.vi]: 'Người dùng online',
    },
    [EventType.USER_OFFLINE]: {
      [AppLocale.en]: 'User offline',
      [AppLocale.vi]: 'Người dùng offline',
    },
    [EventType.LOANS_FULFILLED_REVERTED]: {
      [AppLocale.en]: 'Loan fulfilled reverted',
      [AppLocale.vi]: 'Hoàn tác giải ngân hồ sơ vay',
    },
    [EventType.WORKSPACE_STATS_UPDATED]: {
      [AppLocale.en]: 'Workspace stats updated',
      [AppLocale.vi]: 'Cập nhật thống kê workspace',
    },
    [EventType.E_INVOICE_CREATED]: {
      [AppLocale.en]: 'E-invoice created',
      [AppLocale.vi]: 'Hoá đơn điện tử được tạo',
    },
    [EventType.E_INVOICE_REMOVED]: {
      [AppLocale.en]: 'E-invoice removed',
      [AppLocale.vi]: 'Hoá đơn điện tử đã bị xoá',
    },
    [EventType.TAGS_UPDATED]: {
      [AppLocale.en]: 'Tags updated',
      [AppLocale.vi]: 'Cập nhật tags',
    },
    [EventType.TAG_NEW]: {
      [AppLocale.en]: 'Tag created',
      [AppLocale.vi]: 'Tạo tag',
    },
    [EventType.TASK_METRIC_SYNCED]: {
      [AppLocale.en]: 'Task metric synced',
      [AppLocale.vi]: 'Đồng bộ thống kê công việc',
    },
    [EventType.ACTIVITY_NEW]: {
      [AppLocale.en]: 'Activity created',
      [AppLocale.vi]: 'Hoạt động mới',
    },
    [EventType.ACTIVITY_UPDATED]: {
      [AppLocale.en]: 'Activity updated',
      [AppLocale.vi]: 'Cập nhật hoạt động',
    },
    [EventType.ACTIVITY_ARCHIVED]: {
      [AppLocale.en]: 'Activity archived',
      [AppLocale.vi]: 'Xoá hoạt động',
    },
    [EventType.REACTION_ADDED]: {
      [AppLocale.en]: 'Reaction added',
      [AppLocale.vi]: 'Thêm phản hồi',
    },
    [EventType.REACTION_REMOVED]: {
      [AppLocale.en]: 'Reaction removed',
      [AppLocale.vi]: 'Xoá phản hồi',
    },
    [EventType.ACTIVITY_SYNCED]: {
      [AppLocale.en]: 'Activity synced',
      [AppLocale.vi]: 'Hoạt động đã được đồng bộ',
    },
    [EventType.WORKSPACE_MEMBER_SYNCED]: {
      [AppLocale.en]: 'Workspace member synced',
      [AppLocale.vi]: 'Thành viên đã được đồng bộ',
    },
    [EventType.WORKSPACE_MEMBER_ASSIGN_ROLES]: {
      [AppLocale.en]: 'Assign roles to member',
      [AppLocale.vi]: 'Cập nhật vai trò thành viên',
    },
    [EventType.ATTENDANCE_RECORD_NEW]: {
      [AppLocale.en]: 'Attendance record created',
      [AppLocale.vi]: 'Bản ghi chấm công đã được tạo',
    },
    [EventType.ATTENDANCE_RECORD_APPROVED]: {
      [AppLocale.en]: 'Attendance record approved',
      [AppLocale.vi]: 'Bản ghi chấm công đã được duyệt',
    },
    [EventType.ATTENDANCE_RECORD_REJECTED]: {
      [AppLocale.en]: 'Attendance record rejected',
      [AppLocale.vi]: 'Bản ghi chấm công đã bị từ chối',
    },
    [EventType.ATTENDANCE_SETTING_UPDATED]: {
      [AppLocale.en]: 'Attendance setting updated',
      [AppLocale.vi]: 'Cập nhật cài đặt chấm công',
    },
    [EventType.FILE_EXPORT_NEW]: {
      [AppLocale.en]: 'File export created',
      [AppLocale.vi]: 'Yêu cầu xuất file đã được tạo',
    },
    [EventType.FILE_EXPORT_FINISHED]: {
      [AppLocale.en]: 'File export finished',
      [AppLocale.vi]: 'Xuất file hoàn thành',
    },
    [EventType.FILE_EXPORT_FAILED]: {
      [AppLocale.en]: 'File export failed',
      [AppLocale.vi]: 'Xuất file thất bại',
    },
  },
};
