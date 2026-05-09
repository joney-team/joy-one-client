import { AppMessage } from '../../app.message';
import { AppLocale, Dictionary } from '../lang.types';

export const appMessageDictionary: Dictionary<AppMessage> = {
  dictionary: {
    [AppMessage.FILE_MUST_BE_PROVIDED]: {
      [AppLocale.vi]: 'Tệp không được để trống',
      [AppLocale.en]: 'File must be provided',
    },
    [AppMessage.CUSTOMER_KYC_WAS_APPROVED]: {
      [AppLocale.vi]: 'Thông tin KYC của khách hàng đã được duyệt',
      [AppLocale.en]: 'Customer KYC was approved',
    },
    [AppMessage.INVALID_LOAN_STATUS]: {
      [AppLocale.vi]: 'Trạng thái khoản vay không hợp lệ',
      [AppLocale.en]: 'Invalid loan status',
    },
    [AppMessage.CUSTOMER_KYC_MUST_BE_PROVIDED]: {
      [AppLocale.vi]: 'Thông tin KYC cần được cung cấp',
      [AppLocale.en]: 'Customer KYC must be provided',
    },
    [AppMessage.LOAN_CANNOT_BE_UPDATED]: {
      [AppLocale.vi]: 'Không thể cập nhật khoản vay',
      [AppLocale.en]: 'Loan cannot be updated',
    },
    [AppMessage.SLUG_EXISTED]: {
      [AppLocale.vi]: 'Slug đã tồn tại',
      [AppLocale.en]: 'Slug existed',
    },
    [AppMessage.INVALID_LOAN_AMOUNT]: {
      [AppLocale.vi]: 'Số tiền không hợp lệ',
      [AppLocale.en]: 'Invalid loan amount',
    },
    [AppMessage.CUSTOMER_KYC_MUST_BE_APPROVED]: {
      [AppLocale.vi]: 'Thông tin KYC của khách hàng phải được duyệt',
      [AppLocale.en]: 'Customer KYC must be approved',
    },
    [AppMessage.CUSTOMER_KYC_WAS_REGISTERED]: {
      [AppLocale.vi]: 'Thông tin KYC của khách hàng đã được đăng ký',
      [AppLocale.en]: 'Customer KYC was registered',
    },
    [AppMessage.INVALID_DATE_RANGE]: {
      [AppLocale.vi]: 'Khoảng thời gian không hợp lệ',
      [AppLocale.en]: 'Invalid date range',
    },
    [AppMessage.SDK_KEY_REQUIRED]: {
      [AppLocale.vi]: 'SDK key không được để trống',
      [AppLocale.en]: 'SDK key required',
    },
    [AppMessage.INVALID_SDK_KEY]: {
      [AppLocale.vi]: 'SDK key không hợp lệ',
      [AppLocale.en]: 'Invalid SDK key',
    },
    [AppMessage.BOOKING_TIME_NOT_IN_WORK_SLOTS]: {
      [AppLocale.vi]: 'Thời gian đặt hẹn không nằm trong khung giờ làm việc',
      [AppLocale.en]: 'Booking time not in work slots',
    },
    [AppMessage.PLUGIN_ZALO_OA_SENT_ZNS_FAILED]: {
      [AppLocale.vi]: 'Gửi ZNS không thành công',
      [AppLocale.en]: 'Send ZNS failed',
    },
    [AppMessage.STOCK_OUT_FAILED]: {
      [AppLocale.vi]: 'Xuất hàng không thành công',
      [AppLocale.en]: 'Stock out failed',
    },
    [AppMessage.PRODUCT_NAME_OUT_OF_STOCK]: {
      [AppLocale.vi]:
        'Sản phẩm <strong>{productName}</strong> đã hết hoặc không đủ hàng',
      [AppLocale.en]: 'Product <strong>{productName}</strong> is out of stock',
    },
    [AppMessage.PRODUCT_NOT_IN_ENOUGH_STOCK]: {
      [AppLocale.vi]: 'Sản phẩm {productName} không đủ hàng',
      [AppLocale.en]: 'Product {productName} is not in enough stock',
    },
    [AppMessage.INVALID_ITEM_PRODUCT_PRICE]: {
      [AppLocale.vi]: 'Giá sản phẩm {productName} không hợp lệ',
      [AppLocale.en]: 'Product {productName} price invalid',
    },
    [AppMessage.PRODUCT_SUPPLY_INVALID_HISTORY]: {
      [AppLocale.vi]: 'Lịch sử nhập/xuất sản phẩm không hợp lệ',
      [AppLocale.en]: 'Product supply invalid history',
    },
    [AppMessage.WORKSPACE_STORAGE_REACHED_LIMIT]: {
      [AppLocale.vi]: 'Dung lượng lưu trữ workspace đã đạt giới hạn',
      [AppLocale.en]: 'Workspace storage reached limit',
    },
    [AppMessage.WORKSPACE_SOCIAL_CONNECTIONS_REACHED_LIMIT]: {
      [AppLocale.vi]: 'Số lượng kết nối mạng xã hội workspace đã đạt giới hạn',
      [AppLocale.en]: 'Workspace social connections reached limit',
    },
    [AppMessage.WORKSPACE_MEMBERS_REACHED_LIMIT]: {
      [AppLocale.vi]: 'Số lượng thành viên workspace đã đạt giới hạn',
      [AppLocale.en]: 'Workspace members reached limit',
    },
    [AppMessage.WORKSPACE_SUBSCRIPTION_REACHED_LIMIT]: {
      [AppLocale.vi]:
        'Gói dịch vụ đã đạt giới hạn vui lòng nâng cấp gói dịch vụ để sử dung tiếp',
      [AppLocale.en]:
        'Workspace subscription reached limit, please upgrade your subscription to continue using',
    },
    [AppMessage.INVALID_STATUS]: {
      [AppLocale.vi]: 'Trạng thái không hợp lệ',
      [AppLocale.en]: 'Invalid status',
    },
    [AppMessage.DATA_NOT_FOUND]: {
      [AppLocale.vi]: 'Dữ liệu không tồn tại',
      [AppLocale.en]: 'Data not found',
    },
    [AppMessage.PAYMENT_GATEWAY_NOT_SUPPORT]: {
      [AppLocale.vi]: 'Cổng thanh toán chưa được hỗ trợ',
      [AppLocale.en]: 'Payment gateway not support yet',
    },
    [AppMessage.DATA_CANNOT_BY_CREATED_YET]: {
      [AppLocale.vi]:
        'Dữ liệu chưa thể tạo được trong lúc này, vui lòng thữ lại sau ít phút.',
      [AppLocale.en]: 'Data cannot by created yet, please try again later.',
    },
    [AppMessage.WORKSPACE_SUBSCRIPTION_ACTIVATED]: {
      [AppLocale.vi]: 'Gói dịch vụ đã được kích hoạt',
      [AppLocale.en]: 'Workspace subscription activated',
    },
    [AppMessage.WORKSPACE_SUBSCRIPTION_OVER_LIMIT_MEMBERS]: {
      [AppLocale.vi]:
        'Workspace của bạn đã vượt quá số lượng giới hạn thành viên của gói này, bạn vui lòng xoá bớt thành viên hoặc dùng gói cao hơn.',
      [AppLocale.en]:
        'Your workspace has exceeded the number of members limit of this package, please remove some members or use a higher package.',
    },
    [AppMessage.WORKSPACE_SUBSCRIPTION_CANNOT_CHANGED]: {
      [AppLocale.vi]:
        'Gói dịch vụ của bạn không thể thay đổi, bạn vui lòng liên hệ đội ngũ hỗ trợ.',
      [AppLocale.en]:
        'Your subscription cannot be changed, please contact our support team.',
    },
    [AppMessage.WORKSPACE_SUBSCRIPTION_CANNOT_SELECT]: {
      [AppLocale.vi]:
        'Gói dịch vụ không thể chọn, bạn vui lòng liên hệ đội ngũ hỗ trợ.',
      [AppLocale.en]:
        'Your subscription cannot be selected, please contact our support team.',
    },
    [AppMessage.INTERNAL_SERVER_ERROR]: {
      [AppLocale.vi]: 'Lỗi hệ thống',
      [AppLocale.en]: 'Internal server error',
    },
    [AppMessage.ACCESS_DENIED]: {
      [AppLocale.vi]: 'Quyền truy cập bị từ chối',
      [AppLocale.en]: 'Access denied',
    },
    [AppMessage.USER_DOES_NOT_EIXSTED]: {
      [AppLocale.vi]: 'Thông tin người dùng không tồn tại',
      [AppLocale.en]: 'User does not existed',
    },
    [AppMessage.PASSWORD_NOT_BE_PROVIDED]: {
      [AppLocale.vi]: 'Mật khẩu không được để trống',
      [AppLocale.en]: 'Password not be provided',
    },
    [AppMessage.INVALID_ID]: {
      [AppLocale.vi]: 'ID không hợp lệ',
      [AppLocale.en]: 'Invalid ID',
    },
    [AppMessage.INVALID_TOKEN]: {
      [AppLocale.vi]: 'Token không hợp lệ',
      [AppLocale.en]: 'Invalid token',
    },
    [AppMessage.TOKEN_MUST_BE_PROVIDED]: {
      [AppLocale.vi]: 'Token không được để trống',
      [AppLocale.en]: 'Token must be provided',
    },
    [AppMessage.SESSION_EXPIRED]: {
      [AppLocale.vi]: 'Phiên làm việc đã hết hạn, vui lòng đăng nhập lại',
      [AppLocale.en]: 'Session expired, please login again',
    },
    [AppMessage.INVALID_SESSION]: {
      [AppLocale.vi]: 'Phiên làm việc không hợp lệ',
      [AppLocale.en]: 'Invalid session',
    },
    [AppMessage.INVALID_SIGNATURE]: {
      [AppLocale.vi]: 'Chữ ký không hợp lệ',
      [AppLocale.en]: 'Invalid signature',
    },
    [AppMessage.WORKSPACE_NAME_EXISTED]: {
      [AppLocale.vi]: 'Tên không được trùng',
      [AppLocale.en]: 'Workspace name existed',
    },
    [AppMessage.NOT_BEEN_GRANTED_ACCESS_WITHIN_WORKSPACE]: {
      [AppLocale.vi]: 'Chưa được cấp quyền truy cập trong workspace',
      [AppLocale.en]: 'Not been granted access within workspace',
    },
    [AppMessage.WORKSPACE_ID_REQUIRED]: {
      [AppLocale.vi]: 'ID workspace không được để trống',
      [AppLocale.en]: 'Workspace ID required',
    },
    [AppMessage.MEMBER_WAS_NOT_ASSIGNED]: {
      [AppLocale.vi]: 'Thành viên chưa được phân quyền',
      [AppLocale.en]: 'Member was not assigned',
    },
    [AppMessage.CUSTOMER_PHONE_ALREADY_EXISTS]: {
      [AppLocale.vi]: 'Số điện thoại của khách hàng đã tồn tại',
      [AppLocale.en]: 'Customer phone already exists',
    },
    [AppMessage.CUSTOMER_EMAIL_ALREADY_EXISTS]: {
      [AppLocale.vi]: 'Email của khách hàng đã tồn tại',
      [AppLocale.en]: 'Customer email already exists',
    },
    [AppMessage.CANNOT_REMOVE_WORKSPACE_OWNER]: {
      [AppLocale.vi]: 'Không thể xóa chủ sở hữu workspace',
      [AppLocale.en]: 'Cannot remove workspace owner',
    },
    [AppMessage.WORKSPACE_CODE_EXISTED]: {
      [AppLocale.vi]: 'Mã không được trùng',
      [AppLocale.en]: 'Workspace code existed',
    },
    [AppMessage.DEVICE_NOT_FOUND]: {
      [AppLocale.vi]: 'Thông tin thiết bị không tồn tại',
      [AppLocale.en]: 'Device not found',
    },
    [AppMessage.DEVICE_NOT_REGISTERED]: {
      [AppLocale.vi]: 'Thiết bị chưa được đăng ký',
      [AppLocale.en]: 'Device not registered',
    },
    [AppMessage.INVALID_DEVICE]: {
      [AppLocale.vi]: 'Thiết bị không hợp lệ',
      [AppLocale.en]: 'Invalid device',
    },
    [AppMessage.WORKSPACE_NOT_FOUND]: {
      [AppLocale.vi]: 'Không tìm thấy thông tin Workspace',
      [AppLocale.en]: 'Workspace information not found',
    },
    [AppMessage.INVALID_SUPPLY_AMOUNT]: {
      [AppLocale.vi]: 'Số lượng không hợp lệ',
      [AppLocale.en]: 'Invalid supply amount',
    },
    [AppMessage.EMAIL_WAS_EXISTED]: {
      [AppLocale.vi]: 'Email đã tồn tại',
      [AppLocale.en]: 'Email was existed',
    },
    [AppMessage.INVALID_WORKSPACE_TYPE]: {
      [AppLocale.vi]: 'Loại hình doanh nghiệp không hợp lệ',
      [AppLocale.en]: 'Invalid workspace type',
    },
    [AppMessage.INVALID_CODE]: {
      [AppLocale.vi]: 'Mã không hợp lệ',
      [AppLocale.en]: 'Invalid code',
    },
    [AppMessage.BOOKING_NOT_FOUND]: {
      [AppLocale.vi]: 'Booking không tồn tại',
      [AppLocale.en]: 'Booking not found',
    },
    [AppMessage.COMMENT_NOT_FOUND]: {
      [AppLocale.vi]: 'Bình luận không tồn tại',
      [AppLocale.en]: 'Comment not found',
    },
    [AppMessage.CUSTOMER_NOT_FOUND]: {
      [AppLocale.vi]: 'Khách hàng không tồn tại',
      [AppLocale.en]: 'Customer not found',
    },
    [AppMessage.EVENT_NOT_FOUND]: {
      [AppLocale.vi]: 'Sự kiện không tồn tại',
      [AppLocale.en]: 'Event not found',
    },
    [AppMessage.FILE_NOT_FOUND]: {
      [AppLocale.vi]: 'Tập tin không tồn tại',
      [AppLocale.en]: 'File not found',
    },
    [AppMessage.NOTIFICATION_NOT_FOUND]: {
      [AppLocale.vi]: 'Thông báo không tồn tại',
      [AppLocale.en]: 'Notification not found',
    },
    [AppMessage.PRODUCT_SUPPLY_NOT_FOUND]: {
      [AppLocale.vi]: 'Lịch sử nhập/xuất sản phẩm không tồn tại',
      [AppLocale.en]: 'Product supply not found',
    },
    [AppMessage.PRODUCT_NOT_FOUND]: {
      [AppLocale.vi]: 'Sản phẩm không tồn tại',
      [AppLocale.en]: 'Product not found',
    },
    [AppMessage.TAG_NOT_FOUND]: {
      [AppLocale.vi]: 'Tag không tồn tại',
      [AppLocale.en]: 'Tag not found',
    },
    [AppMessage.TICKET_NOT_FOUND]: {
      [AppLocale.vi]: 'Ticket không tồn tại',
      [AppLocale.en]: 'Ticket not found',
    },
    [AppMessage.USER_NOT_FOUND]: {
      [AppLocale.vi]: 'Người dùng không tồn tại',
      [AppLocale.en]: 'User not found',
    },
    [AppMessage.INVALID_PRODUCT_SUPPLY_EXPIRE_AT]: {
      [AppLocale.vi]: 'Ngày hết hạn không hợp lệ',
      [AppLocale.en]: 'Invalid product supply expire at',
    },
    [AppMessage.ONLY_ARCHIVE_IN_DAY]: {
      [AppLocale.vi]: 'Chỉ được phép xoá dữ liệu này trong ngày',
      [AppLocale.en]: 'Only archive in day',
    },
    [AppMessage.TICKET_ARCHIVED]: {
      [AppLocale.vi]: 'Ticket đã được xoá',
      [AppLocale.en]: 'Ticket archived',
    },
    [AppMessage.INVALID_PRICE_RANGE]: {
      [AppLocale.vi]: 'Khoảng giá không hợp lệ',
      [AppLocale.en]: 'Invalid price range',
    },
    [AppMessage.WORKSPACE_PARTNER_NOT_FOUND]: {
      [AppLocale.vi]: 'Đối tác không tồn tại',
      [AppLocale.en]: 'Workspace partner not found',
    },
    [AppMessage.TASK_NOT_FOUND]: {
      [AppLocale.vi]: 'Công việc không tồn tại',
      [AppLocale.en]: 'Task not found',
    },
    [AppMessage.INVALID_PAYLOAD]: {
      [AppLocale.vi]: 'Dữ liệu không hợp lệ',
      [AppLocale.en]: 'Invalid payload',
    },
    [AppMessage.WORKSPACE_MEMBER_INVITATION_EXPIRED]: {
      [AppLocale.vi]: 'Thư mời đã hết hạn',
      [AppLocale.en]: 'Workspace member invitation expired',
    },
    [AppMessage.INVALID_WORKSPACE_MEMBER_INVITATION]: {
      [AppLocale.vi]: 'Thư mời không hợp lệ',
      [AppLocale.en]: 'Invalid workspace member invitation',
    },
    [AppMessage.RECEIPT_NOT_FOUND]: {
      [AppLocale.vi]: 'Hoá đơn không tồn tại',
      [AppLocale.en]: 'Receipt not found',
    },
    [AppMessage.RECEIPT_ALREADY_PAID]: {
      [AppLocale.vi]: 'Hoá đơn đã được thanh toán',
      [AppLocale.en]: 'Receipt already paid',
    },
    [AppMessage.INVALID_DISCOUNT_AMOUNT]: {
      [AppLocale.vi]: 'Không thể giảm giá nhiều hơn tổng giá trị đơn hàng',
      [AppLocale.en]: 'Invalid discount amount',
    },
    [AppMessage.INVALID_USER_AUTH_SESSION]: {
      [AppLocale.vi]: 'Mã xác thực đã hết hạn hoặc không hợp lệ',
      [AppLocale.en]: 'Invalid user auth session',
    },
    [AppMessage.INVALID_SIGN_IN_PAYLOAD]: {
      [AppLocale.vi]: 'Thông tin đăng nhập không hợp lệ',
      [AppLocale.en]: 'Invalid sign in payload',
    },
    [AppMessage.EMAIL_OR_PASSWORD_INCORRECT]: {
      [AppLocale.vi]: 'Email hoặc mật khẩu không chính xác',
      [AppLocale.en]: 'Email or password incorrect',
    },
    [AppMessage.PRODUCT_SUPPLY_RECORD_NOT_FOUND]: {
      [AppLocale.vi]: 'Lịch sử kiểm hàng không tồn tại',
      [AppLocale.en]: 'Product supply record not found',
    },
    [AppMessage.PRODUCT_SUPPLY_RECORD_ARCHIVED]: {
      [AppLocale.vi]: 'Lịch sử kiểm hàng đã được xoá',
      [AppLocale.en]: 'Product supply record archived',
    },
    [AppMessage.TASK_ARCHIVED]: {
      [AppLocale.vi]: 'Công việc đã được xoá',
      [AppLocale.en]: 'Task archived',
    },
    [AppMessage.PRODUCT_OUT_OF_STOCK]: {
      [AppLocale.vi]: 'Sản phẩm đã hết hoặc không đủ hàng.',
      [AppLocale.en]: 'Product out of stock or insufficient stock.',
    },
    [AppMessage.WORKSPACE_MEMBER_JOINED]: {
      [AppLocale.vi]: 'Thành viên đã tham gia workspace',
      [AppLocale.en]: 'Workspace member joined',
    },
    [AppMessage.WORKSPACE_MEMBER_NOT_FOUND]: {
      [AppLocale.vi]: 'Thành viên không tồn tại',
      [AppLocale.en]: 'Workspace member not found',
    },
    [AppMessage.WORKSPACE_MEMBER_INVALID_ROLE]: {
      [AppLocale.vi]: 'Vai trò không hợp lệ',
      [AppLocale.en]: 'Workspace member invalid role',
    },
    [AppMessage.NOT_ALLOW_TO_ACCESS_RESOURCE]: {
      [AppLocale.vi]: 'Bạn chưa được cấp phép xem dữ liệu này',
      [AppLocale.en]: 'Not allow to access resource',
    },
    [AppMessage.INVALID_PHONE_NUMBER]: {
      [AppLocale.vi]: 'Số điện thoại không hợp lệ',
      [AppLocale.en]: 'Invalid phone number',
    },
    [AppMessage.HRM_TIMEKEEPING_NOT_FOUND]: {
      [AppLocale.vi]: 'Bản ghi chấm công không tồn tại',
      [AppLocale.en]: 'HRM timekeeping not found',
    },
    [AppMessage.HRM_TIMEKEEPING_NOT_PENDING]: {
      [AppLocale.vi]: 'Bản ghi chấm công không ở trạng thái chờ duyệt',
      [AppLocale.en]: 'HRM timekeeping not pending',
    },
    [AppMessage.WORKSPACE_MEMBER_NOT_OWNER]: {
      [AppLocale.vi]: 'Thành viên không phải chủ sở hữu',
      [AppLocale.en]: 'Workspace member not owner',
    },
    [AppMessage.HRM_TIMEKEEPING_NOT_READY]: {
      [AppLocale.vi]: 'Chức năng chấm công chưa được thiết lập',
      [AppLocale.en]: 'HRM timekeeping not ready',
    },
    [AppMessage.HRM_TIMEKEEPING_INVALID_LOCATION]: {
      [AppLocale.vi]: 'Vị trí không hợp lệ',
      [AppLocale.en]: 'HRM timekeeping invalid location',
    },
    [AppMessage.WORKSPACE_ROLE_NOT_FOUND]: {
      [AppLocale.vi]: 'Vai trò không tồn tại',
      [AppLocale.en]: 'Workspace role not found',
    },
    [AppMessage.INVALID_PERMISSIONS]: {
      [AppLocale.vi]: 'Quyền không hợp lệ',
      [AppLocale.en]: 'Invalid permissions',
    },
    [AppMessage.RECEIPT_ALREADY_DISBURSEMENT]: {
      [AppLocale.vi]: 'Hoá đơn đã được giải ngân',
      [AppLocale.en]: 'Receipt already disbursement',
    },
    [AppMessage.PRODUCT_CATEGORY_NOT_FOUND]: {
      [AppLocale.vi]: 'Danh mục sản phẩm / dịch vụ không tồn tại',
      [AppLocale.en]: 'Product category not found',
    },
    [AppMessage.TICKET_EMPTY_ITEMS]: {
      [AppLocale.vi]: 'Danh sách sản phẩm / dịch vụ không được để trống',
      [AppLocale.en]: 'Ticket empty items',
    },
    [AppMessage.TICKET_HAS_PAID]: {
      [AppLocale.vi]: 'Ticket đã được thanh toán',
      [AppLocale.en]: 'Ticket has paid',
    },
    [AppMessage.TICKET_ONLY_CAN_UPDATE_IN_DAY]: {
      [AppLocale.vi]: 'Thông tin Ticket chỉ được cập nhật trong ngày',
      [AppLocale.en]: 'Ticket only can update in day',
    },
    [AppMessage.PLUGIN_ZALO_OA_ERROR_117]: {
      [AppLocale.vi]:
        'OA hoặc ứng dụng gửi ZNS chưa được cấp quyền sử dụng mẫu ZNS này',
      [AppLocale.en]:
        'OA or ZNS sending application has not been granted permission to use this ZNS template',
    },
    [AppMessage.PLUGIN_ZALO_OA_ERROR_115]: {
      [AppLocale.vi]: 'Tài khoản ZNS không đủ số dư',
      [AppLocale.en]: 'ZNS account has insufficient balance',
    },
    [AppMessage.PLUGIN_ZALO_OA_ERROR_216]: {
      [AppLocale.vi]: 'Token đã hết hạn',
      [AppLocale.en]: 'Token has expired',
    },
    [AppMessage.PLUGIN_ZALO_OA_CONNECT_FAILED]: {
      [AppLocale.vi]: 'Kết nối với Zalo OA không thành công',
      [AppLocale.en]: 'Connection to Zalo OA failed',
    },
    [AppMessage.PLUGIN_META_PAGE_CONNECT_FAILED]: {
      [AppLocale.vi]: 'Kết nối với Fanpage không thành công',
      [AppLocale.en]: 'Connection to Fanpage failed',
    },
    [AppMessage.USER_REF_CODE_EXISTED]: {
      [AppLocale.vi]: 'Mã giới thiệu đã tồn tại',
      [AppLocale.en]: 'User ref code existed',
    },
    [AppMessage.WORKSPACE_BILLING_NOT_FOUND]: {
      [AppLocale.vi]: 'Hoá đơn không tồn tại',
      [AppLocale.en]: 'Workspace billing not found',
    },
    [AppMessage.WORKSPACE_BILLING_BALANCE_NOT_ENOUGH]: {
      [AppLocale.vi]: 'Số dư không đủ để thực hiện giao dịch',
      [AppLocale.en]: 'Workspace billing balance not enough',
    },
    [AppMessage.SUBSCRIPTION_NOT_FOUND]: {
      [AppLocale.vi]: 'Gói dịch vụ không tồn tại',
      [AppLocale.en]: 'Subscription not found',
    },
    [AppMessage.TABLE_SLOT_NOTFOUND]: {
      [AppLocale.vi]: 'Bàn không tồn tại',
      [AppLocale.en]: 'Table slot not found',
    },
    [AppMessage.PASSWORD_TOO_SHORT]: {
      [AppLocale.vi]: 'Mật khẩu phải có ít nhất 6 ký tự',
      [AppLocale.en]: 'Password must be at least 6 characters',
    },
    [AppMessage.PASSWORD_INCORRECT]: {
      [AppLocale.vi]: 'Mật khẩu không chính xác',
      [AppLocale.en]: 'Password incorrect',
    },
    [AppMessage.CODE_WAS_EXISTED]: {
      [AppLocale.vi]: 'Mã đã tồn tại',
      [AppLocale.en]: 'Code was existed',
    },
    [AppMessage.COUPON_IS_OUT_OF_STOCK]: {
      [AppLocale.vi]: 'Mã giảm giá đã hết',
      [AppLocale.en]: 'Coupon is out of stock',
    },
    [AppMessage.LOAN_PACKAGE_NOT_FOUND]: {
      [AppLocale.vi]: 'Gói vay không tồn tại',
      [AppLocale.en]: 'Loan package not found',
    },
    [AppMessage.LOAN_PACKAGE_INVALID_DAYS_PER_PERIOD]: {
      [AppLocale.vi]: 'Kỳ vay không hợp lệ',
      [AppLocale.en]: 'Loan package invalid days per period',
    },
    [AppMessage.RECEIPT_REF_ALREADY_EXISTS]: {
      [AppLocale.vi]: 'Hoá đơn đã tồn tại',
      [AppLocale.en]: 'Receipt ref already exists',
    },
    [AppMessage.RECEIPT_NOT_PAID_YET]: {
      [AppLocale.vi]: 'Hoá đơn chưa được thanh toán',
      [AppLocale.en]: 'Receipt not paid yet',
    },
    [AppMessage.INVALID_LOAN_PACKAGE]: {
      [AppLocale.vi]: 'Gói vay không hợp lệ',
      [AppLocale.en]: 'Invalid loan package',
    },
    [AppMessage.TICKET_NEED_CUSTOMER_INFORMATION]: {
      [AppLocale.vi]: 'Cần bổ sung thông tin khách hàng ',
      [AppLocale.en]: 'Need customer information',
    },
    VOUCHER_NOT_FOUND: {
      [AppLocale.vi]: 'Voucher không tồn tại',
      [AppLocale.en]: 'Voucher not found',
    },
    PLUGIN_ZALO_OA_UNKNOW_ERROR: {
      [AppLocale.vi]: 'Lỗi không xác định từ Zalo OA',
      [AppLocale.en]: 'Unknow error from Zalo OA',
    },
    INVALID_AMOUNT: {
      [AppLocale.vi]: 'Số tiền không hợp lệ',
      [AppLocale.en]: 'Invalid amount',
    },
    ONLY_OWNER_CAN_ARCHIVE_WORKSPACE: {
      [AppLocale.vi]: 'Chỉ chủ sở hữu mới có thể xoá workspace',
      [AppLocale.en]: 'Only owner can archive workspace',
    },
    LOAN_WAS_LIQUIDATED: {
      [AppLocale.vi]: 'Khoản vay đã được thanh lý',
      [AppLocale.en]: 'Loan was liquidated',
    },
    HAVE_NOT_CLOSED_CHILD_TASKS: {
      [AppLocale.vi]: 'Công việc con chưa hoàn thành',
      [AppLocale.en]: 'Have not closed child tasks',
    },
    LOAN_NOT_LIQUIDATED_YET: {
      [AppLocale.vi]: 'Khoản vay chưa được thanh lý',
      [AppLocale.en]: 'Loan not liquidated yet',
    },
    FAIL_TO_REVERT_LIQUIDATE_LOAN: {
      [AppLocale.vi]: 'Không thể hủy thanh lý khoản vay',
      [AppLocale.en]: 'Fail to revert liquidate loan',
    },
    CUSTOMER_HAS_PENDING_RECEIPTS: {
      [AppLocale.vi]: 'Khách hàng có hoá đơn chưa thanh toán',
      [AppLocale.en]: 'Customer has pending receipts',
    },
    SEARCH_ENTITY_NOT_FOUND: {
      [AppLocale.vi]: 'Không tìm thấy dữ liệu',
      [AppLocale.en]: 'Data not found',
    },
    LOCALE_NOT_FOUND: {
      [AppLocale.vi]: 'Ngôn ngữ không tồn tại',
      [AppLocale.en]: 'Locale not found',
    },
    PASSWORD_DOES_NOT_PROVIDED: {
      [AppLocale.vi]:
        'Mật khẩu chưa được cung cấp, vui lòng đăng nhập bằng Google',
      [AppLocale.en]: 'Password does not provided, please sign in with Google',
    },
    UNABLE_TO_VERIFY_YOUR_INFORMATION: {
      [AppLocale.vi]: 'Không thể xác thực thông tin của bạn',
      [AppLocale.en]: 'Unable to verify your information',
    },
    IMAGE_NOT_AVAILABLE: {
      [AppLocale.vi]: 'Hình ảnh không khả dụng',
      [AppLocale.en]: 'Image not available',
    },
    MESSAGE_BOX_INTEGRATION_NOT_FOUND: {
      [AppLocale.vi]: 'Không tìm thấy tích hợp',
      [AppLocale.en]: 'Integration not found',
    },
    PLUGIN_ZALO_UNAVAILABLE: {
      [AppLocale.vi]: 'Zalo không khả dụng',
      [AppLocale.en]: 'Zalo is unavailable',
    },
    ORDER_EMPTY_ITEMS: {
      [AppLocale.vi]: 'Danh sách sản phẩm / dịch vụ không được để trống',
      [AppLocale.en]: 'Order empty items',
    },
    ORDER_NEED_CUSTOMER_INFORMATION: {
      [AppLocale.vi]: 'Cần bổ sung thông tin khách hàng',
      [AppLocale.en]: 'Need customer information',
    },
    PRODUCT_COMBO_NOT_AVAILABLE: {
      [AppLocale.vi]: 'Combo không khả dụng',
      [AppLocale.en]: 'Combo not available',
    },
    INVALID_QUANTITY: {
      [AppLocale.vi]: 'Số lượng không hợp lệ',
      [AppLocale.en]: 'Invalid quantity',
    },
    PRODUCT_STOCK_NOT_FOUND: {
      [AppLocale.vi]: 'Hàng hoá không tồn tại',
      [AppLocale.en]: 'Product stock not found',
    },
    PRODUCT_STOCK_RECORD_NOT_FOUND: {
      [AppLocale.vi]: 'Bản ghi kho hàng không tồn tại',
      [AppLocale.en]: 'Product stock record not found',
    },
    NO_DATA_TO_EXPORT: {
      [AppLocale.vi]: 'Không có dữ liệu để xuất',
      [AppLocale.en]: 'No data to export',
    },
    PRODUCT_COMBO_NOT_FOUND: {
      [AppLocale.vi]: 'Combo không tồn tại',
      [AppLocale.en]: 'Combo not found',
    },
    PRODUCT_COMBO_HISTORY_NOT_FOUND: {
      [AppLocale.vi]: 'Bản ghi sử dụng combo không tồn tại',
      [AppLocale.en]: 'Product combo history not found',
    },
    PLUGIN_ZALO_OA_ERROR_118: {
      [AppLocale.vi]: 'Tài khoản Zalo không tồn tại',
      [AppLocale.en]: 'Zalo account not found',
    },
    [AppMessage.TOO_MANY_REQUESTS]: {
      [AppLocale.vi]: 'Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau.',
      [AppLocale.en]: 'Too many requests. Please try again later.',
    },
    [AppMessage.FILE_IS_NOT_AVAILABLE]: {
      [AppLocale.vi]: 'Tệp không khả dụng',
      [AppLocale.en]: 'File is not available',
    },
    [AppMessage.BOOKING_HAS_ENOUGH_ASSIGNEE]: {
      [AppLocale.vi]:
        'Lịch hẹn phải có ít nhất 1 người tham gia hoặc 1 khách hàng',
      [AppLocale.en]: 'Booking must have at least 1 assignee or 1 customer',
    },
    [AppMessage.START_TIME_MUST_BE_LESS_THAN_END_TIME]: {
      [AppLocale.vi]: 'Thời gian bắt đầu phải nhỏ hơn thời gian kết thúc',
      [AppLocale.en]: 'Start time must be less than end time',
    },
    [AppMessage.POST_NOT_FOUND]: {
      [AppLocale.vi]: 'Bài viết không tồn tại',
      [AppLocale.en]: 'Post not found',
    },
    [AppMessage.POST_SLUG_EXISTED]: {
      [AppLocale.vi]: 'Slug đã tồn tại',
      [AppLocale.en]: 'Post slug existed',
    },
    [AppMessage.CANNOT_GENERATE_SLUG]: {
      [AppLocale.vi]: 'Không thể tạo slug',
      [AppLocale.en]: 'Cannot generate slug',
    },
    [AppMessage.CATEGORY_SLUG_EXISTED]: {
      [AppLocale.vi]: 'Slug đã tồn tại',
      [AppLocale.en]: 'Category slug existed',
    },
    [AppMessage.MISSING_ZALO_OA_INFO]: {
      [AppLocale.vi]: 'Thông tin tài khoản Zalo OA không hợp lệ',
      [AppLocale.en]: 'Zalo OA account info is invalid',
    },
    [AppMessage.PROMOTION_NOT_AVAILABLE]: {
      [AppLocale.vi]: 'Khuyến mãi không khả dụng',
      [AppLocale.en]: 'Promotion not available',
    },
    [AppMessage.PLUGIN_ZALO_NO_DEFAULT_OA]: {
      [AppLocale.vi]: 'OA không có tài khoản mặc định',
      [AppLocale.en]: 'OA has no default account',
    },
    [AppMessage.PLUGIN_ZALO_OA_ERROR_237]: {
      [AppLocale.vi]: 'Nhóm chat GMF đã hết hạn',
      [AppLocale.en]: 'GMF group has expired',
    },
    [AppMessage.FILE_TYPE_NOT_ALLOWED]: {
      [AppLocale.vi]: 'Tệp không hợp lệ',
      [AppLocale.en]: 'File type not allowed',
    },
    [AppMessage.FILE_SIZE_LIMIT_EXCEEDED]: {
      [AppLocale.vi]: 'Kích thước tệp quá lớn',
      [AppLocale.en]: 'File size limit exceeded',
    },
    [AppMessage.AUTH_WORKSPACE_REQUIRED]: {
      [AppLocale.vi]: 'Workspace không được cấp quyền',
      [AppLocale.en]: 'Workspace is not authorized',
    },
    [AppMessage.PLUGIN_E_INVOICES_AUTH_FAILED]: {
      [AppLocale.vi]: 'Xác thực dịch vụ HDDT thất bại',
      [AppLocale.en]: 'Authentication E-invoices failed',
    },
    [AppMessage.NOT_HAVE_ANY_AVAILABLE_E_INVOICES_PROVIDER]: {
      [AppLocale.vi]: 'Không có dịch vụ HDDT khả dụng',
      [AppLocale.en]: 'No available E-invoices provider',
    },
    [AppMessage.AUTHORIZED_CODE_EXPIRED]: {
      [AppLocale.vi]: 'Mã xác thực đã hết hạn',
      [AppLocale.en]: 'Authorized code expired',
    },
    [AppMessage.UNKNOW_ERROR_WHEN_CONNECTING_TO_ZALO_OA]: {
      [AppLocale.vi]: 'Gặp lỗi không xác định khi kết nối với Zalo OA',
      [AppLocale.en]: 'Unknow error when connecting to Zalo OA',
    },
    [AppMessage.E_INVOICE_CREATE_CRITERIA_NOT_MET]: {
      [AppLocale.vi]: 'Điều kiện tạo hoá đơn không được đáp ứng',
      [AppLocale.en]: 'E-invoice create criteria not met',
    },
    [AppMessage.EXTERNAL_STORAGE_NOT_CONNECTED]: {
      [AppLocale.vi]: 'Kết nối dịch vụ lưu trữ không thành công',
      [AppLocale.en]: 'External storage not connected',
    },
    [AppMessage.ACTIVITY_NOT_FOUND]: {
      [AppLocale.vi]: 'Hoạt động không tồn tại',
      [AppLocale.en]: 'Activity not found',
    },
    [AppMessage.ENTITY_NOT_FOUND]: {
      [AppLocale.vi]: 'Entity không tồn tại',
      [AppLocale.en]: 'Entity not found',
    },
    [AppMessage.CANNOT_CREATE_NESTED_ACTIVITY]: {
      [AppLocale.vi]: 'Không thể tạo hoạt động lồng nhau',
      [AppLocale.en]: 'Cannot create nested activity',
    },
    [AppMessage.MEMBER_INFORMATION_MISSING]: {
      [AppLocale.vi]: 'Thông tin thành viên bị thiếu',
      [AppLocale.en]: 'Member information missing',
    },
    [AppMessage.INVALID_ATTENDANCE_RECORD_STATUS]: {
      [AppLocale.vi]: 'Bản ghi chấm công không ở trạng thái chờ duyệt',
      [AppLocale.en]: 'Attendance record not pending',
    },
    [AppMessage.INVALID_FILE_DNA]: {
      [AppLocale.vi]: 'DNA tệp không hợp lệ',
      [AppLocale.en]: 'File DNA is invalid',
    },
    [AppMessage.FILE_ALREADY_EXISTS]: {
      [AppLocale.vi]: 'Tệp đã tồn tại',
      [AppLocale.en]: 'File already exists',
    },
    [AppMessage.ATTENDANCE_LOCATION_OUT_OF_RANGE]: {
      [AppLocale.vi]: 'Vị trí chấm công ngoài phạm vi cho phép',
      [AppLocale.en]: 'Attendance location out of range',
    },
  },
};
