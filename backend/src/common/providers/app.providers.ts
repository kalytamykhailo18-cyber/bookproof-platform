import { APP_GUARD, APP_FILTER } from '@nestjs/core';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { HttpExceptionFilter } from '@common/filters/http-exception.filter';

export const appProviders = [
  {
    provide: APP_GUARD,
    useClass: JwtAuthGuard,
  },
  {
    provide: APP_GUARD,
    useClass: RolesGuard,
  },
  {
    provide: APP_FILTER,
    useClass: HttpExceptionFilter,
  },
];
