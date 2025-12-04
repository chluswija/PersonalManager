// Client-side encryption utilities using Web Crypto API
// AES-GCM with PBKDF2 key derivation

const PBKDF2_ITERATIONS = 150000;
const KEY_LENGTH = 256;
const IV_LENGTH = 12;
const SALT_LENGTH = 16;

// Convert ArrayBuffer to Base64 string
export function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Convert Base64 string to Uint8Array
export function base64ToUint8Array(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

// Generate a random salt
export function generateSalt(): string {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
  return arrayBufferToBase64(salt.buffer as ArrayBuffer);
}

// Generate a random IV
export function generateIV(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(IV_LENGTH));
}

// Derive encryption key from password using PBKDF2
export async function deriveKey(password: string, saltBase64: string): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const passwordBuffer = encoder.encode(password);
  const salt = base64ToUint8Array(saltBase64);

  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    passwordBuffer,
    'PBKDF2',
    false,
    ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt as BufferSource,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: KEY_LENGTH },
    false,
    ['encrypt', 'decrypt']
  );
}

// Encrypt JSON data
export async function encryptData(
  data: unknown,
  key: CryptoKey
): Promise<{ ciphertext: string; iv: string }> {
  const encoder = new TextEncoder();
  const plaintext = encoder.encode(JSON.stringify(data));
  const iv = generateIV();

  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: iv as BufferSource },
    key,
    plaintext
  );

  return {
    ciphertext: arrayBufferToBase64(ciphertext),
    iv: arrayBufferToBase64(iv.buffer as ArrayBuffer),
  };
}

// Decrypt data back to JSON
export async function decryptData<T>(
  ciphertext: string,
  iv: string,
  key: CryptoKey
): Promise<T> {
  const ciphertextBuffer = base64ToUint8Array(ciphertext);
  const ivBuffer = base64ToUint8Array(iv);

  const plaintext = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: ivBuffer as BufferSource },
    key,
    ciphertextBuffer as BufferSource
  );

  const decoder = new TextDecoder();
  return JSON.parse(decoder.decode(plaintext)) as T;
}

// Generate a strong random password
export interface PasswordOptions {
  length: number;
  includeUppercase: boolean;
  includeLowercase: boolean;
  includeNumbers: boolean;
  includeSymbols: boolean;
  excludeAmbiguous: boolean;
}

const LOWERCASE = 'abcdefghijklmnopqrstuvwxyz';
const UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const NUMBERS = '0123456789';
const SYMBOLS = '!@#$%^&*()_+-=[]{}|;:,.<>?';
const AMBIGUOUS = 'l1IO0';

export function generatePassword(options: PasswordOptions): string {
  let charset = '';
  
  if (options.includeLowercase) charset += LOWERCASE;
  if (options.includeUppercase) charset += UPPERCASE;
  if (options.includeNumbers) charset += NUMBERS;
  if (options.includeSymbols) charset += SYMBOLS;
  
  if (options.excludeAmbiguous) {
    charset = charset.split('').filter(c => !AMBIGUOUS.includes(c)).join('');
  }
  
  if (charset.length === 0) {
    charset = LOWERCASE + UPPERCASE + NUMBERS;
  }
  
  const array = new Uint32Array(options.length);
  crypto.getRandomValues(array);
  
  let password = '';
  for (let i = 0; i < options.length; i++) {
    password += charset[array[i] % charset.length];
  }
  
  return password;
}

// Calculate password strength (0-100)
export function calculatePasswordStrength(password: string): number {
  if (!password) return 0;
  
  let score = 0;
  
  // Length score
  score += Math.min(password.length * 4, 40);
  
  // Character variety
  if (/[a-z]/.test(password)) score += 10;
  if (/[A-Z]/.test(password)) score += 10;
  if (/[0-9]/.test(password)) score += 10;
  if (/[^a-zA-Z0-9]/.test(password)) score += 15;
  
  // Unique characters
  const uniqueChars = new Set(password).size;
  score += Math.min(uniqueChars * 2, 15);
  
  return Math.min(score, 100);
}

export function getStrengthLabel(strength: number): { label: string; color: string } {
  if (strength < 30) return { label: 'Weak', color: 'destructive' };
  if (strength < 60) return { label: 'Fair', color: 'warning' };
  if (strength < 80) return { label: 'Good', color: 'accent' };
  return { label: 'Strong', color: 'success' };
}
