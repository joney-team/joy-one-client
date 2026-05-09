// List of common Vietnamese names
const firstNames = [
  'Anh',
  'Bình',
  'Cường',
  'Dũng',
  'Hùng',
  'Khánh',
  'Long',
  'Minh',
  'Nam',
  'Phong',
  'Quân',
  'Sơn',
  'Thành',
  'Tú',
  'Vinh',
  'Xuân',
  'Yến',
];
const middleNames = [
  'Văn',
  'Thị',
  'Hữu',
  'Quốc',
  'Gia',
  'Bảo',
  'Ngọc',
  'Thanh',
  'Kim',
  'Hồng',
  'Thu',
  'Hải',
  'Đức',
  'Trung',
  'Tiến',
  'Phúc',
  'Đình',
];
const lastNames = [
  'Nguyễn',
  'Trần',
  'Lê',
  'Phạm',
  'Huỳnh',
  'Hoàng',
  'Phan',
  'Vũ',
  'Võ',
  'Đặng',
  'Lâm',
  'Bùi',
  'Đỗ',
  'Hồ',
  'Ngô',
];

// Function to generate a random Vietnamese name
export function generateVietnameseName() {
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const middleName =
    middleNames[Math.floor(Math.random() * middleNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  return `${lastName} ${middleName} ${firstName}`;
}

// List of common male and female keywords in Vietnamese names
const maleKeywords = [
  'Văn',
  'Hữu',
  'Quốc',
  'Minh',
  'Hùng',
  'Cường',
  'Dũng',
  'Thành',
  'Sơn',
  'Phong',
];
const femaleKeywords = [
  'Thị',
  'Ngọc',
  'Lan',
  'Mai',
  'Hương',
  'Hoa',
  'Thu',
  'Hồng',
  'Yến',
  'Tuyết',
];

// Function to detect gender from a Vietnamese name
export function detectGender(name: string) {
  // Split the name into parts
  const parts = name.split(' ');

  // Check middle name and first name for keywords
  for (const part of parts) {
    if (maleKeywords.includes(part)) {
      return 'Male';
    }
    if (femaleKeywords.includes(part)) {
      return 'Female';
    }
  }

  // If no keywords are found, return unknown
  return 'Unknow';
}

export function randomBirthday() {
  const year = 1980 + Math.floor(Math.random() * 30);
  const month = 1 + Math.floor(Math.random() * 12);
  const day = 1 + Math.floor(Math.random() * 28);
  return new Date(year, month, day);
}

export function generateVietnamesePhoneNumber() {
  // List of valid prefixes for Vietnamese mobile numbers
  const prefixes = ['03', '05', '07', '08', '09'];
  // Choose a random prefix
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  // Generate the remaining 8 digits randomly
  let number = '';
  for (let i = 0; i < 8; i++) {
    number += Math.floor(Math.random() * 10).toString();
  }
  // Combine prefix and the generated number
  return prefix + number;
}

// List of street names, wards, and districts in the specified areas
const streets = [
  'Nguyễn Trãi',
  'Lê Lợi',
  'Trần Hưng Đạo',
  'Lý Thường Kiệt',
  'Phan Đình Phùng',
  'Đường 3/2',
  'Nguyễn Thị Minh Khai',
  'Xô Viết Nghệ Tĩnh',
  'Nguyễn Văn Cừ',
  'Nguyễn Thái Học',
  'Nguyễn Công Trứ',
  'Nguyễn Đình Chiểu',
  'Nguyễn Văn Linh',
  'Nguyễn Hữu Thọ',
  'Nguyễn Huy Tưởng',
  'Nguyễn Hồng Đức',
  'Nguyễn Thị Định',
  'Nguyễn Thị Thập',
  'Phạm Văn Đồng',
  'Phạm Ngũ Lão',
  'Phạm Hùng',
  'Phạm Thế Hiển',
  'Trần Phú',
  'Trần Hưng Đạo',
  'Trần Quang Khải',
  'Trần Quốc Toản',
  'Trần Bá Giao',
  'Phan Văn Trị',
  'Phan Đăng Lưu',
  'Phan Chu Trinh',
];

// Function to generate a random address in the specified areas
export function generateVietnameseAddress() {
  // Generate a random house number
  const houseNumber = Math.floor(Math.random() * 200) + 1;
  // Choose a random street, ward, and district
  const street = streets[Math.floor(Math.random() * streets.length)];
  // Combine to form a full address
  return `${houseNumber} ${street}`;
}
