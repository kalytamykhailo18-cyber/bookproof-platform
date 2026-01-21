import { BadRequestException } from '@nestjs/common';

/**
 * File Upload Validation Utilities
 *
 * Validates file uploads for:
 * - MIME type checking
 * - File size limits
 * - File extension validation
 * - Security checks
 */

export class FileValidationUtil {
  /**
   * Validate ebook file (PDF, EPUB, MOBI)
   * Per Section 11.1: "Formats: EPUB, PDF, MOBI"
   */
  static validateEbook(file: Express.Multer.File): void {
    const allowedMimeTypes = [
      'application/pdf',
      'application/epub+zip',
      'application/x-epub+zip',
      'application/x-mobipocket-ebook', // MOBI format
      'application/vnd.amazon.ebook', // Alternative MOBI MIME type
    ];
    const allowedExtensions = ['.pdf', '.epub', '.mobi'];
    const maxSize = 50 * 1024 * 1024; // 50MB (Section 11 requirement)

    this.validateFile(
      file,
      allowedMimeTypes,
      allowedExtensions,
      maxSize,
      'ebook',
    );
  }

  /**
   * Validate audiobook file (MP3)
   */
  static validateAudiobook(file: Express.Multer.File): void {
    const allowedMimeTypes = ['audio/mpeg', 'audio/mp3'];
    const allowedExtensions = ['.mp3'];
    const maxSize = 500 * 1024 * 1024; // 500MB

    this.validateFile(
      file,
      allowedMimeTypes,
      allowedExtensions,
      maxSize,
      'audiobook',
    );
  }

  /**
   * Validate cover image (JPG, PNG, WEBP)
   */
  static validateCoverImage(file: Express.Multer.File): void {
    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    this.validateFile(
      file,
      allowedMimeTypes,
      allowedExtensions,
      maxSize,
      'cover image',
    );
  }

  /**
   * Validate profile avatar (JPG, PNG, WEBP)
   */
  static validateAvatar(file: Express.Multer.File): void {
    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
    const maxSize = 2 * 1024 * 1024; // 2MB

    this.validateFile(
      file,
      allowedMimeTypes,
      allowedExtensions,
      maxSize,
      'profile avatar',
    );
  }

  /**
   * Validate synopsis file (PDF, DOC, DOCX, TXT)
   * Per Section 11.1: "Formats: PDF, DOC, DOCX, TXT"
   */
  static validateSynopsis(file: Express.Multer.File): void {
    const allowedMimeTypes = [
      'application/pdf',
      'application/msword', // DOC
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // DOCX
      'text/plain', // TXT
    ];
    const allowedExtensions = ['.pdf', '.doc', '.docx', '.txt'];
    const maxSize = 10 * 1024 * 1024; // 10MB (Section 11 requirement)

    this.validateFile(
      file,
      allowedMimeTypes,
      allowedExtensions,
      maxSize,
      'synopsis',
    );
  }

  /**
   * Generic file validation
   */
  private static validateFile(
    file: Express.Multer.File,
    allowedMimeTypes: string[],
    allowedExtensions: string[],
    maxSize: number,
    fileType: string,
  ): void {
    if (!file) {
      throw new BadRequestException(`No ${fileType} file provided`);
    }

    // Check MIME type
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `Invalid ${fileType} file type. Allowed: ${allowedExtensions.join(', ')}`,
      );
    }

    // Check file extension
    const extension = this.getFileExtension(file.originalname);
    if (!allowedExtensions.includes(extension.toLowerCase())) {
      throw new BadRequestException(
        `Invalid ${fileType} file extension. Allowed: ${allowedExtensions.join(', ')}`,
      );
    }

    // Check file size
    if (file.size > maxSize) {
      const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(0);
      throw new BadRequestException(
        `${fileType} file too large. Maximum size: ${maxSizeMB}MB`,
      );
    }

    // Additional security checks
    this.checkForMaliciousContent(file, fileType);
  }

  /**
   * Get file extension from filename
   */
  private static getFileExtension(filename: string): string {
    const lastDotIndex = filename.lastIndexOf('.');
    if (lastDotIndex === -1) {
      return '';
    }
    return filename.substring(lastDotIndex);
  }

  /**
   * Check for potentially malicious content
   */
  private static checkForMaliciousContent(
    file: Express.Multer.File,
    fileType: string,
  ): void {
    // Check for suspicious filename patterns
    const suspiciousPatterns = [
      /\.\./, // Directory traversal
      /[<>:"|?*]/, // Invalid characters
      /^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])$/i, // Windows reserved names
      /\.(exe|bat|cmd|sh|ps1|vbs|js)$/i, // Executable files
    ];

    const filename = file.originalname;
    for (const pattern of suspiciousPatterns) {
      if (pattern.test(filename)) {
        throw new BadRequestException(
          `${fileType} filename contains suspicious content`,
        );
      }
    }

    // Check buffer for null bytes (file upload attack indicator)
    if (file.buffer && file.buffer.includes(0x00)) {
      throw new BadRequestException(
        `${fileType} file contains suspicious content`,
      );
    }
  }

  /**
   * Sanitize filename for safe storage
   */
  static sanitizeFilename(filename: string): string {
    // Remove path components
    const basename = filename.replace(/^.*[\\/]/, '');

    // Replace spaces and special characters
    const sanitized = basename
      .replace(/\s+/g, '-') // Spaces to dashes
      .replace(/[^a-zA-Z0-9.-]/g, '') // Remove non-alphanumeric except dots and dashes
      .replace(/\.+/g, '.') // Multiple dots to single dot
      .replace(/-+/g, '-') // Multiple dashes to single dash
      .toLowerCase();

    // Ensure filename isn't empty after sanitization
    if (!sanitized || sanitized === '.') {
      return 'file';
    }

    // Limit length (keep extension)
    const maxLength = 100;
    if (sanitized.length > maxLength) {
      const extension = this.getFileExtension(sanitized);
      const nameWithoutExt = sanitized.substring(
        0,
        sanitized.length - extension.length,
      );
      return (
        nameWithoutExt.substring(0, maxLength - extension.length) + extension
      );
    }

    return sanitized;
  }

  /**
   * Generate unique filename with timestamp
   */
  static generateUniqueFilename(originalFilename: string): string {
    const sanitized = this.sanitizeFilename(originalFilename);
    const extension = this.getFileExtension(sanitized);
    const nameWithoutExt = sanitized.substring(
      0,
      sanitized.length - extension.length,
    );

    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);

    return `${nameWithoutExt}-${timestamp}-${random}${extension}`;
  }
}
