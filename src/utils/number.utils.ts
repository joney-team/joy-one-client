export const randomIntFromTo = (from: number, to: number) => {
  return from + Math.floor(Math.random() * (to - from));
};

export function round(value: number, precision: number = 0): number {
  return Number(value.toFixed(precision));
}

export function roundValue(value: number, precision: number = 0): number {
  return Math.floor(value / 10 ** precision) * 10 ** precision;
}
