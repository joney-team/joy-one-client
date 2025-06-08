export const randomIntFromTo = (from: number, to: number) => {
  return from + Math.floor(Math.random() * (to - from));
}

export function round(value: number, precision: number = 0): number {
  if (!value || isNaN(+value)) return 0;
  return Number((+value).toFixed(precision));
}