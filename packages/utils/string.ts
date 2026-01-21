export const replaceLineBreaksToHTML = (str: string) => {
  return str.replace(/(?:\r\n|\r|\n)/g, "<br>");
};

export const toSlug = (string?: string): string => {
  if (!string) return "";

  var title = string,
    slug;

  //Đổi chữ hoa thành chữ thường
  slug = title.toLowerCase();

  //Đổi ký tự có dấu thành không dấu
  slug = slug.replace(/á|à|ả|ạ|ã|ă|ắ|ằ|ẳ|ẵ|ặ|â|ấ|ầ|ẩ|ẫ|ậ/gi, "a");
  slug = slug.replace(/é|è|ẻ|ẽ|ẹ|ê|ế|ề|ể|ễ|ệ/gi, "e");
  slug = slug.replace(/i|í|ì|ỉ|ĩ|ị/gi, "i");
  slug = slug.replace(/ó|ò|ỏ|õ|ọ|ô|ố|ồ|ổ|ỗ|ộ|ơ|ớ|ờ|ở|ỡ|ợ/gi, "o");
  slug = slug.replace(/ú|ù|ủ|ũ|ụ|ư|ứ|ừ|ử|ữ|ự/gi, "u");
  slug = slug.replace(/ý|ỳ|ỷ|ỹ|ỵ/gi, "y");
  slug = slug.replace(/đ/gi, "d");
  //Xóa các ký tự đặt biệt
  // eslint-disable-next-line
  slug = slug.replace(
    /\`|\~|\!|\@|\#|\||\$|\%|\^|\&|\*|\(|\)|\+|\=|\,|\.|\/|\?|\>|\<|\'|\"|\:|\;|_/gi,
    ""
  );
  //Đổi khoảng trắng thành ký tự gạch ngang
  slug = slug.replace(/ /gi, "-");
  //Đổi nhiều ký tự gạch ngang liên tiếp thành 1 ký tự gạch ngang
  //Phòng trường hợp người nhập vào quá nhiều ký tự trắng
  // eslint-disable-next-line
  slug = slug.replace(/\-\-\-\-\-/gi, "-");
  // eslint-disable-next-line
  slug = slug.replace(/\-\-\-\-/gi, "-");
  // eslint-disable-next-line
  slug = slug.replace(/\-\-\-/gi, "-");
  // eslint-disable-next-line
  slug = slug.replace(/\-\-/gi, "-");
  //Xóa các ký tự gạch ngang ở đầu và cuối
  slug = "@" + slug + "@";
  // eslint-disable-next-line
  slug = slug.replace(/\@\-|\-\@|\@/gi, "");

  return slug;
};

export const limitCharacters = (text: string, length: number, subfix = "..."): string => {
  if (text.length <= +length) return text;
  let string = text.slice(0, length);
  string += subfix;
  return string;
};

export const capitalizeFirstLetter = (str: string, lowercaseAll = true): string => {
  if (!str) return "";
  const strValue = lowercaseAll ? str.toLowerCase() : str;
  return strValue.charAt(0).toUpperCase() + strValue.slice(1);
};

export function capitalize(str: string) {
  if (!str) return "";
  const strValue = str.toLowerCase();
  return strValue.charAt(0).toUpperCase() + strValue.slice(1);
}

export const convertToTitleCase = (input: string) => {
  return input.replace(/([A-Z])/g, " $1").replace(/^./, function (str) {
    return str.toUpperCase();
  });
};

export const isObjectID = (id: string) => {
  return /^[0-9a-fA-F]{24}$/.test(id);
};

export const stringable = <T extends string>(value: T): string => {
  return `${value}`;
};
