export function removeTypeName<T>(obj: T): T {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => removeTypeName(item)) as T;
  } else if (typeof obj === "object") {
    const newObj: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      if (key === "__typename") continue;
      newObj[key] = removeTypeName(value);
    }
    return newObj as T;
  }
  return obj;
}
