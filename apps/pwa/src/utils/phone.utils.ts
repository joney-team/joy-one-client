
export function isPhoneNumber(phoneNumber: string): boolean {
  // Xóa khoảng trắng đầu và cuối, nếu có
  phoneNumber = phoneNumber.trim();
  phoneNumber = phoneNumber.replace(/ /g, '');

  // Trường hợp bắt đầu bằng "+84"
  if (phoneNumber.startsWith('+84')) {
    phoneNumber = '0' + phoneNumber.slice(3);
  }
  // Trường hợp bắt đầu bằng "84" (thiếu dấu +)
  else if (phoneNumber.startsWith('84')) {
    phoneNumber = '0' + phoneNumber.slice(2);
  }
  // Trường hợp bắt đầu bằng "0"
  else if (phoneNumber.startsWith('0')) {
    // Không làm gì cả
  }
  // Trường hợp số không bắt đầu bằng mã quốc gia hoặc 0
  else {
    phoneNumber = '0' + phoneNumber;
  }

  // Kiểm tra xem phần còn lại có phải là 10 chữ số không
  const phoneRegex = /^0\d{9}$/;
  return phoneRegex.test(phoneNumber);
}

export function formatPhoneNumber(phoneNumber?: string) {
  if (!phoneNumber) return '';

  // Xóa tất cả các ký tự không phải là số
  let cleaned = ('' + phoneNumber).replace(/\D/g, '');
  
  // Kiểm tra độ dài chuỗi đã được làm sạch
  if (cleaned.length !== 10) {
      return 'Invalid phone number';
  }

  // Tách chuỗi thành các phần
  let part1 = cleaned.slice(0, 4); // Mã mạng di động (ví dụ: 091x)
  let part2 = cleaned.slice(4, 7); // 3 số tiếp theo
  let part3 = cleaned.slice(7);    // 3 số cuối

  // Ghép lại thành chuỗi đã được format
  let formatted = `${part1} ${part2} ${part3}`;
  
  return formatted;
}