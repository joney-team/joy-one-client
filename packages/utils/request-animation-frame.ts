export function requestAnimationFrameTimes(callback: () => void, times = 5): void {
  if (times <= 0) {
    callback();
    return;
  }

  let count = 0;

  const tick = () => {
    count++;

    if (count >= times) {
      callback();
      return;
    }

    requestAnimationFrame(tick);
  };

  requestAnimationFrame(tick);
}
