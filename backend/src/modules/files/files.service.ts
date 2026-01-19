import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Readable } from 'stream';

@Injectable()
export class FilesService {
  private readonly logger = new Logger(FilesService.name);
  private readonly s3Client: S3Client;
  private readonly bucket: string;
  private readonly publicBaseUrl: string;

  constructor(private configService: ConfigService) {
    const endpoint = this.configService.get<string>('r2.endpoint');
    const accessKeyId = this.configService.get<string>('r2.accessKeyId');
    const secretAccessKey = this.configService.get<string>('r2.secretAccessKey');
    const region = this.configService.get<string>('r2.region');

    if (!endpoint || !accessKeyId || !secretAccessKey) {
      this.logger.warn('Cloudflare R2 credentials not configured. File storage will not work.');
    }

    this.s3Client = new S3Client({
      region: region || 'auto',
      endpoint,
      credentials: {
        accessKeyId: accessKeyId || '',
        secretAccessKey: secretAccessKey || '',
      },
    });

    this.bucket = this.configService.get<string>('r2.bucket') || 'bookproof-files';
    this.publicBaseUrl = this.configService.get<string>('r2.publicBaseUrl') || '';

    this.logger.log('Cloudflare R2 storage service initialized');
  }

  async uploadFile(
    file: Buffer,
    key: string,
    contentType: string,
  ): Promise<{ key: string; url: string }> {
    try {
      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: file,
        ContentType: contentType,
      });

      await this.s3Client.send(command);

      const url = `${this.publicBaseUrl}/${key}`;
      this.logger.log(`File uploaded successfully: ${key}`);

      return { key, url };
    } catch (error) {
      this.logger.error(`Failed to upload file: ${key}`, error);
      throw error;
    }
  }

  async getSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      const signedUrl = await getSignedUrl(this.s3Client, command, { expiresIn });
      this.logger.log(`Generated signed URL for: ${key}`);

      return signedUrl;
    } catch (error) {
      this.logger.error(`Failed to generate signed URL: ${key}`, error);
      throw error;
    }
  }

  async deleteFile(key: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      await this.s3Client.send(command);
      this.logger.log(`File deleted successfully: ${key}`);
    } catch (error) {
      this.logger.error(`Failed to delete file: ${key}`, error);
      throw error;
    }
  }

  generateFileKey(type: 'ebook' | 'audiobook' | 'cover' | 'synopsis', filename: string): string {
    const timestamp = Date.now();
    const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
    return `${type}/${timestamp}-${sanitizedFilename}`;
  }

  /**
   * Get file metadata (for Range header support)
   */
  async getFileMetadata(key: string): Promise<{ contentLength: number; contentType: string }> {
    try {
      const command = new HeadObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      const response = await this.s3Client.send(command);
      return {
        contentLength: response.ContentLength || 0,
        contentType: response.ContentType || 'application/octet-stream',
      };
    } catch (error) {
      this.logger.error(`Failed to get file metadata: ${key}`, error);
      throw error;
    }
  }

  /**
   * Stream file content directly (for secure audio streaming)
   * Supports Range headers for seeking in audio player
   */
  async streamFile(
    key: string,
    range?: { start: number; end?: number },
  ): Promise<{ stream: Readable; contentLength: number; contentType: string; contentRange?: string }> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Range: range ? `bytes=${range.start}-${range.end || ''}` : undefined,
      });

      const response = await this.s3Client.send(command);

      if (!response.Body) {
        throw new Error('No body in S3 response');
      }

      // AWS SDK v3 returns a web stream, convert to Node stream
      const stream = response.Body as Readable;
      const contentLength = response.ContentLength || 0;
      const contentType = response.ContentType || 'audio/mpeg';
      const contentRange = response.ContentRange;

      this.logger.log(`Streaming file: ${key}${range ? ` (bytes ${range.start}-${range.end || contentLength})` : ''}`);

      return {
        stream,
        contentLength,
        contentType,
        contentRange,
      };
    } catch (error) {
      this.logger.error(`Failed to stream file: ${key}`, error);
      throw error;
    }
  }

  /**
   * Extract file key from full URL
   * Useful when we store full URLs but need just the key for streaming
   */
  extractKeyFromUrl(url: string): string | null {
    if (!url) return null;

    // Handle both public URL format and direct key format
    if (url.startsWith(this.publicBaseUrl)) {
      return url.replace(`${this.publicBaseUrl}/`, '');
    }

    // If it's already a key (no http/https prefix)
    if (!url.startsWith('http')) {
      return url;
    }

    // Try to extract from any URL format
    try {
      const urlObj = new URL(url);
      // Remove leading slash
      return urlObj.pathname.replace(/^\//, '');
    } catch {
      return null;
    }
  }
}
