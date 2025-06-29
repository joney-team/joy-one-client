export function runWithDelay<T>(promiseFn: () => Promise<T>, delayMs = 1000): Promise<T> {
  return new Promise(async (resolve, reject) => {
    const start = Date.now();

    try {
      const result = await promiseFn();
      const elapsed = Date.now() - start;
      const remaining = delayMs - elapsed;

      if (remaining > 0) {
        setTimeout(() => resolve(result), remaining);
      } else {
        resolve(result);
      }
    } catch (error) {
      reject(error);
    }
  });
}
