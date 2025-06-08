export function resizeArrayForSparkline(data: number[], max: number): number[] {
  if (data.length <= max) {
    return data; // Nếu số phần tử <= max, trả về mảng gốc
  }

  const result: number[] = [];
  const step = (data.length - 1) / (max - 1); // Bước nhảy trong mảng gốc

  for (let i = 0; i < max; i++) {
    const index = i * step;
    const lowerIndex = Math.floor(index); // Chỉ số phần tử bên trái
    const upperIndex = Math.ceil(index); // Chỉ số phần tử bên phải

    if (lowerIndex === upperIndex) {
      // Nếu index trùng với một phần tử trong mảng
      result.push(data[lowerIndex]);
    } else {
      // Nội suy giá trị giữa hai phần tử
      const ratio = index - lowerIndex;
      const interpolatedValue =
        data[lowerIndex] * (1 - ratio) + data[upperIndex] * ratio;
      result.push(interpolatedValue);
    }
  }

  return result;
}