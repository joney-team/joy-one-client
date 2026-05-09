export class StringUtils {
  static isEmail(text: string) {
    if (!text) return false;
    var re =
      /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
    return re.test(text);
  }

  static isPhoneNumber(phone: string) {
    if (!phone) return false;
    return /^(\+?84|0)(1\d{9}|3\d{8}|5\d{8}|7\d{8}|8\d{8}|9\d{8})$/.test(phone);
  }

  static isURL(str: string) {
    try {
      var urlRegex =
        '^(?!mailto:)(?:(?:http|https|ftp)://)(?:\\S+(?::\\S*)?@)?(?:(?:(?:[1-9]\\d?|1\\d\\d|2[01]\\d|22[0-3])(?:\\.(?:1?\\d{1,2}|2[0-4]\\d|25[0-5])){2}(?:\\.(?:[0-9]\\d?|1\\d\\d|2[0-4]\\d|25[0-4]))|(?:(?:[a-z\\u00a1-\\uffff0-9]+-?)*[a-z\\u00a1-\\uffff0-9]+)(?:\\.(?:[a-z\\u00a1-\\uffff0-9]+-?)*[a-z\\u00a1-\\uffff0-9]+)*(?:\\.(?:[a-z\\u00a1-\\uffff]{2,})))|localhost)(?::\\d{2,5})?(?:(/|\\?|#)[^\\s]*)?$';
      var url = new RegExp(urlRegex, 'i');
      return str.length < 2083 && url.test(str);
    } catch (error) {
      return false;
    }
  }

  static removeMark(value: string) {
    let output = value;

    output = output.replace(/á|à|ả|ạ|ã|ă|ắ|ằ|ẳ|ẵ|ặ|â|ấ|ầ|ẩ|ẫ|ậ/gi, 'a');
    output = output.replace(/é|è|ẻ|ẽ|ẹ|ê|ế|ề|ể|ễ|ệ/gi, 'e');
    // output = output.replace(/i|í|ì|ỉ|ĩ|ị/gi, 'i')
    output = output.replace(/ó|ò|ỏ|õ|ọ|ô|ố|ồ|ổ|ỗ|ộ|ơ|ớ|ờ|ở|ỡ|ợ/gi, 'o');
    output = output.replace(/ú|ù|ủ|ũ|ụ|ư|ứ|ừ|ử|ữ|ự/gi, 'u');
    output = output.replace(/ý|ỳ|ỷ|ỹ|ỵ/gi, 'y');
    output = output.replace(/đ/gi, 'd');

    return output;
  }

  static toSlug(title: string): string {
    if (!title) return '';
    let slug: any;
    //Đổi chữ hoa thành chữ thường
    slug = title.toLowerCase();

    //Đổi ký tự có dấu thành không dấu
    slug = slug.replace(/á|à|ả|ạ|ã|ă|ắ|ằ|ẳ|ẵ|ặ|â|ấ|ầ|ẩ|ẫ|ậ/gi, 'a');
    slug = slug.replace(/é|è|ẻ|ẽ|ẹ|ê|ế|ề|ể|ễ|ệ/gi, 'e');
    slug = slug.replace(/i|í|ì|ỉ|ĩ|ị/gi, 'i');
    slug = slug.replace(/ó|ò|ỏ|õ|ọ|ô|ố|ồ|ổ|ỗ|ộ|ơ|ớ|ờ|ở|ỡ|ợ/gi, 'o');
    slug = slug.replace(/ú|ù|ủ|ũ|ụ|ư|ứ|ừ|ử|ữ|ự/gi, 'u');
    slug = slug.replace(/ý|ỳ|ỷ|ỹ|ỵ/gi, 'y');
    slug = slug.replace(/đ/gi, 'd');
    //Xóa các ký tự đặt biệt
    slug = slug.replace(
      /`|~|!|@|#|\||\$|%|\^|&|\*|\(|\)|\+|=|,|\.|\/|\?|>|<|'|"|:|;|\[|\]|_/gi,
      '',
    );
    //Đổi khoảng trắng thành ký tự gạch ngang
    slug = slug.replace(/ /gi, '-');
    //Đổi nhiều ký tự gạch ngang liên tiếp thành 1 ký tự gạch ngang
    //Phòng trường hợp người nhập vào quá nhiều ký tự trắng
    slug = slug.replace(/-----/gi, '-');
    slug = slug.replace(/----/gi, '-');
    slug = slug.replace(/---/gi, '-');
    slug = slug.replace(/--/gi, '-');
    //Xóa các ký tự gạch ngang ở đầu và cuối
    slug = '@' + slug + '@';
    slug = slug.replace(/@-|-@|@/gi, '');
    //In slug ra textbox có id “slug”
    return slug;
  }

  static limitCharacters(text: string, length: number, subfix = '...'): string {
    if (text.length <= +length) return text;
    let string = text.slice(0, length);
    string += subfix;
    return string;
  }

  static compact(
    string: any,
    firstPart: number,
    lastPart: number,
    replaceWith = '...',
  ) {
    if (!string) return '';
    return string.replace(
      `${string}`.slice(firstPart, string.length - lastPart),
      replaceWith,
    );
  }

  static removeAccents(str: string) {
    var AccentsMap = [
      'aàảãáạăằẳẵắặâầẩẫấậ',
      'AÀẢÃÁẠĂẰẲẴẮẶÂẦẨẪẤẬ',
      'dđ',
      'DĐ',
      'eèẻẽéẹêềểễếệ',
      'EÈẺẼÉẸÊỀỂỄẾỆ',
      'iìỉĩíị',
      'IÌỈĨÍỊ',
      'oòỏõóọôồổỗốộơờởỡớợ',
      'OÒỎÕÓỌÔỒỔỖỐỘƠỜỞỠỚỢ',
      'uùủũúụưừửữứự',
      'UÙỦŨÚỤƯỪỬỮỨỰ',
      'yỳỷỹýỵ',
      'YỲỶỸÝỴ',
    ];

    for (var i = 0; i < AccentsMap.length; i++) {
      var re = new RegExp('[' + AccentsMap[i].substr(1) + ']', 'g');
      var char = AccentsMap[i][0];
      str = str.replace(re, char);
    }

    return str;
  }

  static capitalizeFirstLetter(string: string, forceLowerCase = false) {
    if (forceLowerCase)
      return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  static capitalizeWords(str: string) {
    const words = str.split(' ').map((v) => v.toLowerCase());
    const capitalizedWords = words.map((word) => {
      return word.charAt(0).toUpperCase() + word.slice(1);
    });
    const capitalizedStr = capitalizedWords.join(' ');
    return capitalizedStr;
  }

  static removeWhiteSpace(str: string) {
    // Loại bỏ dấu tiếng Việt
    str = str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    // Loại bỏ khoảng trắng
    str = str.replace(/\s+/g, '');
    // Chuyển đổi thành chữ thường
    return str.toLowerCase();
  }

  static getFileExtension(fileName: string) {
    const fileExtension = `${fileName}`.slice(
      fileName.lastIndexOf('.'),
      fileName.length,
    );
    return fileExtension.trim();
  }

  static renameFile(fileName: string, name: string) {
    return `${name}${this.getFileExtension(fileName)}`;
  }

  static random(length: number) {
    let result = '';
    const characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let counter = 0;

    while (counter < length) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
      counter += 1;
    }

    return result;
  }

  static renderUrl(domain: string) {
    const prefix = domain.indexOf('localhost') > -1 ? 'http://' : 'https://';
    return `${prefix}${domain}`;
  }

  static removeHtmlTags(string: string | undefined): string {
    try {
      if (!string) return '';
      return string.replace(/<\/?[^>]+(>|$)/g, '');
    } catch (error) {
      return '';
    }
  }
}

export function isDomain(input: string) {
  if (typeof input !== 'string') return false;
  const domainRegex = /^(?!:\/\/)([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/;
  return domainRegex.test(input);
}

export function splitTextIntoChunks(text: string, maxWords = 200) {
  // Tách đoạn văn thành mảng các đoạn nhỏ dựa vào dấu ngắt dòng
  const paragraphs = text.split(/\n+/).filter(Boolean);

  const chunks = [];
  let currentChunk = [];
  let wordCount = 0;

  for (const paragraph of paragraphs) {
    const words = paragraph.split(/\s+/);

    // Nếu đoạn văn nhỏ hơn maxWords thì thêm trực tiếp vào chunk
    if (words.length + wordCount <= maxWords) {
      currentChunk.push(paragraph);
      wordCount += words.length;
    } else {
      // Nếu đoạn vượt quá số từ, chia đoạn và thêm vào các chunk nhỏ
      for (let i = 0; i < words.length; i += maxWords) {
        const part = words.slice(i, i + maxWords).join(' ');

        if (currentChunk.length > 0) {
          chunks.push(currentChunk.join('\n'));
          currentChunk = [];
        }
        chunks.push(part);
      }
      wordCount = 0;
    }
  }

  // Đưa phần còn lại vào chunks
  if (currentChunk.length > 0) {
    chunks.push(currentChunk.join('\n'));
  }

  return chunks;
}
