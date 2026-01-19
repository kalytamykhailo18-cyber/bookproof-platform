/**
 * Log Sanitizer Utility
 *
 * Masks sensitive data in log messages to prevent accidental exposure of:
 * - Passwords
 * - Tokens
 * - API keys
 * - Credit card numbers
 * - Personal identifiable information (PII)
 */

// Type for replacement patterns
type ReplacementFunction = (substring: string, ...args: string[]) => string;
type SensitivePattern = {
  pattern: RegExp;
  replacement: string | ReplacementFunction;
};

// Patterns for sensitive data
const SENSITIVE_PATTERNS: SensitivePattern[] = [
  // Passwords in various formats
  { pattern: /"password"\s*:\s*"[^"]*"/gi, replacement: '"password":"[REDACTED]"' },
  { pattern: /"passwordHash"\s*:\s*"[^"]*"/gi, replacement: '"passwordHash":"[REDACTED]"' },
  { pattern: /"newPassword"\s*:\s*"[^"]*"/gi, replacement: '"newPassword":"[REDACTED]"' },
  { pattern: /"oldPassword"\s*:\s*"[^"]*"/gi, replacement: '"oldPassword":"[REDACTED]"' },
  { pattern: /"temporaryPassword"\s*:\s*"[^"]*"/gi, replacement: '"temporaryPassword":"[REDACTED]"' },
  { pattern: /password=([^&\s]+)/gi, replacement: 'password=[REDACTED]' },

  // Tokens and secrets
  { pattern: /"token"\s*:\s*"[^"]*"/gi, replacement: '"token":"[REDACTED]"' },
  { pattern: /"accessToken"\s*:\s*"[^"]*"/gi, replacement: '"accessToken":"[REDACTED]"' },
  { pattern: /"refreshToken"\s*:\s*"[^"]*"/gi, replacement: '"refreshToken":"[REDACTED]"' },
  { pattern: /"resetToken"\s*:\s*"[^"]*"/gi, replacement: '"resetToken":"[REDACTED]"' },
  { pattern: /"verificationToken"\s*:\s*"[^"]*"/gi, replacement: '"verificationToken":"[REDACTED]"' },
  { pattern: /"apiKey"\s*:\s*"[^"]*"/gi, replacement: '"apiKey":"[REDACTED]"' },
  { pattern: /"secret"\s*:\s*"[^"]*"/gi, replacement: '"secret":"[REDACTED]"' },
  { pattern: /Bearer\s+[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+/gi, replacement: 'Bearer [REDACTED]' },

  // API keys patterns
  { pattern: /sk_(?:test|live)_[A-Za-z0-9]+/gi, replacement: 'sk_****[REDACTED]' },
  { pattern: /pk_(?:test|live)_[A-Za-z0-9]+/gi, replacement: 'pk_****[REDACTED]' },
  { pattern: /whsec_[A-Za-z0-9]+/gi, replacement: 'whsec_****[REDACTED]' },

  // Credit card numbers (basic patterns)
  { pattern: /\b(\d{4})\s*\d{4}\s*\d{4}\s*(\d{4})\b/g, replacement: '$1 **** **** $2' },
  { pattern: /\b(\d{4})-?\d{4}-?\d{4}-?(\d{4})\b/g, replacement: '$1-****-****-$2' },

  // CVV/CVC
  { pattern: /"cvv"\s*:\s*"?\d{3,4}"?/gi, replacement: '"cvv":"[REDACTED]"' },
  { pattern: /"cvc"\s*:\s*"?\d{3,4}"?/gi, replacement: '"cvc":"[REDACTED]"' },

  // Social Security Numbers (US)
  { pattern: /\b\d{3}-\d{2}-\d{4}\b/g, replacement: '***-**-****' },

  // Email addresses (partial masking)
  {
    pattern: /([a-zA-Z0-9._+-]+)@([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g,
    replacement: (_match: string, local: string, domain: string): string => {
      if (local.length <= 2) return `${local[0]}*@${domain}`;
      return `${local[0]}${'*'.repeat(local.length - 2)}${local[local.length - 1]}@${domain}`;
    },
  },
];

// Fields that should be completely removed from objects
const SENSITIVE_FIELDS = [
  'password',
  'passwordHash',
  'newPassword',
  'oldPassword',
  'temporaryPassword',
  'token',
  'accessToken',
  'refreshToken',
  'resetToken',
  'verificationToken',
  'apiKey',
  'secretKey',
  'secret',
  'cvv',
  'cvc',
  'cardNumber',
];

/**
 * Sanitize a string by masking sensitive patterns
 */
export function sanitizeLogMessage(message: string): string {
  let sanitized = message;

  for (const { pattern, replacement } of SENSITIVE_PATTERNS) {
    if (typeof replacement === 'string') {
      sanitized = sanitized.replace(pattern, replacement);
    } else {
      sanitized = sanitized.replace(pattern, replacement as (...args: string[]) => string);
    }
  }

  return sanitized;
}

/**
 * Recursively sanitize an object by removing/masking sensitive fields
 */
export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeObject(item)) as unknown as T;
  }

  const sanitized: Record<string, any> = {};

  for (const [key, value] of Object.entries(obj)) {
    // Check if this is a sensitive field
    if (SENSITIVE_FIELDS.some((field) => key.toLowerCase().includes(field.toLowerCase()))) {
      sanitized[key] = '[REDACTED]';
      continue;
    }

    // Recursively sanitize nested objects
    if (value && typeof value === 'object') {
      sanitized[key] = sanitizeObject(value);
    } else if (typeof value === 'string') {
      sanitized[key] = sanitizeLogMessage(value);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized as T;
}

/**
 * Safe JSON stringify that sanitizes sensitive data
 */
export function safeStringify(obj: any, space?: number): string {
  try {
    const sanitized = sanitizeObject(obj);
    return JSON.stringify(sanitized, null, space);
  } catch {
    return '[Unable to stringify object]';
  }
}

/**
 * Create a sanitized error object for logging
 */
export function sanitizeError(error: Error): Record<string, any> {
  return {
    name: error.name,
    message: sanitizeLogMessage(error.message),
    stack: error.stack ? sanitizeLogMessage(error.stack) : undefined,
  };
}
