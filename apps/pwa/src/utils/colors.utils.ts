export function isHexColor(hex: string) {
  return /^#[0-9A-F]{6}[0-9a-f]{0,2}$/i.test(hex);
}