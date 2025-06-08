export function generateRandomString(length: number): string {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
  let result = '';
  const array = new Uint8Array(length);
  window.crypto.getRandomValues(array);
  for (let i = 0; i < length; i++) {
      result += charset[array[i] % charset.length];
  }
  return result;
}

export function base64UrlEncode(buffer: ArrayBuffer): string {
  // Convert buffer to binary string
  const binaryString = Array.from(new Uint8Array(buffer))
      .map(byte => String.fromCharCode(byte))
      .join('');
  // Base64 encode the binary string
  return btoa(binaryString)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
}

export async function sha256(plain: string): Promise<ArrayBuffer> {
  const encoder = new TextEncoder();
  const data = encoder.encode(plain);
  const hash = await window.crypto.subtle.digest('SHA-256', data);
  return hash;
}

export async function createCodeVerifier(): Promise<string> {
  const codeVerifier = generateRandomString(128);
  return codeVerifier;
}

export async function createCodeChallenge(codeVerifier: string): Promise<string> {
  const hash = await sha256(codeVerifier);
  const codeChallenge = base64UrlEncode(hash);
  return codeChallenge;
}
