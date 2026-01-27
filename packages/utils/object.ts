export function isDiff(obj1: any, obj2: any): boolean {
  return JSON.stringify(obj1) !== JSON.stringify(obj2);
}

export function objSelect<T = any>(obj: T, keys: (keyof T)[]) {
  return keys.reduce((acc: any, key) => {
    if (typeof acc[key] === "undefined") {
      acc[key] = obj[key];
    }
    return acc;
  }, {});
}

export function objUnselect<T extends object>(obj: T, keys: (keyof T)[]) {
  return Object.keys(obj).reduce((acc, key) => {
    if (!keys.includes(key as keyof T)) {
      (acc as any)[key] = obj[key as keyof T];
    }
    return acc;
  }, {} as Partial<T>);
}

export function normalizeObject<T>(obj: T): T {
  try {
    return JSON.parse(JSON.stringify(obj));
  } catch (error) {
    return obj;
  }
}
