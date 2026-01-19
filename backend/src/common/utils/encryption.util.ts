import * as crypto from 'crypto';

export class EncryptionUtil {
  private static readonly algorithm = 'aes-256-gcm';
  private static readonly ivLength = 16;
  private static readonly saltLength = 64;
  private static readonly tagLength = 16;

  /**
   * Encrypt text using AES-256-GCM
   * @param text - Text to encrypt
   * @param encryptionKey - 32-character encryption key
   * @returns Base64 encoded encrypted string
   */
  static encrypt(text: string, encryptionKey: string): string {
    if (!text || !encryptionKey) {
      throw new Error('Text and encryption key are required');
    }

    if (encryptionKey.length < 32) {
      throw new Error('Encryption key must be at least 32 characters');
    }

    const salt = crypto.randomBytes(this.saltLength);
    const key = crypto.pbkdf2Sync(encryptionKey, salt, 100000, 32, 'sha512');
    const iv = crypto.randomBytes(this.ivLength);

    const cipher = crypto.createCipheriv(this.algorithm, key, iv);
    const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);

    const tag = cipher.getAuthTag();

    // Combine salt + iv + tag + encrypted data
    return Buffer.concat([salt, iv, tag, encrypted]).toString('base64');
  }

  /**
   * Decrypt encrypted text using AES-256-GCM
   * @param encryptedData - Base64 encoded encrypted string
   * @param encryptionKey - 32-character encryption key
   * @returns Decrypted text
   */
  static decrypt(encryptedData: string, encryptionKey: string): string {
    if (!encryptedData || !encryptionKey) {
      throw new Error('Encrypted data and encryption key are required');
    }

    if (encryptionKey.length < 32) {
      throw new Error('Encryption key must be at least 32 characters');
    }

    const buffer = Buffer.from(encryptedData, 'base64');

    const salt = buffer.slice(0, this.saltLength);
    const iv = buffer.slice(this.saltLength, this.saltLength + this.ivLength);
    const tag = buffer.slice(
      this.saltLength + this.ivLength,
      this.saltLength + this.ivLength + this.tagLength,
    );
    const encrypted = buffer.slice(this.saltLength + this.ivLength + this.tagLength);

    const key = crypto.pbkdf2Sync(encryptionKey, salt, 100000, 32, 'sha512');

    const decipher = crypto.createDecipheriv(this.algorithm, key, iv);
    decipher.setAuthTag(tag);

    return decipher.update(encrypted) + decipher.final('utf8');
  }

  /**
   * Hash password using bcrypt-style PBKDF2
   * @param password - Password to hash
   * @param salt - Optional salt (will be generated if not provided)
   * @returns Hashed password
   */
  static hashPassword(password: string, salt?: string): string {
    const saltToUse = salt || crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(password, saltToUse, 10000, 64, 'sha512').toString('hex');
    return `${saltToUse}:${hash}`;
  }

  /**
   * Verify password against hash
   * @param password - Password to verify
   * @param hashedPassword - Hashed password to compare against
   * @returns True if password matches
   */
  static verifyPassword(password: string, hashedPassword: string): boolean {
    const [salt, originalHash] = hashedPassword.split(':');
    const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
    return hash === originalHash;
  }

  /**
   * Generate random token
   * @param length - Length of token in bytes (default 32)
   * @returns Random token as hex string
   */
  static generateToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }
}
