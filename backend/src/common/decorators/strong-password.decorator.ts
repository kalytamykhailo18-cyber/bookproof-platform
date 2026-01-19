import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';
import { PasswordUtil } from '@common/utils/password.util';

/**
 * Custom validator decorator for strong password requirements
 *
 * Validates that password meets complexity requirements:
 * - Minimum 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special character
 */
export function IsStrongPassword(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isStrongPassword',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          if (typeof value !== 'string') {
            return false;
          }
          return PasswordUtil.isPasswordStrong(value);
        },
        defaultMessage(args: ValidationArguments) {
          const value = args.value as string;
          if (typeof value !== 'string') {
            return 'Password must be a string';
          }

          const result = PasswordUtil.validatePasswordComplexity(value);
          return result.errors.join('. ');
        },
      },
    });
  };
}
