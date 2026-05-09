export function isDiff<T = any>(obj: T, _obj: any, fields?: (keyof T)[]) {
  try {
    if (fields) {
      return fields.some((field) => obj[field] !== _obj[field]);
    }
    return JSON.stringify(obj) !== JSON.stringify(_obj);
  } catch (error) {
    return false;
  }
}