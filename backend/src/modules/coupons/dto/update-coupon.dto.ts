import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateCouponDto } from './create-coupon.dto';

export class UpdateCouponDto extends PartialType(
  OmitType(CreateCouponDto, ['code'] as const),
) {
  // All fields from CreateCouponDto are optional except 'code'
  // Code cannot be updated once created
}
