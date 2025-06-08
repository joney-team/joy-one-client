export function isCryptoSupported() {
  return !!window.crypto && !!window.crypto.subtle;
}

export function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

export function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = window.atob(base64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

export async function getKeyFromString(passphrase: string): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const data = encoder.encode(passphrase);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return crypto.subtle.importKey(
    'raw',
    hash,
    { name: 'AES-GCM' },
    false,
    ['encrypt', 'decrypt']
  );
}

interface EncryptedData {
  iv: string;
  data: string;
}

export async function encryptData(key: string, data: string): Promise<EncryptedData> {
  if (isCryptoSupported()) {
    const iv = crypto.getRandomValues(new Uint8Array(12)); // Tạo IV ngẫu nhiên
    const encodedData = new TextEncoder().encode(data);

    const encryptedData = await crypto.subtle.encrypt(
      {
        name: "AES-GCM",
        iv: iv
      },
      await getKeyFromString(key),
      encodedData
    );

    return {
      iv: arrayBufferToBase64(iv.buffer),
      data: arrayBufferToBase64(encryptedData)
    };
  } else {
    return {
      iv: 'iv',
      data: data,
    }
  }
}

export async function decryptData(key: string, encryptedData: string, iv: string): Promise<string> {
  if (isCryptoSupported()) {
    const decryptedData = await crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: base64ToArrayBuffer(iv)
      },
      await getKeyFromString(key),
      base64ToArrayBuffer(encryptedData)
    );

    return new TextDecoder().decode(decryptedData);
  } else {
    return encryptedData
  }
}
