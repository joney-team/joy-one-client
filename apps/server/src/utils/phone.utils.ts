import { BadRequestException } from '@nestjs/common';
import { AppMessage } from '../app.message';

export function validatePhoneNumber(
  phoneNumber: string,
  throwError = true,
): string {
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
  if (phoneRegex.test(phoneNumber)) {
    return phoneNumber;
  } else {
    if (throwError) throw new BadRequestException(AppMessage.INVALID_PHONE_NUMBER);
    else '';
  }
}

export function addPhoneNumberCountryCode(
  phoneNumber: string,
  countryCode: string,
): string {
  if (phoneNumber.startsWith('0')) {
    return countryCode + phoneNumber.slice(1);
  } else {
    return phoneNumber;
  }
}
