import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@common/prisma/prisma.service';
import { Request } from 'express';

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  tokenVersion?: number; // Used to invalidate all sessions on password reset
}

/**
 * Custom JWT extractor that tries multiple sources:
 * 1. Authorization header (Bearer token) - primary method
 * 2. Query parameter 'token' - for file streaming endpoints
 *
 * The query parameter is needed because:
 * - HTML5 <audio> elements cannot send Authorization headers
 * - Browser-based file downloads open in new tabs without headers
 *
 * Per Section 11.2: Secure file access requires JWT validation
 * for ebook, audiobook, and synopsis streaming.
 */
function extractJwtFromHeaderOrQuery(req: Request): string | null {
  // First try the Authorization header (preferred)
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  // Then try query parameter (for file streaming endpoints only)
  // Only allow for specific streaming endpoints for security (Section 11.3)
  const queryToken = req.query?.token as string;
  if (queryToken) {
    const path = req.path || '';
    // Allow token from query params for all secure streaming endpoints
    if (
      path.includes('stream-audio') ||
      path.includes('stream-ebook') ||
      path.includes('stream-synopsis')
    ) {
      return queryToken;
    }
  }

  return null;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: extractJwtFromHeaderOrQuery,
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('jwt.secret'),
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: {
        authorProfile: true,
        readerProfile: true,
        affiliateProfile: true,
        adminProfile: true, // Include admin profile for role-based access control (Section 5.1, 5.5)
      },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('User not found or inactive');
    }

    // Check tokenVersion to invalidate sessions after password reset
    // Per requirements.md Section 1.6: All sessions invalidated on password reset
    const payloadTokenVersion = payload.tokenVersion ?? 0;
    const userTokenVersion = user.tokenVersion ?? 0;
    if (payloadTokenVersion !== userTokenVersion) {
      throw new UnauthorizedException('Session expired. Please log in again.');
    }

    return {
      id: user.id,
      userId: user.id, // Alias for id
      email: user.email,
      role: user.role,
      name: user.name,
      emailVerified: user.emailVerified,
      authorProfileId: user.authorProfile?.id,
      readerProfileId: user.readerProfile?.id,
      affiliateProfileId: user.affiliateProfile?.id,
      adminProfileId: user.adminProfile?.id,
      profileId: user.authorProfile?.id || user.readerProfile?.id || user.affiliateProfile?.id || user.adminProfile?.id,
      // Terms acceptance for authors (especially those created by Closers)
      termsAccepted: user.authorProfile?.termsAccepted ?? true, // Default true for non-authors
      accountCreatedByCloser: user.authorProfile?.accountCreatedByCloser ?? false,
      // Admin role for role-based access control (Section 5.1, 5.5)
      // SUPER_ADMIN can access financial data, Regular ADMIN cannot
      adminRole: user.adminProfile?.role,
      adminPermissions: user.adminProfile?.permissions || [],
    };
  }
}
