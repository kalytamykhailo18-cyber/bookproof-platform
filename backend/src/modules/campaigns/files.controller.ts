import {
  Controller,
  Post,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Param,
  Req,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { Request } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { FilesService } from '@modules/files/files.service';
import { FileValidationUtil } from '@common/utils/file-validation.util';
import { CampaignsService } from './campaigns.service';
import { CampaignResponseDto } from './dto';

/**
 * Extracts duration from MP3 file buffer by parsing the ID3/MP3 frame headers
 * Returns duration in seconds, or 0 if extraction fails
 */
function extractMp3Duration(buffer: Buffer): number {
  try {
    // Skip ID3v2 tag if present
    let offset = 0;
    if (buffer.length > 10 && buffer.slice(0, 3).toString() === 'ID3') {
      // ID3v2 header size is stored in 4 bytes (syncsafe integer)
      const size =
        ((buffer[6] & 0x7f) << 21) |
        ((buffer[7] & 0x7f) << 14) |
        ((buffer[8] & 0x7f) << 7) |
        (buffer[9] & 0x7f);
      offset = 10 + size;
    }

    // MP3 bitrate lookup tables (kbps)
    const bitrateTable = {
      // MPEG1 Layer 3
      v1l3: [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320],
      // MPEG2 Layer 3
      v2l3: [0, 8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 144, 160],
    };

    // Sample rate lookup (Hz)
    const sampleRateTable = {
      v1: [44100, 48000, 32000],
      v2: [22050, 24000, 16000],
      v25: [11025, 12000, 8000],
    };

    // Find first valid MP3 frame header
    let frames = 0;
    let totalBitrate = 0;
    let sampleRate = 44100; // Default
    let samplesPerFrame = 1152; // Default for MPEG1 Layer 3

    while (offset < buffer.length - 4 && frames < 100) {
      // Look for sync word (0xFF followed by 0xE? or 0xF?)
      if (buffer[offset] === 0xff && (buffer[offset + 1] & 0xe0) === 0xe0) {
        const header = buffer.readUInt32BE(offset);

        // Parse version
        const versionBits = (header >> 19) & 0x03;
        const layerBits = (header >> 17) & 0x03;
        const bitrateIndex = (header >> 12) & 0x0f;
        const sampleRateIndex = (header >> 10) & 0x03;

        if (bitrateIndex > 0 && bitrateIndex < 15 && sampleRateIndex < 3 && layerBits === 1) {
          // Layer 3
          let bitrate: number;
          let sr: number;

          if (versionBits === 3) {
            // MPEG1
            bitrate = bitrateTable.v1l3[bitrateIndex];
            sr = sampleRateTable.v1[sampleRateIndex];
            samplesPerFrame = 1152;
          } else if (versionBits === 2) {
            // MPEG2
            bitrate = bitrateTable.v2l3[bitrateIndex];
            sr = sampleRateTable.v2[sampleRateIndex];
            samplesPerFrame = 576;
          } else if (versionBits === 0) {
            // MPEG2.5
            bitrate = bitrateTable.v2l3[bitrateIndex];
            sr = sampleRateTable.v25[sampleRateIndex];
            samplesPerFrame = 576;
          } else {
            offset++;
            continue;
          }

          if (bitrate > 0 && sr > 0) {
            totalBitrate += bitrate;
            sampleRate = sr;
            frames++;

            // Calculate frame size and skip to next frame
            const padding = (header >> 9) & 0x01;
            const frameSize = Math.floor((samplesPerFrame / 8 * bitrate * 1000) / sr) + padding;
            offset += frameSize;
            continue;
          }
        }
      }
      offset++;
    }

    if (frames > 0) {
      const avgBitrate = totalBitrate / frames;
      // Calculate duration: file size / (bitrate / 8)
      const audioBytesEstimate = buffer.length * 0.95; // Assume 95% is audio data
      const duration = (audioBytesEstimate * 8) / (avgBitrate * 1000);
      return Math.round(duration);
    }

    // Fallback: estimate based on file size and typical bitrate
    // Assume 128kbps as default
    return Math.round((buffer.length * 8) / (128 * 1000));
  } catch (error) {
    // Return 0 if extraction fails
    return 0;
  }
}

@ApiTags('Campaign Files')
@Controller('campaigns/:id/files')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.AUTHOR)
@ApiBearerAuth()
export class CampaignFilesController {
  private readonly logger = new Logger(CampaignFilesController.name);

  // Max file sizes from env or defaults
  private readonly maxEbookSize = parseInt(
    process.env.MAX_EBOOK_SIZE_MB || '100',
    10,
  ) * 1024 * 1024; // 100MB default
  private readonly maxAudiobookSize = parseInt(
    process.env.MAX_AUDIOBOOK_SIZE_MB || '500',
    10,
  ) * 1024 * 1024; // 500MB default
  private readonly maxCoverSize = 5 * 1024 * 1024; // 5MB
  private readonly maxSynopsisSize = 10 * 1024 * 1024; // 10MB for PDF synopsis

  constructor(
    private readonly filesService: FilesService,
    private readonly campaignsService: CampaignsService,
  ) {}

