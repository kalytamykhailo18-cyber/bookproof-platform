import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

const SALT_ROUNDS = 10;

/**
 * Password complexity requirements
 */
export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
}

export class PasswordUtil {
  /**
   * Minimum password requirements
   */
  static readonly MIN_LENGTH = 8;
  static readonly REQUIRE_UPPERCASE = true;
  static readonly REQUIRE_LOWERCASE = true;
  static readonly REQUIRE_NUMBER = true;
  static readonly REQUIRE_SPECIAL = true;

  static async hash(password: string): Promise<string> {
    return bcrypt.hash(password, SALT_ROUNDS);
  }

  static async compare(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * Generate cryptographically secure random token using crypto.randomBytes
   * @param length Token length (default 32)
   * @returns Hex-encoded random token
   */
  static generateToken(length: number = 32): string {
    // Use crypto.randomBytes for cryptographically secure randomness
    return crypto.randomBytes(Math.ceil(length / 2)).toString('hex').slice(0, length);
  }

  /**
   * Generate a URL-safe token (base64url encoding)
   * @param bytes Number of random bytes (default 32)
   * @returns URL-safe base64 encoded token
   */
  static generateUrlSafeToken(bytes: number = 32): string {
    return crypto
      .randomBytes(bytes)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }

  /**
   * Validate password complexity requirements
   * @param password The password to validate
   * @returns Validation result with isValid flag and error messages
   */
  static validatePasswordComplexity(password: string): PasswordValidationResult {
    const errors: string[] = [];

    if (password.length < this.MIN_LENGTH) {
      errors.push(`Password must be at least ${this.MIN_LENGTH} characters long`);
    }

    if (this.REQUIRE_UPPERCASE && !/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (this.REQUIRE_LOWERCASE && !/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (this.REQUIRE_NUMBER && !/[0-9]/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    if (this.REQUIRE_SPECIAL && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push('Password must contain at least one special character (!@#$%^&*()_+-=[]{};\':"|,.<>/?)');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Check if password meets minimum requirements (for quick validation)
   * @param password The password to check
   * @returns true if password meets all requirements
   */
  static isPasswordStrong(password: string): boolean {
    return this.validatePasswordComplexity(password).isValid;
  }
}
