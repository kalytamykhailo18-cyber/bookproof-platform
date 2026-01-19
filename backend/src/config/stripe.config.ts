import { registerAs } from '@nestjs/config';

export default registerAs('stripe', () => ({
  secretKey: process.env.STRIPE_SECRET_KEY,
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  prices: {
    credits25: process.env.STRIPE_PRICE_25,
    credits50: process.env.STRIPE_PRICE_50,
    credits100: process.env.STRIPE_PRICE_100,
    credits250: process.env.STRIPE_PRICE_250,
    credits500: process.env.STRIPE_PRICE_500,
    credits1000: process.env.STRIPE_PRICE_1000,
    keywordResearch: process.env.STRIPE_PRICE_KEYWORD_RESEARCH,
    subscription: process.env.STRIPE_PRICE_SUBSCRIPTION,
  },
}));
