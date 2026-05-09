import { Dictionary } from '../lang.types';

export const generalDictionary: Dictionary = {
  dictionary: {
    hotline: {
      vi: 'Hotline',
      en: 'Hotline',
    },
    address: {
      vi: 'Địa chỉ',
      en: 'Address',
    },
    customer_name: {
      vi: 'Tên khách hàng',
      en: 'Customer name',
    },
    phone: {
      vi: 'SĐT',
      en: 'Phone',
    },
    note: {
      vi: 'Ghi chú',
      en: 'Note',
    },
    view_detail: {
      vi: 'Xem chi tiết',
      en: 'View detail',
    },
    view_detail_short: {
      vi: 'Xem',
      en: 'View',
    },
    renew_password_email: {
      vi: '[Xác thực tài khoản] Yêu cầu đổi mật khẩu',
      en: '[Account verification] Request to change password',
    },
    renew_password_email_body: {
      vi: 'Mã xác thực của bạn là <strong>{code}</strong>. Vui lòng không chia sẻ mã này với bất kỳ ai khác. Mã xác thực này sẽ hết hạn sau {expireTime} phút.',
      en: 'Your verification code is <strong>{code}</strong>. Please do not share this code with anyone else. This verification code will expire in {expireTime} minutes.',
    },
    regards: {
      vi: 'Trân trọng!',
      en: 'Regards!',
    },
    processing: {
      vi: 'Đang xử lí',
      en: 'Processing',
    },
    invite_workspace: {
      vi: 'Mời tham gia Workspace {name}',
      en: 'Invite to Workspace {name}',
    },
    invite_workspace_desc: {
      en: 'You have been invited to join workspace.',
      vi: 'Bạn được mời tham gia Workspace.',
    },
    loan_amount_params: {
      vi: 'Số tiền: {amount}',
      en: 'Amount: {amount}',
    },
    update_loan_asset_data: {
      vi: 'Cập nhật thông tin tài sản',
      en: 'Update asset information',
    },
    member_joined: {
      vi: '{name} đã tham gia',
      en: '{name} joined',
    },
    money_amount_param: {
      vi: 'Số tiền {money}',
      en: 'Amount {money}',
    },
    by_member_params: {
      vi: 'Bởi {memberName}',
      en: 'By {memberName}',
    },
    booking_info_noti: {
      vi: '{customerName}, {dateTime} {bookingNote}',
      en: '{customerName}, {dateTime} {bookingNote}',
    },
    booking_cancelled_noti: {
      vi: '{customerName}, {dateTime}, Lý do: {rejectedReason}',
      en: '{customerName}, {dateTime}, Reason: {rejectedReason}',
    },
    new_task_noti: {
      vi: '{name}, tạo bởi {member}',
      en: '{name}, created by {member}',
    },
    task_status_updated_title: {
      vi: '{member} - {name}',
      en: '{member} - {name}',
    },
    task_status_updated_body: {
      vi: 'Thay đổi trạng thái {fromTaskStatus} → {toTaskStatus}',
      en: 'Status changed {fromTaskStatus} → {toTaskStatus}',
    },
    task_info_updated: {
      vi: '{name}, cập nhật bởi {member}',
      en: '{name}, updated by {member}',
    },
    task_assigned: {
      vi: '{name}, giao bởi {member}',
      en: '{name}, assigned by {member}',
    },
    new_task_comment_body: {
      vi: 'Công việc: {taskName}',
      en: 'Task: {taskName}',
    },
    customer_form_new_body: {
      vi: 'Tên khách hàng: {name}, SĐT: {phone}',
      en: 'Name: {name}, Phone: {phone}',
    },
    noti_receipt_paid_body: {
      vi: '{money}, Người thu: {cashier}',
      en: '{money}, Cashier: {cashier}',
    },
    noti_receipt_paid_body_with_customer: {
      vi: '{money}, Người thu: {cashier}, Khách hàng: {customer}',
      en: '{money}, Cashier: {cashier}, Customer: {customer}',
    },
    loans_notification: {
      vi: 'Thông báo khoản vay',
      en: 'Loans notification',
    },
    loans_receipt_warning: {
      vi: 'Có {amount} hồ sơ vay sắp đến hạn thanh toán trong {days} ngày tới',
      en: 'There are {amount} loan records that are about to expire in {days} days',
    },
    timekeepings_pending: {
      vi: 'Chấm công đợi duyệt',
      en: 'Timekeeping pending',
    },
    timekeepings_pending_body: {
      vi: 'Có {amount} đề xuất chấm công đợi xử lí',
      en: 'There are {amount} timekeeping proposals waiting for approval',
    },
    bookings_today: {
      vi: 'Lịch hẹn hôm nay',
      en: 'Bookings today',
    },
    bookings_today_body: {
      vi: 'Bạn có {amount} lịch hẹn hôm nay',
      en: 'You have {amount} bookings today',
    },
    task_due_date: {
      vi: '🚀 Task đến hạn',
      en: '🚀 Task due date',
    },
    task_out_of_date: {
      vi: '❗Task quá hạn',
      en: '❗Task out of date',
    },
    new_message: {
      vi: '💬 Tin nhắn mới',
      en: '💬 New message',
    },
    loan_auto_reject: {
      vi: 'Hồ sơ vay đã bị từ chối tự động',
      en: 'Loan application has been automatically rejected',
    },
    sent_image: {
      vi: 'Đã gửi hình ảnh',
      en: 'Sent image',
    },
    task_status_TODO: {
      vi: 'TO DO',
      en: 'TO DO',
    },
    task_status_CLOSED: {
      vi: 'Đã hoàn thành',
      en: 'Closed',
    },
    new_customer: {
      vi: 'Khách hàng mới',
      en: 'New customer',
    },
    credit_report_sheet_name: { vi: 'Báo cáo tín dụng', en: 'Credit report' },
    credit_report_time: { vi: 'Thời gian', en: 'Time' },
    credit_report_branch: { vi: 'Chi nhánh', en: 'Branch' },
    credit_report_customer: { vi: 'Khách hàng', en: 'Customer' },
    credit_report_member: { vi: 'Thu ngân', en: 'Member' },
    credit_report_interest_income: { vi: 'Thu lãi', en: 'Interest income' },
    credit_report_principal_income: { vi: 'Thu gốc', en: 'Principal income' },
    credit_report_principal_expense: { vi: 'Chi gốc', en: 'Principal expense' },
    credit_report_advance_payment: { vi: 'Ứng trước', en: 'Advance payment' },
    credit_report_receipt: { vi: 'Hoá đơn', en: 'Receipt' },
    credit_report_total: { vi: 'Tổng cộng', en: 'Total' },
    credit_report_main_office: { vi: 'Trụ sở chính', en: 'Main office' },
    credit_report_fixed_capital: { vi: 'Vốn cố định', en: 'Fixed capital' },
    credit_report_installment: { vi: 'Trả góp', en: 'Installment' },
    credit_report_unfixed_capital: {
      vi: 'Vốn không cố định',
      en: 'Unfixed capital',
    },
  },
};
