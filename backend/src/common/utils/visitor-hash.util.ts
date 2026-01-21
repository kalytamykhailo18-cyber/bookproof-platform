import { createHash } from 'crypto';

/**
 * Visitor Hash Utility - Milestone 2.2
 *
 * Per requirements: "View tracking counts unique visitors, not repeated visits"
 *
 * Generates a privacy-respecting hash to identify unique visitors
 * without storing personally identifiable information.
 */

/**
 * Generate a unique visitor hash from IP address and User-Agent
 * Uses SHA256 for security and adds a salt for additional privacy
 *
 * @param ip - IP address of the visitor
 * @param userAgent - User-Agent string from request headers
 * @returns SHA256 hash string
 */
export function generateVisitorHash(ip: string, userAgent: string): string {
  // Normalize IP (handle IPv6, proxies, etc.)
  const normalizedIp = normalizeIp(ip);

  // Combine IP and User-Agent with a salt
  const salt = process.env.VISITOR_HASH_SALT || 'bookproof-visitor-salt';
  const combined = `${normalizedIp}:${userAgent}:${salt}`;

  // Generate SHA256 hash
  return createHash('sha256').update(combined).digest('hex');
}

/**
 * Normalize IP address for consistent hashing
 * Handles IPv4, IPv6, and X-Forwarded-For scenarios
 */
function normalizeIp(ip: string): string {
  if (!ip) return 'unknown';

  // Handle X-Forwarded-For (take first IP if multiple)
  if (ip.includes(',')) {
    ip = ip.split(',')[0].trim();
  }

  // Remove IPv6 prefix if present (::ffff:xxx.xxx.xxx.xxx)
  if (ip.startsWith('::ffff:')) {
    ip = ip.substring(7);
  }

  // Normalize to lowercase for IPv6 consistency
  return ip.toLowerCase().trim();
}

/**
 * Extract IP address from request object
 * Handles various proxy scenarios
 */
export function getClientIp(request: any): string {
  // Try various headers in order of preference
  const ip =
    request.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    request.headers['x-real-ip'] ||
    request.headers['cf-connecting-ip'] || // Cloudflare
    request.connection?.remoteAddress ||
    request.socket?.remoteAddress ||
    request.ip ||
    'unknown';

  return ip;
}
