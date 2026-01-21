/**
 * Slug generation utility for campaign public URLs
 * Per Milestone 2.2: "Each page gets unique shareable URL"
 */

/**
 * Generate URL-safe slug from book title
 *
 * Rules:
 * - Lowercase
 * - Replace spaces with hyphens
 * - Remove special characters (keep only alphanumeric and hyphens)
 * - Remove multiple consecutive hyphens
 * - Trim hyphens from start/end
 * - Maximum 100 characters
 *
 * @param title - Book title
 * @returns URL-safe slug
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    // Replace spaces and underscores with hyphens
    .replace(/[\s_]+/g, '-')
    // Remove special characters, keep only alphanumeric and hyphens
    .replace(/[^a-z0-9-]/g, '')
    // Replace multiple consecutive hyphens with single hyphen
    .replace(/-+/g, '-')
    // Remove leading/trailing hyphens
    .replace(/^-+|-+$/g, '')
    // Limit length to 100 characters
    .substring(0, 100)
    // Remove trailing hyphen if substring created one
    .replace(/-+$/, '');
}

/**
 * Generate unique slug by appending random suffix if needed
 *
 * @param baseSlug - Base slug from title
 * @param existingSlugs - Array of already used slugs to avoid conflicts
 * @returns Unique slug
 */
export function generateUniqueSlug(
  baseSlug: string,
  existingSlugs: string[] = [],
): string {
  // If base slug is unique, return it
  if (!existingSlugs.includes(baseSlug)) {
    return baseSlug;
  }

  // Generate unique slug by appending random suffix
  let attempt = 0;
  let uniqueSlug = baseSlug;

  while (existingSlugs.includes(uniqueSlug) && attempt < 100) {
    // Append random 6-character suffix
    const suffix = Math.random().toString(36).substring(2, 8);
    uniqueSlug = `${baseSlug}-${suffix}`;
    attempt++;
  }

  if (attempt >= 100) {
    // Fallback: use timestamp
    uniqueSlug = `${baseSlug}-${Date.now()}`;
  }

  return uniqueSlug;
}

/**
 * Validate slug format
 *
 * @param slug - Slug to validate
 * @returns true if slug is valid
 */
export function isValidSlug(slug: string): boolean {
  // Slug must be:
  // - 3-100 characters
  // - Lowercase alphanumeric and hyphens only
  // - Not start or end with hyphen
  const slugRegex = /^[a-z0-9]([a-z0-9-]{1,98}[a-z0-9])?$/;
  return slugRegex.test(slug);
}

/**
 * Generate public campaign URL from slug and language
 *
 * @param slug - Campaign slug
 * @param language - Language code (EN, PT, ES)
 * @param baseUrl - Base URL of the application (from environment)
 * @returns Full public URL
 */
export function generatePublicCampaignUrl(
  slug: string,
  language: string,
  baseUrl: string,
): string {
  const langCode = language.toLowerCase();
  return `${baseUrl}/${langCode}/campaigns/${slug}`;
}
