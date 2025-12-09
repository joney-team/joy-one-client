export function parseTimeInput(input: string) {
  const regex = /(\d+)([dhm])/g;
  let totalSeconds = 0;
  let match;

  while ((match = regex.exec(input)) !== null) {
    const value = parseInt(match[1], 10);
    const unit = match[2];

    switch (unit) {
      case "d":
        totalSeconds += value * 86400;
        break;
      case "h":
        totalSeconds += value * 3600;
        break;
      case "m":
        totalSeconds += value * 60;
        break;
    }
  }

  return totalSeconds;
}

export function formatDuration(seconds: number) {
  const days = Math.floor(seconds / 86400);
  seconds %= 86400;
  const hours = Math.floor(seconds / 3600);
  seconds %= 3600;
  const minutes = Math.floor(seconds / 60);

  const result = [];

  if (days > 0) result.push(`${days}d`);
  if (hours > 0) result.push(`${hours}h`);
  if (minutes > 0) result.push(`${minutes}m`);

  return result.length > 0 ? result.join(" ") : "0m";
}
