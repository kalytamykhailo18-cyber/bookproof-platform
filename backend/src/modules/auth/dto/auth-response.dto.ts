import { ApiProperty } from '@nestjs/swagger';
import { UserRole, Language } from '@prisma/client';

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
