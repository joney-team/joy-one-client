export class ObjectUtils {
  static getIn(obj: any, path: string, def?: any) {
    try {
      /**
       * If the path is a string, convert it to an array
       * @param  {String|Array} path The path
       * @return {Array}             The path array
       */
      var stringToPath = function (path: string) {
        // If the path isn't a string, return it
        if (typeof path !== 'string') return path;
        // Create new array
        var output: any = [];
        // Split to an array with dot notation
        path.split('.').forEach(function (item, index) {
          // Split to an array with bracket notation
          item.split(/\[([^}]+)\]/g).forEach(function (key) {
            // Push to the new array
            if (key.length > 0) {
              output.push(key);
            }
          });
        });
        return output;
      };

      // Get the path as an array
      path = stringToPath(path);
      // Cache the current object
      var current: any = obj;
      // For each item in the path, dig into the object
      for (var i = 0; i < path.length; i++) {
        // If the item isn't found, return the default (or null)
        if (typeof current[path[i]] === 'undefined') return def;
        // Otherwise, update the current  value
        current = current[path[i]];
      }
      return current;
    } catch (error) {
      return;
    }
  }

  static cleanObj(obj: any) {
    obj = obj || {};
    return Object.keys(obj).reduce(
      (acc, key) =>
        obj[key] === undefined || obj[key] === null || obj[key] === ''
          ? acc
          : { ...acc, [key]: obj[key] },
      {},
    );
  }

  static isEmptyObj(obj: object) {
    for (var prop in obj) {
      if (obj.hasOwnProperty(prop)) return false;
    }
    return JSON.stringify(obj) === JSON.stringify({});
  }

  static isHasValue(obj: object) {
    return !this.isEmptyObj(obj);
  }

  static selects<T = any>(obj: T, keys: (keyof T)[]) {
    return keys.reduce((acc: any, key) => {
      acc[key] = obj[key];
      return acc;
    }, {} as Partial<T>);
  }

  static getKeyByValue<T>(object: T, value: any): keyof T {
    return Object.keys(object as any).find(
      (key) => (object as any)[key] === value,
    ) as any;
  }
}

export function selectProperties<T = any>(obj: T, select: (keyof T)[]) {
  return select.reduce((acc, key) => {
    acc[key] = obj[key];
    return acc;
  }, {} as Partial<T>);
}

export function selectArrayProperties<T = any>(
  obj: T[],
  select: (keyof T)[],
): T[] {
  return obj.map((item) => selectProperties(item, select)) as T[];
}

export function getKeyOfEnum<T>(enumType: T, value: string) {
  return Object.keys(enumType).find((key) => enumType[key] === value);
}

export function cleanObject<T>(obj: T) {
  return Object.keys(obj).reduce((acc, key) => {
    if (obj[key] === undefined || obj[key] === null || obj[key] === '')
      return acc;
    acc[key] = obj[key];
    return acc;
  }, {} as Partial<T>);
}

export function normalizeObject(obj: any) {
  return JSON.parse(JSON.stringify(obj));
}

export function replaceMultipleFields(
  obj: any,
  fieldNames: string[],
  fieldValue: any | ((value: any) => any),
): any {
  // Chuyển danh sách fieldNames thành Set để tra cứu nhanh
  const fieldNameSet = new Set(fieldNames);

  const fieldValueFn = (value: any) =>
    typeof fieldValue === 'function' ? fieldValue(value) : fieldValue;

  function recurse(current: any): any {
    if (Array.isArray(current)) {
      return current.map((item) => recurse(item));
    } else if (current !== null && typeof current === 'object') {
      const newObj: any = {};
      for (const key in current) {
        if (fieldNameSet.has(key)) {
          // Trường hợp khớp tên, thay thế giá trị
          newObj[key] = fieldValueFn(current[key]);
        } else {
          newObj[key] = recurse(current[key]);
        }
      }
      return newObj;
    } else {
      return current;
    }
  }

  return recurse(normalizeObject(obj));
}
