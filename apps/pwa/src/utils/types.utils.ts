export function isNotUndefined(...values: any) {
  return values.every((value: any) => typeof value !== 'undefined');
}