  @Post('ebook')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload ebook file (PDF/EPUB/MOBI)' })
  @ApiConsumes('multipart/form-data')
  @ApiParam({ name: 'id', description: 'Campaign ID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Ebook file: PDF, EPUB, or MOBI (max 50MB)',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Ebook uploaded successfully',
    type: CampaignResponseDto,
  })
  async uploadEbook(
    @Req() req: Request,
    @Param('id') campaignId: string,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<CampaignResponseDto> {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    // Validate file type
    const allowedMimeTypes = ['application/pdf', 'application/epub+zip'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        'Invalid file type. Only PDF and EPUB are allowed.',
      );
    }

    // Validate file size
    if (file.size > this.maxEbookSize) {
      throw new BadRequestException(
        `File too large. Maximum size is ${this.maxEbookSize / 1024 / 1024}MB`,
      );
    }

    // Generate file key and upload
    const fileKey = this.filesService.generateFileKey('ebook', file.originalname);
    const { url } = await this.filesService.uploadFile(
      file.buffer,
      fileKey,
      file.mimetype,
    );

    // Update campaign with ebook URL
    return this.campaignsService.updateCampaignFiles(
      campaignId,
      req.user!.authorProfileId!,
      {
        ebookFileUrl: url,
        ebookFileName: file.originalname,
        ebookFileSize: file.size,
      },
    );
  }

  @Post('audiobook')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 550 * 1024 * 1024, // 550MB to accommodate 500MB+ files
      },
    }),
  )
  @ApiOperation({ summary: 'Upload audiobook file (MP3)' })
  @ApiConsumes('multipart/form-data')
  @ApiParam({ name: 'id', description: 'Campaign ID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        duration: {
          type: 'number',
          description: 'Audiobook duration in seconds',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Audiobook uploaded successfully',
    type: CampaignResponseDto,
  })
  async uploadAudiobook(
    @Req() req: Request,
    @Param('id') campaignId: string,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<CampaignResponseDto> {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    // Validate file type
    if (file.mimetype !== 'audio/mpeg' && file.mimetype !== 'audio/mp3') {
      throw new BadRequestException('Invalid file type. Only MP3 is allowed.');
    }

    // Validate file size
    if (file.size > this.maxAudiobookSize) {
      throw new BadRequestException(
        `File too large. Maximum size is ${this.maxAudiobookSize / 1024 / 1024}MB`,
      );
    }

    // Generate file key and upload
    const fileKey = this.filesService.generateFileKey(
      'audiobook',
      file.originalname,
    );
    const { url } = await this.filesService.uploadFile(
      file.buffer,
      fileKey,
      file.mimetype,
    );

    // Extract audio duration from MP3 file
    const duration = extractMp3Duration(file.buffer);

    // Update campaign with audiobook URL
    return this.campaignsService.updateCampaignFiles(
      campaignId,
      req.user!.authorProfileId!,
      {
        audioBookFileUrl: url,
        audioBookFileName: file.originalname,
        audioBookFileSize: file.size,
        audioBookDuration: duration,
      },
    );
  }

  @Post('cover')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload book cover image' })
  @ApiConsumes('multipart/form-data')
  @ApiParam({ name: 'id', description: 'Campaign ID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Cover image uploaded successfully',
    type: CampaignResponseDto,
  })
  async uploadCover(
    @Req() req: Request,
    @Param('id') campaignId: string,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<CampaignResponseDto> {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    // Validate file type
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        'Invalid file type. Only JPEG, PNG, and WebP are allowed.',
      );
    }

    // Validate file size
    if (file.size > this.maxCoverSize) {
      throw new BadRequestException(
        `File too large. Maximum size is ${this.maxCoverSize / 1024 / 1024}MB`,
      );
    }

    // Generate file key and upload
    const fileKey = this.filesService.generateFileKey('cover', file.originalname);
    const { url } = await this.filesService.uploadFile(
      file.buffer,
      fileKey,
      file.mimetype,
    );

    // Update campaign with cover URL
    return this.campaignsService.updateCampaignFiles(
      campaignId,
      req.user!.authorProfileId!,
      {
        coverImageUrl: url,
      },
    );
  }

  /**
   * Upload synopsis PDF document
   *
   * Per requirements:
   * - Synopsis can be PDF or text document
   * - Maximum length: 3 pages (~10MB for PDF)
   * - Created by author during campaign creation
   * - Provided to every reader alongside ebook/audiobook
   */
  @Post('synopsis')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload synopsis document (PDF, DOC, DOCX, TXT)' })
  @ApiConsumes('multipart/form-data')
  @ApiParam({ name: 'id', description: 'Campaign ID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Synopsis document: PDF, DOC, DOCX, or TXT (max 10MB, max 3 pages)',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Synopsis document uploaded successfully',
    type: CampaignResponseDto,
  })
  async uploadSynopsis(
    @Req() req: Request,
    @Param('id') campaignId: string,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<CampaignResponseDto> {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    // Validate file type - PDF, DOC, DOCX, TXT allowed (Section 11.1)
    FileValidationUtil.validateSynopsis(file);

    // Generate file key and upload
    const fileKey = this.filesService.generateFileKey('synopsis', file.originalname);
    const { url } = await this.filesService.uploadFile(
      file.buffer,
      fileKey,
      file.mimetype,
    );

    this.logger.log(`Synopsis document uploaded for campaign ${campaignId}: ${file.originalname}`);

    // Update campaign with synopsis file URL
    return this.campaignsService.updateCampaignFiles(
      campaignId,
      req.user!.authorProfileId!,
      {
        synopsisFileUrl: url,
        synopsisFileName: file.originalname,
      },
    );
  }
}
