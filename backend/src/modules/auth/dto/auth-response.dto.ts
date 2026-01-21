import { ApiProperty } from '@nestjs/swagger';
import { UserRole, Language, AdminRole } from '@prisma/client';

export class UserDataDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ enum: UserRole })
  role: UserRole;

  @ApiProperty({ enum: Language })
  preferredLanguage: Language;

  @ApiProperty()
  preferredCurrency: string;

  @ApiProperty()
  emailVerified: boolean;

  @ApiProperty({ required: false })
  photo?: string;

  @ApiProperty({ required: false })
  country?: string;

  @ApiProperty({ description: 'Whether the user has accepted the terms of service (for authors)', required: false })
  termsAccepted?: boolean;

  @ApiProperty({ description: 'Whether the account was created by a Closer (sales team)', required: false })
  accountCreatedByCloser?: boolean;

  @ApiProperty({ enum: AdminRole, description: 'Admin role level for access control (Section 5.1, 5.5)', required: false })
  adminRole?: AdminRole;

  @ApiProperty({ type: [String], description: 'Granular permissions for admins', required: false })
  adminPermissions?: string[];
}

export class AuthResponseDto {
  @ApiProperty()
  accessToken: string;

  @ApiProperty()
  user: UserDataDto;
}

export class MessageResponseDto {
  @ApiProperty()
  message: string;
}
