import crypto from 'crypto';
const algorithm = 'AES-128-ECB';

export const cryptoEncrypt = (
  data: { [field: string]: any },
  password: string,
) => {
  const key = Buffer.from(
    crypto.scryptSync(password, 'salt', 16).toString('hex'),
    'hex',
  );
  const cipher = crypto.createCipheriv(algorithm, key, Buffer.alloc(0));
  const encrypted = Buffer.concat([
    cipher.update(JSON.stringify({ data })),
    cipher.final(),
  ]);
  return encrypted.toString('hex');
};

export const cryptoDecrypt = <T = any>(
  encryptedData: string,
  password: string,
): T | null => {
  try {
    const key = Buffer.from(
      crypto.scryptSync(password, 'salt', 16).toString('hex'),
      'hex',
    );
    const decipher = crypto.createDecipheriv(algorithm, key, Buffer.alloc(0));
    const decrpyted = Buffer.concat([
      decipher.update(Buffer.from(encryptedData, 'hex')),
      decipher.final(),
    ]);
    const { data } = JSON.parse(decrpyted.toString());
    return data;
  } catch (error) {
    return null;
  }
};

/**
 * Generates a cryptographically secure random secret key of specified length
 * @param length The length of the secret key (default: 32)
 * @returns A secure random string that can be used as a secret key
 */
export function generateSecretKey(length: number = 32): string {
  // Use Node.js crypto module if available
  if (typeof require !== 'undefined') {
    try {
      const crypto = require('crypto');
      return crypto.randomBytes(length).toString('hex');
    } catch (e) {
      console.warn(
        'Node.js crypto module not available, falling back to browser implementation',
      );
    }
  }

  // Browser implementation using Web Crypto API
  const array = new Uint8Array(length);

  if (typeof window !== 'undefined' && window.crypto) {
    window.crypto.getRandomValues(array);
  } else if (typeof globalThis !== 'undefined' && globalThis.crypto) {
    globalThis.crypto.getRandomValues(array);
  } else {
    throw new Error('No secure random number generator available');
  }

  // Convert to hexadecimal string
  return Array.from(array)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}
