export class StringUtils {
  static isEmail(text: string): boolean {
    if (!text) return false
    var re =
      /^(([^<>()[\].,;:\s@"]+(\.[^<>()[\].,;:\s@"]+)*)|(".+"))@(([^<>()[\].,;:\s@"]+\.)+[^<>()[\].,;:\s@"]{2,})$/i
    return re.test(text)
  }

  static isPhoneNumber(phone: string): boolean {
    if (!phone) return false
    return /^(\+?84|0)(1\d{9}|3\d{8}|5\d{8}|7\d{8}|8\d{8}|9\d{8})$/.test(phone)
  }

  static removePhoneCode(phone: string, phoneCode?: string) {
    if (!phone) return ''
    if (phoneCode) return phone.replace(/[+\-]/g, '').replace(phoneCode.replace(/[+\-]/g, ''), '')
    return phone.replace(/[+\-]/g, '')
  }

  static formatPhoneWithPhoneCode(phone: string, phoneCode?: string) {
    if (!phone) return ''
    if (!phoneCode) return phone

    return `${phoneCode}${phone}`
  }

  static formatPhoneWithCode(phoneNumber: string, phoneCode: string) {
    if (!phoneNumber) return ''
    if (!phoneCode) return phoneNumber
    const indexOfPhoneCode = phoneNumber.indexOf(phoneCode)

    const phone = phoneNumber.slice(indexOfPhoneCode + phoneCode.length)

    return `(+${phoneNumber.slice(indexOfPhoneCode, indexOfPhoneCode + phoneCode.length)}) ${this.addSpaces(phone, 3)}`
  }

  static removeLeadingZero(phoneNumber: string) {
    // Kiểm tra xem số điện thoại có số 0 đầu tiên không
    if (phoneNumber.charAt(0) === '0') {
      // Loại bỏ số 0 đầu tiên
      phoneNumber = phoneNumber.slice(1);
    }
    return phoneNumber;
  }

  static isURL(str: any): boolean {
    if (!str || typeof str !== 'string') return false
    var urlRegex =
      '^(?!mailto:)(?:(?:http|https|ftp)://)(?:\\S+(?::\\S*)?@)?(?:(?:(?:[1-9]\\d?|1\\d\\d|2[01]\\d|22[0-3])(?:\\.(?:1?\\d{1,2}|2[0-4]\\d|25[0-5])){2}(?:\\.(?:[0-9]\\d?|1\\d\\d|2[0-4]\\d|25[0-4]))|(?:(?:[a-z\\u00a1-\\uffff0-9]+-?)*[a-z\\u00a1-\\uffff0-9]+)(?:\\.(?:[a-z\\u00a1-\\uffff0-9]+-?)*[a-z\\u00a1-\\uffff0-9]+)*(?:\\.(?:[a-z\\u00a1-\\uffff]{2,})))|localhost)(?::\\d{2,5})?(?:(/|\\?|#)[^\\s]*)?$'
    var url = new RegExp(urlRegex, 'i')
    return str.length < 2083 && url.test(str)
  }

  static removeAccents(str: string) {
    var AccentsMap = [
      "aàảãáạăằẳẵắặâầẩẫấậ",
      "AÀẢÃÁẠĂẰẲẴẮẶÂẦẨẪẤẬ",
      "dđ", "DĐ",
      "eèẻẽéẹêềểễếệ",
      "EÈẺẼÉẸÊỀỂỄẾỆ",
      "iìỉĩíị",
      "IÌỈĨÍỊ",
      "oòỏõóọôồổỗốộơờởỡớợ",
      "OÒỎÕÓỌÔỒỔỖỐỘƠỜỞỠỚỢ",
      "uùủũúụưừửữứự",
      "UÙỦŨÚỤƯỪỬỮỨỰ",
      "yỳỷỹýỵ",
      "YỲỶỸÝỴ"
    ];
    for (var i = 0; i < AccentsMap.length; i++) {
      var re = new RegExp('[' + AccentsMap[i].substr(1) + ']', 'g');
      var char = AccentsMap[i][0];
      str = str.replace(re, char);
    }
    return str;
  }

  static limitCharacters(text: string, length: number, subfix = '...'): string {
    if (text.length <= +length) return text
    let string = text.slice(0, length)
    string += subfix
    return string
  }

  static convertToTitleCase(input: string) {
    return input.replace(/([A-Z])/g, ' $1')
      .replace(/^./, function (str) { return str.toUpperCase(); });
  }

