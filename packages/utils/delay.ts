export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const delayFunc = (fn: () => Promise<any> | any, ms: number) => async () => {
  await delay(ms);
  return fn();
}