export function changeIndex<T = any>(array: T[], currentIndex: number, index: number) {
  let arr = [...array];
  while (currentIndex < 0) {
    currentIndex += arr.length;
  }
  while (index < 0) {
    index += arr.length;
  }
  if (index >= arr.length) {
    var k = index - arr.length + 1;
    while (k--) {
      // arr.push(undefined);
    }
  }
  arr.splice(index, 0, arr.splice(currentIndex, 1)[0]);
  return arr; // for testing purposes
}

export function exchangeIndex<T = any>(arr: T[], from: number, to: number): T[] {
  const newArr = [...arr];
  const temp = newArr[from];
  newArr[from] = newArr[to];
  newArr[to] = temp;
  return newArr;
}

export function addItemToIndex<T = any>(arr: T[], item: T, index: number): T[] {
  const newArr = [...arr];
  newArr.splice(index, 0, item);
  return newArr;
}

export function shiftSelect(
  ids: string[],
  interactedId: string,
  selectedIds: string[],
  lastSelectedId: string | null,
): string[] {
  // Tìm index của interactedId và lastSelectedId
  const interactedIndex = ids.indexOf(interactedId);
  if (interactedIndex === -1) return selectedIds; // Nếu interactedId không tồn tại, trả về danh sách cũ

  if (lastSelectedId === null) {
    // Trường hợp chưa có lastSelectedId, chỉ chọn phần tử hiện tại
    return [...new Set([...selectedIds, interactedId])];
  }

  const lastSelectedIndex = ids.indexOf(lastSelectedId);
  if (lastSelectedIndex === -1) {
    // Nếu lastSelectedId không tồn tại, chỉ chọn interactedId
    return [...new Set([...selectedIds, interactedId])];
  }

  // Tìm khoảng giữa interactedIndex và lastSelectedIndex
  const startIndex = Math.min(interactedIndex, lastSelectedIndex);
  const endIndex = Math.max(interactedIndex, lastSelectedIndex);

  const newSelection = ids.slice(startIndex, endIndex + 1);

  // Trả về danh sách _id được chọn (bao gồm cả các phần tử đã chọn trước đó)
  return [...new Set([...selectedIds, ...newSelection])];
}

export function nonnulArray<T>(value: (T | null)[]): T[] {
  return value.filter((v) => v !== null) as T[];
}