  static camelCaseToTitleCaseWithSpace(input: string) {
    const words = input.split(/(?=[A-Z])/); // Split camelCase into words
    const titleCaseWords = words.map(word => this.convertToTitleCase(word)).join(' ');
    return titleCaseWords;
  }

  static removeHtmlTags(string: string | undefined): string {
    try {
      if (!string) return ''
      return string.replace(/<\/?[^>]+(>|$)/g, '')
    } catch (error) {
      return ''
    }
  }

  static toSlug(string?: string): string {
    if (!string) return '';

    var title = string,
      slug

    //Đổi chữ hoa thành chữ thường
    slug = title.toLowerCase()

    //Đổi ký tự có dấu thành không dấu
    slug = slug.replace(/á|à|ả|ạ|ã|ă|ắ|ằ|ẳ|ẵ|ặ|â|ấ|ầ|ẩ|ẫ|ậ/gi, 'a')
    slug = slug.replace(/é|è|ẻ|ẽ|ẹ|ê|ế|ề|ể|ễ|ệ/gi, 'e')
    slug = slug.replace(/i|í|ì|ỉ|ĩ|ị/gi, 'i')
    slug = slug.replace(/ó|ò|ỏ|õ|ọ|ô|ố|ồ|ổ|ỗ|ộ|ơ|ớ|ờ|ở|ỡ|ợ/gi, 'o')
    slug = slug.replace(/ú|ù|ủ|ũ|ụ|ư|ứ|ừ|ử|ữ|ự/gi, 'u')
    slug = slug.replace(/ý|ỳ|ỷ|ỹ|ỵ/gi, 'y')
    slug = slug.replace(/đ/gi, 'd')
    //Xóa các ký tự đặt biệt
    // eslint-disable-next-line
    slug = slug.replace(
      /\`|\~|\!|\@|\#|\||\$|\%|\^|\&|\*|\(|\)|\+|\=|\,|\.|\/|\?|\>|\<|\'|\"|\:|\;|_/gi,
      ''
    )
    //Đổi khoảng trắng thành ký tự gạch ngang
    slug = slug.replace(/ /gi, '-')
    //Đổi nhiều ký tự gạch ngang liên tiếp thành 1 ký tự gạch ngang
    //Phòng trường hợp người nhập vào quá nhiều ký tự trắng
    // eslint-disable-next-line
    slug = slug.replace(/\-\-\-\-\-/gi, '-')
    // eslint-disable-next-line
    slug = slug.replace(/\-\-\-\-/gi, '-')
    // eslint-disable-next-line
    slug = slug.replace(/\-\-\-/gi, '-')
    // eslint-disable-next-line
    slug = slug.replace(/\-\-/gi, '-')
    //Xóa các ký tự gạch ngang ở đầu và cuối
    slug = '@' + slug + '@'
    // eslint-disable-next-line
    slug = slug.replace(/\@\-|\-\@|\@/gi, '')

    return slug
  }

  static replaceLineBreaksToHTML = (str: string) => {
    return str.replace(/(?:\r\n|\r|\n)/g, '<br>')
  }

  static beautyHTML = (str: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g
    const lineBreaksRegex = /(?:\r\n|\r|\n)/g
    return str
      .replace(
        urlRegex,
        (url) => '<a href="' + url + '" target="__blank">' + url + '</a>'
      )
      .replace(lineBreaksRegex, '<br>')
  }

  static parseJSON = (str: string) => {
    try {
      return JSON.parse(str)
    } catch (error) {
      return {}
    }
  }

  static compact(
    string: any,
    firstPart: number,
    lastPart: number,
    replaceWith = '...'
  ) {
    if (!string) return ''
    return string.replace(
      `${string}`.slice(firstPart, string.length - lastPart),
      replaceWith
    )
  }

  static isImageURL(url: string) {
    return (url.match(/\.(jpeg|jpg|gif|png)$/) != null);
  }

  static textOverflow(text: string, length: number, replaceWith = '...') {
    if (text.length <= length) return text
    return text.slice(0, length) + replaceWith
  }

  static isBase64(str: string) {
    return str.length % 4 == 0 && /^[A-Za-z0-9+/]+[=]{0,2}$/.test(str)
  }

  static deburr(str: string) {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  }

  static capitalizeFirstLetter(str: string) {
    if (!str) return ''
    const strValue = str.toLowerCase()
    return strValue.charAt(0).toUpperCase() + strValue.slice(1)
  }

  //capitalize first letter of each word
  static capitalizeFirstLetterOfEachWord(str: string) {
    if (!str) return ''
    const splitStr = str
    return splitStr.replace(/(^\w|\s\w)/g, m => m.toUpperCase());
  }

  static formatPhoneNumber(phoneNumber: string) {
    if (!phoneNumber) return '';
    const formattedPhone = `${phoneNumber.match(/.{1,3}/g)!.join(' ')}`;
    return formattedPhone;
  }

  static addSpaces(inputString: string, interval: number) {
    let result = '';
    for (let i = 0; i < inputString.length; i++) {
      if (i > 0 && i % interval === 0) {
        result += ' ';
      }
      result += inputString.charAt(i);
    }
    return result;
  }

  static getDomainFromURL(url: string) {
    return url.replace(/^(https?:\/\/)?(www\.)?/i, '');
  }

  static extractFromHTML(html?: string, space?: boolean) {
    if (!html) return '';
    var span = document.createElement('span');
    span.innerHTML = html;
    if (space) {
      var children = span.querySelectorAll('*');
      for (var i = 0; i < children.length; i++) {
        if (children[i].textContent)
          children[i].textContent += ' ';
        else if ((children[i] as any).innerText)
          (children[i] as any).innerText += ' ';
      }
    }
    return [span.textContent || span.innerText].toString().replace(/ +/g, ' ');
  }
}


export function removeAccents(str: string) {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

export function searchWithoutAccents(query: string, targetString: string) {
  if (!query) return false;

  // Remove accents from both query and targetString
  const normalizedQuery = removeAccents(query.toLowerCase());
  const normalizedTarget = removeAccents(targetString.toLowerCase());

  // Check if the normalized query exists in the normalized target string
  return normalizedTarget.includes(normalizedQuery);
}

export function isPlural(word: string) {
  // Danh sách các danh từ bất quy tắc
  const irregulars: any = {
    'child': 'children',
    'person': 'people',
    'man': 'men',
    'woman': 'women',
    'mouse': 'mice',
    'goose': 'geese',
    'tooth': 'teeth',
    'foot': 'feet',
    'ox': 'oxen',
  };

  // Kiểm tra nếu từ nằm trong danh sách bất quy tắc
  for (let singular in irregulars) {
    if (word.toLowerCase() === irregulars[singular].toLowerCase()) {
      return true;
    } else if (word.toLowerCase() === singular.toLowerCase()) {
      return false;
    }
  }

  // Kiểm tra nếu từ kết thúc bằng 's' nhưng không kết thúc bằng 'ss' (ví dụ: glass -> không phải số nhiều)
  if (word.endsWith('s') && !word.endsWith('ss')) {
    return true;
  }

  // Ngược lại
  return false;
}

export function isDomain(input: string) {
  if (typeof input !== 'string') return false;
  const domainRegex = /^(?!:\/\/)([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/;
  return domainRegex.test(input);
}

export function getSubDomain(input: string) {
  if (!isDomain(input)) return '';
  return input.split('.').slice(0, -2).join('.');
}

export function getMainDomain(input: string) {
  if (!isDomain(input)) return '';
  return input.split('.').slice(-2).join('.');
}

export function getDnsRecordName(input: string) {
  if (!isDomain(input)) return '';
  const isMainDomain = input.split('.').length === 2;
  if (isMainDomain) return '@';
  return input.split('.').slice(0, -2).join('.');
}

export function capitalize(str: string) {
  if (!str) return ''
  const strValue = str.toLowerCase()
  return strValue.charAt(0).toUpperCase() + strValue.slice(1)
}

export function capitalizeFirstLetter(str: string) {
  if (!str) return ''
  const strValue = str
  return strValue.charAt(0).toUpperCase() + strValue.slice(1)
}

export function uppercase(str: string) {
  if (!str) return ''
  return str.toUpperCase()
}

export const limitString = (str: string, limit: number, suffix: string = '...') => {
  if (str.length > limit) {
    return str.slice(0, limit) + suffix;
  }

  return str;
}

export const getAvatarInitials = (name: string) => {
  try {
    const words = name.split(' ');
    const _name = words.length > 1 ? `${words[0][0] + words[1][0]}`
      : words[0].slice(0, 2).trim();

    return StringUtils.limitCharacters(StringUtils.toSlug(_name).toUpperCase(), 2, '');
  } catch (error) {
    return '';
  }
}