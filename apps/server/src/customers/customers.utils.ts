export function getShortName(fullName: string) {
  return fullName.split(' ').slice(-1).join(' ');
}
