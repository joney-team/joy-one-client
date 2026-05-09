export function randomItemFromArray<T = any>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function removeItemAtIndex<T = any>(arr: T[], index: number): T[] {
  return arr.filter((_, i) => i !== index);
}

export function addItemToIndex<T = any>(
  arr: T[],
  item: T,
  index?: number,
): T[] {
  if (index) {
    return [...arr.slice(0, index), item, ...arr.slice(index)];
  }

  return [...arr, item];
}
