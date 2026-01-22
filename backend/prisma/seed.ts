import { PrismaClient, UserRole, Language, BookFormat, CampaignStatus, AssignmentStatus, ReviewStatus, PaymentStatus, CreditTransactionType, WalletTransactionType, KeywordResearchStatus, TargetMarket, ContentPreference, AdminRole, CouponType, CouponAppliesTo, CommissionStatus, CustomPackageStatus, PackageApprovalStatus, NotificationType, NotificationPriority } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// Helper to hash passwords
async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

// Helper to generate random string
function randomString(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

// Helper to get random date in past N days
function randomPastDate(daysAgo: number): Date {
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * daysAgo));
  return date;
}

// Helper to get random future date in N days
function randomFutureDate(daysAhead: number): Date {
  const date = new Date();
  date.setDate(date.getDate() + Math.floor(Math.random() * daysAhead) + 1);
  return date;
}

async function main() {
  console.log('🌱 Starting comprehensive database seeding...\n');

  const defaultPassword = await hashPassword('Test123!');

  // ============================================
  // 1. SYSTEM SETTINGS
  // ============================================
  console.log('📋 Creating system settings...');

  const systemSettings = [
    { category: 'pricing', key: 'keyword_research_price', value: '49.99', dataType: 'number', description: 'Price for keyword research service', isPublic: true },
    { category: 'pricing', key: 'keyword_research_enabled', value: 'true', dataType: 'boolean', description: 'Enable/disable keyword research feature', isPublic: true },
    { category: 'pricing', key: 'ebook_credit_cost', value: '1', dataType: 'number', description: 'Credits per ebook review', isPublic: true },
    { category: 'pricing', key: 'audiobook_credit_cost', value: '2', dataType: 'number', description: 'Credits per audiobook review', isPublic: true },
    { category: 'reader', key: 'ebook_payout_amount', value: '2.00', dataType: 'number', description: 'Reader payout for ebook review', isPublic: false },
    { category: 'reader', key: 'audiobook_payout_amount', value: '4.00', dataType: 'number', description: 'Reader payout for audiobook review', isPublic: false },
    { category: 'reader', key: 'min_payout_amount', value: '10.00', dataType: 'number', description: 'Minimum payout request amount', isPublic: true },
    { category: 'campaign', key: 'overbooking_percent', value: '20', dataType: 'number', description: 'Default overbooking buffer percentage', isPublic: false },
    { category: 'campaign', key: 'review_deadline_hours', value: '72', dataType: 'number', description: 'Hours for reader to submit review', isPublic: true },
    { category: 'affiliate', key: 'default_commission_rate', value: '20', dataType: 'number', description: 'Default affiliate commission rate', isPublic: false },
    { category: 'affiliate', key: 'commission_pending_days', value: '14', dataType: 'number', description: 'Days before commission becomes approved', isPublic: false },
  ];

  for (const setting of systemSettings) {
    await prisma.systemSetting.upsert({
      where: { key: setting.key },
      update: setting,
      create: setting,
    });
  }
  console.log(`✓ Created ${systemSettings.length} system settings`);

  // ============================================
  // 2. PACKAGE TIERS
  // ============================================
  console.log('\n📦 Creating package tiers...');

  const packageTiers = [
    {
      name: 'Starter',
      credits: 50,
      basePrice: 49.00,
      currency: 'USD',
      validityDays: 30,
      description: 'Perfect for testing the waters with your first book',
      displayOrder: 1,
      isPopular: false,
      features: JSON.stringify([
        '50 verified reviews',
        '30 days to activate',
        '~8-10 reviews per week',
        '20% overbooking buffer included',
        'Email support',
      ]),
    },
    {
      name: 'Growth',
      credits: 150,
      basePrice: 99.00,
      currency: 'USD',
      validityDays: 90,
      description: 'Ideal for authors launching a new book',
      displayOrder: 2,
      isPopular: true,
      features: JSON.stringify([
        '150 verified reviews',
        '90 days to activate',
        '~20-25 reviews per week',
        '20% overbooking buffer included',
        'Priority support',
        'Dedicated account manager',
      ]),
    },
    {
      name: 'Professional',
      credits: 300,
      basePrice: 179.00,
      currency: 'USD',
      validityDays: 120,
      description: 'Great for building momentum and visibility',
      displayOrder: 3,
      isPopular: false,
      features: JSON.stringify([
        '300 verified reviews',
        '120 days to activate',
        '~20-25 reviews per week',
        '20% overbooking buffer included',
        'Priority support',
        'Dedicated account manager',
        'Amazon ranking optimization tips',
      ]),
    },
    {
      name: 'Enterprise',
      credits: 500,
      basePrice: 299.00,
      currency: 'USD',
      validityDays: 120,
      description: 'For publishers and high-volume authors',
      displayOrder: 4,
      isPopular: false,
      features: JSON.stringify([
        '500 verified reviews',
        '120 days to activate',
        'Fully customizable distribution',
        '20% overbooking buffer included',
        '24/7 priority support',
        'Dedicated account manager',
        'Amazon ranking optimization tips',
        'Multi-book campaign planning',
      ]),
    },
  ];

  const createdTiers: Record<string, any> = {};
  for (const tier of packageTiers) {
    const created = await prisma.packageTier.upsert({
      where: { credits: tier.credits },
      update: tier,
      create: tier,
    });
    createdTiers[tier.name] = created;
    console.log(`✓ Package tier: ${created.name} (${created.credits} credits, $${tier.basePrice})`);
  }

  // ============================================
  // 3. COUPONS
  // ============================================
  console.log('\n🎟️ Creating coupons...');

  const coupons = [
    {
      code: 'WELCOME20',
      type: CouponType.PERCENTAGE,
      appliesTo: CouponAppliesTo.CREDITS,
      discountPercent: 20.00,
      maxUses: 100,
      maxUsesPerUser: 1,
      isActive: true,
      createdBy: 'system',
      purpose: 'Welcome discount for new users',
    },
    {
      code: 'FREEKEYWORD',
      type: CouponType.FREE_ADDON,
      appliesTo: CouponAppliesTo.KEYWORD_RESEARCH,
      discountPercent: 100.00,
      maxUses: 50,
      maxUsesPerUser: 1,
      isActive: true,
      createdBy: 'system',
      purpose: 'Free keyword research promotion',
    },
    {
      code: 'SAVE10',
      type: CouponType.FIXED_AMOUNT,
      appliesTo: CouponAppliesTo.ALL,
      discountAmount: 10.00,
      minimumPurchase: 50.00,
      maxUses: null,
      maxUsesPerUser: 3,
      isActive: true,
      createdBy: 'system',
      purpose: 'General $10 off coupon',
    },
    {
      code: 'SUMMER25',
      type: CouponType.PERCENTAGE,
      appliesTo: CouponAppliesTo.CREDITS,
      discountPercent: 25.00,
      maxUses: 200,
      maxUsesPerUser: 1,
      isActive: true,
      validUntil: randomFutureDate(60),
      createdBy: 'system',
      purpose: 'Summer promotion',
    },
    {
      code: 'EXPIRED10',
      type: CouponType.PERCENTAGE,
      appliesTo: CouponAppliesTo.CREDITS,
      discountPercent: 10.00,
      maxUses: 100,
      maxUsesPerUser: 1,
      isActive: false,
      createdBy: 'system',
      purpose: 'Expired test coupon',
    },
  ];

  const createdCoupons: Record<string, any> = {};
  for (const coupon of coupons) {
    const created = await prisma.coupon.upsert({
      where: { code: coupon.code },
      update: coupon,
      create: coupon,
    });
    createdCoupons[coupon.code] = created;
    console.log(`✓ Coupon: ${created.code} (${created.type})`);
  }

  // ============================================
  // 4. ADMIN USERS
  // ============================================
  console.log('\n👑 Creating admin users...');

  const admins = [
    { email: 'superadmin@bookproof.com', name: 'Super Admin', role: AdminRole.SUPER_ADMIN },
    { email: 'admin@bookproof.com', name: 'Admin User', role: AdminRole.ADMIN },
    { email: 'moderator@bookproof.com', name: 'Mod User', role: AdminRole.MODERATOR },
    { email: 'support@bookproof.com', name: 'Support User', role: AdminRole.SUPPORT },
  ];

  const createdAdmins: Record<string, any> = {};
  for (const admin of admins) {
    const user = await prisma.user.upsert({
      where: { email: admin.email },
      update: {},
      create: {
        email: admin.email,
        passwordHash: defaultPassword,
        role: UserRole.ADMIN,
        name: admin.name,
        emailVerified: true,
        emailVerifiedAt: new Date(),
        isActive: true,
        adminProfile: {
          create: {
            role: admin.role,
            permissions: admin.role === AdminRole.SUPER_ADMIN ? ['*'] : [],
            lastLoginAt: randomPastDate(7),
          },
        },
      },
      include: { adminProfile: true },
    });
    createdAdmins[admin.email] = user;
    console.log(`✓ Admin: ${user.email} (${admin.role})`);
  }

  // ============================================
  // 5. AFFILIATE USERS
  // ============================================
  console.log('\n🤝 Creating affiliate users...');

  const affiliates = [
    { email: 'affiliate1@example.com', name: 'John Affiliate', referralCode: 'JOHN2024', isApproved: true, websiteUrl: 'https://johnreviews.com' },
    { email: 'affiliate2@example.com', name: 'Sarah Partner', referralCode: 'SARAH2024', isApproved: true, websiteUrl: 'https://bookblogger.com' },
    { email: 'affiliate3@example.com', name: 'Mike Promoter', referralCode: 'MIKE2024', isApproved: false, websiteUrl: 'https://authorhelp.com' },
    { email: 'affiliate4@example.com', name: 'Emma Influencer', referralCode: 'EMMA2024', customSlug: 'emma', isApproved: true, websiteUrl: 'https://instagram.com/emmareads' },
  ];

  const createdAffiliates: Record<string, any> = {};
  for (const aff of affiliates) {
    const user = await prisma.user.upsert({
      where: { email: aff.email },
      update: {},
      create: {
        email: aff.email,
        passwordHash: defaultPassword,
        role: UserRole.AFFILIATE,
        name: aff.name,
        emailVerified: true,
        emailVerifiedAt: new Date(),
        isActive: true,
        affiliateProfile: {
          create: {
            referralCode: aff.referralCode,
            customSlug: aff.customSlug,
            isApproved: aff.isApproved,
            approvedAt: aff.isApproved ? randomPastDate(30) : null,
            websiteUrl: aff.websiteUrl,
            commissionRate: 20.00,
            totalClicks: Math.floor(Math.random() * 500) + 50,
            totalConversions: Math.floor(Math.random() * 20),
            totalEarnings: Math.random() * 500,
            pendingEarnings: Math.random() * 100,
            approvedEarnings: Math.random() * 200,
            paidEarnings: Math.random() * 200,
          },
        },
      },
      include: { affiliateProfile: true },
    });
    createdAffiliates[aff.email] = user;
    console.log(`✓ Affiliate: ${user.email} (${aff.referralCode}, approved: ${aff.isApproved})`);
  }

  // ============================================
  // 6. CLOSER USERS
  // ============================================
  console.log('\n💼 Creating closer users...');

  const closers = [
    { email: 'closer1@bookproof.com', name: 'David Sales', commissionRate: 10.00 },
    { email: 'closer2@bookproof.com', name: 'Lisa Closer', commissionRate: 15.00 },
    { email: 'closer3@bookproof.com', name: 'Tom Enterprise', commissionRate: 12.00 },
  ];

  const createdClosers: Record<string, any> = {};
  for (const closer of closers) {
    const user = await prisma.user.upsert({
      where: { email: closer.email },
      update: {},
      create: {
        email: closer.email,
        passwordHash: defaultPassword,
        role: UserRole.CLOSER,
        name: closer.name,
        emailVerified: true,
        emailVerifiedAt: new Date(),
        isActive: true,
        closerProfile: {
          create: {
            commissionRate: closer.commissionRate,
            commissionEnabled: true,
            totalSales: Math.random() * 10000 + 1000,
            totalClients: Math.floor(Math.random() * 30) + 5,
            totalPackagesSold: Math.floor(Math.random() * 50) + 10,
            commissionEarned: Math.random() * 1000,
            commissionPaid: Math.random() * 500,
          },
        },
      },
      include: { closerProfile: true },
    });
    createdClosers[closer.email] = user;
    console.log(`✓ Closer: ${user.email} (commission: ${closer.commissionRate}%)`);
  }

  // ============================================
  // 7. AUTHOR USERS WITH PROFILES
  // ============================================
  console.log('\n✍️ Creating author users...');

  const authors = [
    { email: 'author1@example.com', name: 'Jane Writer', companyName: 'Jane Publishing', language: Language.EN, credits: 150 },
    { email: 'author2@example.com', name: 'Carlos Autor', companyName: null, language: Language.ES, credits: 50 },
    { email: 'author3@example.com', name: 'Maria Escritora', companyName: 'Editora Brasil', language: Language.PT, credits: 300 },
    { email: 'author4@example.com', name: 'Alex Novelist', companyName: null, language: Language.EN, credits: 0 },
    { email: 'author5@example.com', name: 'Sophie Bookman', companyName: 'Creative Minds Publishing', language: Language.EN, credits: 500 },
    { email: 'newauthor@example.com', name: 'New Author', companyName: null, language: Language.EN, credits: 0 },
  ];

  const createdAuthors: Record<string, any> = {};
  for (const author of authors) {
    const referredBy = Object.values(createdAffiliates)[Math.floor(Math.random() * Object.values(createdAffiliates).length)];

    const user = await prisma.user.upsert({
      where: { email: author.email },
      update: {},
      create: {
        email: author.email,
        passwordHash: defaultPassword,
        role: UserRole.AUTHOR,
        name: author.name,
        companyName: author.companyName,
        preferredLanguage: author.language,
        emailVerified: true,
        emailVerifiedAt: new Date(),
        isActive: true,
        marketingConsent: Math.random() > 0.3,
        authorProfile: {
          create: {
            availableCredits: author.credits,
            totalCreditsPurchased: author.credits + Math.floor(Math.random() * 100),
            totalCreditsUsed: Math.floor(Math.random() * 50),
            termsAccepted: true,
            termsAcceptedAt: randomPastDate(90),
            lastLoginAt: randomPastDate(7),
            referredByAffiliateId: Math.random() > 0.5 ? referredBy?.affiliateProfile?.id : null,
            referralDate: Math.random() > 0.5 ? randomPastDate(60) : null,
          },
        },
      },
      include: { authorProfile: true },
    });
    createdAuthors[author.email] = user;
    console.log(`✓ Author: ${user.email} (credits: ${author.credits})`);
  }

  // ============================================
  // 8. READER USERS WITH PROFILES
  // ============================================
  console.log('\n📖 Creating reader users...');

  const readers = [
    { email: 'reader1@example.com', name: 'Bob Reader', preference: ContentPreference.BOTH, genres: ['Fiction', 'Mystery'] },
    { email: 'reader2@example.com', name: 'Alice Bookworm', preference: ContentPreference.EBOOK, genres: ['Romance', 'Drama'] },
    { email: 'reader3@example.com', name: 'Charlie Listener', preference: ContentPreference.AUDIOBOOK, genres: ['Sci-Fi', 'Fantasy'] },
    { email: 'reader4@example.com', name: 'Diana Reviewer', preference: ContentPreference.BOTH, genres: ['Non-Fiction', 'Business'] },
    { email: 'reader5@example.com', name: 'Eve Critic', preference: ContentPreference.EBOOK, genres: ['Thriller', 'Horror'] },
    { email: 'reader6@example.com', name: 'Frank Pages', preference: ContentPreference.BOTH, genres: ['Biography', 'History'] },
    { email: 'reader7@example.com', name: 'Grace Novel', preference: ContentPreference.AUDIOBOOK, genres: ['Self-Help', 'Psychology'] },
    { email: 'reader8@example.com', name: 'Henry Tales', preference: ContentPreference.EBOOK, genres: ['Adventure', 'Action'] },
    { email: 'flaggedreader@example.com', name: 'Flagged Reader', preference: ContentPreference.EBOOK, genres: ['Fiction'], isFlagged: true },
    { email: 'suspendedreader@example.com', name: 'Suspended Reader', preference: ContentPreference.EBOOK, genres: ['Fiction'], isSuspended: true },
  ];

  const createdReaders: Record<string, any> = {};
  for (const reader of readers) {
    const user = await prisma.user.upsert({
      where: { email: reader.email },
      update: {},
      create: {
        email: reader.email,
        passwordHash: defaultPassword,
        role: UserRole.READER,
        name: reader.name,
        emailVerified: true,
        emailVerifiedAt: new Date(),
        isActive: !(reader as any).isSuspended,
        readerProfile: {
          create: {
            contentPreference: reader.preference,
            preferredGenres: reader.genres,
            walletBalance: Math.random() * 50 + 5,
            totalEarned: Math.random() * 200 + 20,
            totalWithdrawn: Math.random() * 100,
            reviewsCompleted: Math.floor(Math.random() * 30) + 5,
            reviewsExpired: Math.floor(Math.random() * 3),
            reviewsRejected: Math.floor(Math.random() * 2),
            reliabilityScore: 70 + Math.random() * 30,
            completionRate: 80 + Math.random() * 20,
            isFlagged: (reader as any).isFlagged || false,
            flagReason: (reader as any).isFlagged ? 'Suspicious review patterns' : null,
            isSuspended: (reader as any).isSuspended || false,
            suspendReason: (reader as any).isSuspended ? 'Multiple guideline violations' : null,
            lastLoginAt: randomPastDate(14),
          },
        },
      },
      include: { readerProfile: true },
    });
    createdReaders[reader.email] = user;
    console.log(`✓ Reader: ${user.email} (${reader.preference})`);

    // Create Amazon profiles for each reader (1-3 profiles)
    const numProfiles = Math.floor(Math.random() * 3) + 1;
    for (let i = 0; i < numProfiles; i++) {
      await prisma.amazonProfile.create({
        data: {
          readerProfileId: user.readerProfile!.id,
          profileUrl: `https://amazon.com/gp/profile/amzn1.account.${randomString(20)}`,
          profileName: `${reader.name.split(' ')[0]}'s Profile ${i + 1}`,
          isVerified: Math.random() > 0.3,
          verifiedAt: Math.random() > 0.3 ? randomPastDate(30) : null,
        },
      });
    }
  }

  // ============================================
  // 9. BOOKS & CAMPAIGNS
  // ============================================
  console.log('\n📚 Creating books and campaigns...');

  const books = [
    {
      authorEmail: 'author1@example.com',
      title: 'The Mystery of Silent Hill',
      authorName: 'Jane Writer',
      asin: 'B00TEST001',
      genre: 'Mystery',
      category: 'Fiction > Mystery & Thriller',
      status: CampaignStatus.ACTIVE,
      creditsAllocated: 50,
      creditsUsed: 20,
      targetReviews: 50,
      format: BookFormat.EBOOK,
    },
    {
      authorEmail: 'author1@example.com',
      title: 'Love in Paris',
      authorName: 'Jane Writer',
      asin: 'B00TEST002',
      genre: 'Romance',
      category: 'Fiction > Romance',
      status: CampaignStatus.COMPLETED,
      creditsAllocated: 30,
      creditsUsed: 30,
      targetReviews: 30,
      format: BookFormat.BOTH,
    },
    {
      authorEmail: 'author2@example.com',
      title: 'El Secreto del Mar',
      authorName: 'Carlos Autor',
      asin: 'B00TEST003',
      genre: 'Adventure',
      category: 'Fiction > Adventure',
      status: CampaignStatus.ACTIVE,
      creditsAllocated: 40,
      creditsUsed: 15,
      targetReviews: 40,
      format: BookFormat.EBOOK,
    },
    {
      authorEmail: 'author3@example.com',
      title: 'Aventuras na Amazonia',
      authorName: 'Maria Escritora',
      asin: 'B00TEST004',
      genre: 'Adventure',
      category: 'Fiction > Adventure',
      status: CampaignStatus.PENDING,
      creditsAllocated: 100,
      creditsUsed: 0,
      targetReviews: 100,
      format: BookFormat.AUDIOBOOK,
    },
    {
      authorEmail: 'author5@example.com',
      title: 'Business Success Secrets',
      authorName: 'Sophie Bookman',
      asin: 'B00TEST005',
      genre: 'Business',
      category: 'Non-Fiction > Business',
      status: CampaignStatus.ACTIVE,
      creditsAllocated: 200,
      creditsUsed: 80,
      targetReviews: 200,
      format: BookFormat.BOTH,
    },
    {
      authorEmail: 'author5@example.com',
      title: 'Leadership for Beginners',
      authorName: 'Sophie Bookman',
      asin: 'B00TEST006',
      genre: 'Self-Help',
      category: 'Non-Fiction > Self-Help',
      status: CampaignStatus.DRAFT,
      creditsAllocated: 0,
      creditsUsed: 0,
      targetReviews: 50,
      format: BookFormat.EBOOK,
    },
    {
      authorEmail: 'author4@example.com',
      title: 'The Last Kingdom',
      authorName: 'Alex Novelist',
      asin: 'B00TEST007',
      genre: 'Fantasy',
      category: 'Fiction > Fantasy',
      status: CampaignStatus.PAUSED,
      creditsAllocated: 75,
      creditsUsed: 25,
      targetReviews: 75,
      format: BookFormat.EBOOK,
    },
  ];

  const createdBooks: Record<string, any> = {};
  for (const book of books) {
    const author = createdAuthors[book.authorEmail];
    const startDate = book.status === CampaignStatus.DRAFT ? null : randomPastDate(30);

    const created = await prisma.book.create({
      data: {
        authorProfileId: author.authorProfile.id,
        title: book.title,
        authorName: book.authorName,
        asin: book.asin,
        amazonLink: `https://amazon.com/dp/${book.asin}`,
        synopsis: `This is a captivating ${book.genre.toLowerCase()} book that will keep you engaged from start to finish. ${book.title} tells the story of unforgettable characters and their journey through extraordinary circumstances.`,
        language: author.preferredLanguage,
        genre: book.genre,
        category: book.category,
        availableFormats: book.format,
        creditsAllocated: book.creditsAllocated,
        creditsUsed: book.creditsUsed,
        creditsRemaining: book.creditsAllocated - book.creditsUsed,
        targetReviews: book.targetReviews,
        reviewsPerWeek: Math.ceil(book.targetReviews / 6),
        status: book.status,
        campaignStartDate: startDate,
        expectedEndDate: startDate ? new Date(startDate.getTime() + 42 * 24 * 60 * 60 * 1000) : null,
        slug: book.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
        landingPageEnabled: book.status !== CampaignStatus.DRAFT,
        landingPageLanguages: [author.preferredLanguage],
        totalPublicViews: Math.floor(Math.random() * 500),
        totalUniqueVisitors: Math.floor(Math.random() * 300),
        coverImageUrl: `https://picsum.photos/seed/${book.asin}/300/450`,
      },
    });
    createdBooks[book.asin] = created;
    console.log(`✓ Book: ${created.title} (${book.status})`);
  }

  // ============================================
  // 10. READER ASSIGNMENTS
  // ============================================
  console.log('\n📋 Creating reader assignments...');

  const activeReaders = Object.values(createdReaders).filter(
    (r: any) => !r.readerProfile?.isFlagged && !r.readerProfile?.isSuspended
  );
  const activeBooks = Object.values(createdBooks).filter(
    (b: any) => b.status === CampaignStatus.ACTIVE || b.status === CampaignStatus.COMPLETED
  );

  let assignmentCount = 0;
  for (const book of activeBooks) {
    const numAssignments = Math.min(Math.floor(book.creditsUsed / (book.availableFormats === BookFormat.AUDIOBOOK ? 2 : 1)), activeReaders.length);

    for (let i = 0; i < numAssignments; i++) {
      const reader = activeReaders[i % activeReaders.length] as any;
      const amazonProfiles = await prisma.amazonProfile.findMany({
        where: { readerProfileId: reader.readerProfile.id },
      });

      const statuses = [
        AssignmentStatus.COMPLETED,
        AssignmentStatus.VALIDATED,
        AssignmentStatus.SUBMITTED,
        AssignmentStatus.IN_PROGRESS,
        AssignmentStatus.APPROVED,
        AssignmentStatus.WAITING,
      ];
      const status = book.status === CampaignStatus.COMPLETED
        ? AssignmentStatus.COMPLETED
        : statuses[Math.floor(Math.random() * statuses.length)];

      const materialsReleased = status !== AssignmentStatus.WAITING;
      const materialsReleasedAt = materialsReleased ? randomPastDate(14) : null;

      await prisma.readerAssignment.create({
        data: {
          bookId: book.id,
          readerProfileId: reader.readerProfile.id,
          status,
          formatAssigned: book.availableFormats === BookFormat.BOTH
            ? (Math.random() > 0.5 ? BookFormat.EBOOK : BookFormat.AUDIOBOOK)
            : book.availableFormats,
          creditsValue: book.availableFormats === BookFormat.AUDIOBOOK ? 2 : 1,
          amazonProfileId: amazonProfiles.length > 0 ? amazonProfiles[0].id : null,
          queuePosition: status === AssignmentStatus.WAITING ? i + 1 : null,
          scheduledWeek: Math.ceil((i + 1) / 5),
          materialsReleasedAt,
          deadlineAt: materialsReleasedAt
            ? new Date(materialsReleasedAt.getTime() + 72 * 60 * 60 * 1000)
            : null,
          completedAt: status === AssignmentStatus.COMPLETED ? randomPastDate(7) : null,
        },
      });
      assignmentCount++;
    }
  }
  console.log(`✓ Created ${assignmentCount} reader assignments`);

  // ============================================
  // 11. REVIEWS
  // ============================================
  console.log('\n⭐ Creating reviews...');

  const submittedAssignments = await prisma.readerAssignment.findMany({
    where: {
      status: {
        in: [AssignmentStatus.SUBMITTED, AssignmentStatus.VALIDATED, AssignmentStatus.COMPLETED],
      },
    },
    include: { readerProfile: true, book: true },
  });

  let reviewCount = 0;
  for (const assignment of submittedAssignments) {
    const amazonProfiles = await prisma.amazonProfile.findMany({
      where: { readerProfileId: assignment.readerProfileId },
    });

    const rating = Math.floor(Math.random() * 2) + 4; // 4 or 5 stars mostly
    const status = assignment.status === AssignmentStatus.SUBMITTED
      ? ReviewStatus.SUBMITTED
      : assignment.status === AssignmentStatus.VALIDATED
        ? ReviewStatus.VALIDATED
        : ReviewStatus.VALIDATED;

    await prisma.review.create({
      data: {
        readerAssignmentId: assignment.id,
        bookId: assignment.bookId,
        readerProfileId: assignment.readerProfileId,
        amazonProfileId: amazonProfiles.length > 0 ? amazonProfiles[0].id : null,
        amazonReviewLink: `https://amazon.com/review/${randomString(15)}`,
        internalRating: rating,
        internalFeedback: `I really enjoyed reading "${assignment.book.title}". The story was engaging and well-written. I would recommend it to fans of ${assignment.book.genre}.`,
        publishedOnAmazon: true,
        completedContent: true,
        percentageCompleted: 100,
        status,
        validatedAt: status === ReviewStatus.VALIDATED ? randomPastDate(3) : null,
        submittedAt: randomPastDate(5),
        compensationPaid: status === ReviewStatus.VALIDATED,
        compensationAmount: assignment.formatAssigned === BookFormat.AUDIOBOOK ? 4.00 : 2.00,
        compensationPaidAt: status === ReviewStatus.VALIDATED ? randomPastDate(2) : null,
      },
    });
    reviewCount++;
  }
  console.log(`✓ Created ${reviewCount} reviews`);

  // ============================================
  // 12. CREDIT PURCHASES
  // ============================================
  console.log('\n💳 Creating credit purchases...');

  const purchaseAuthors = Object.values(createdAuthors).filter((a: any) => a.authorProfile.totalCreditsPurchased > 0);
  let purchaseCount = 0;

  for (const author of purchaseAuthors as any[]) {
    const numPurchases = Math.floor(Math.random() * 3) + 1;

    for (let i = 0; i < numPurchases; i++) {
      const tier = Object.values(createdTiers)[Math.floor(Math.random() * Object.values(createdTiers).length)] as any;
      const purchaseDate = randomPastDate(90);
      const activationExpires = new Date(purchaseDate);
      activationExpires.setDate(activationExpires.getDate() + tier.validityDays);

      await prisma.creditPurchase.create({
        data: {
          authorProfileId: author.authorProfile.id,
          packageTierId: tier.id,
          credits: tier.credits,
          amountPaid: tier.basePrice,
          baseAmount: tier.basePrice,
          currency: 'USD',
          validityDays: tier.validityDays,
          purchaseDate,
          activationWindowExpiresAt: activationExpires,
          activated: Math.random() > 0.3,
          activatedAt: Math.random() > 0.3 ? randomPastDate(30) : null,
          paymentStatus: PaymentStatus.COMPLETED,
          paymentMethod: 'card',
          stripePaymentId: `pi_${randomString(24)}`,
        },
      });
      purchaseCount++;
    }
  }
  console.log(`✓ Created ${purchaseCount} credit purchases`);

  // ============================================
  // 13. CREDIT TRANSACTIONS
  // ============================================
  console.log('\n💰 Creating credit transactions...');

  let txCount = 0;
  for (const author of purchaseAuthors as any[]) {
    // Purchase transaction
    await prisma.creditTransaction.create({
      data: {
        authorProfileId: author.authorProfile.id,
        amount: 50,
        type: CreditTransactionType.PURCHASE,
        description: 'Credit package purchase',
        balanceAfter: author.authorProfile.availableCredits,
      },
    });
    txCount++;

    // Allocation transaction
    if (author.authorProfile.totalCreditsUsed > 0) {
      await prisma.creditTransaction.create({
        data: {
          authorProfileId: author.authorProfile.id,
          amount: -20,
          type: CreditTransactionType.ALLOCATION,
          description: 'Credits allocated to campaign',
          balanceAfter: author.authorProfile.availableCredits,
        },
      });
      txCount++;
    }
  }
  console.log(`✓ Created ${txCount} credit transactions`);

  // ============================================
  // 14. WALLET TRANSACTIONS
  // ============================================
  console.log('\n👛 Creating wallet transactions...');

  let walletTxCount = 0;
  for (const reader of Object.values(createdReaders) as any[]) {
    if (reader.readerProfile.totalEarned > 0) {
      const numTx = Math.floor(Math.random() * 5) + 2;
      let balance = 0;

      for (let i = 0; i < numTx; i++) {
        const amount = 2 + Math.random() * 2;
        balance += amount;

        await prisma.walletTransaction.create({
          data: {
            readerProfileId: reader.readerProfile.id,
            amount,
            type: WalletTransactionType.EARNING,
            description: 'Review compensation',
            balanceBefore: balance - amount,
            balanceAfter: balance,
          },
        });
        walletTxCount++;
      }
    }
  }
  console.log(`✓ Created ${walletTxCount} wallet transactions`);

  // ============================================
  // 15. KEYWORD RESEARCH ORDERS
  // ============================================
  console.log('\n🔍 Creating keyword research orders...');

  const keywordOrders = [
    { authorEmail: 'author1@example.com', title: 'The Mystery of Silent Hill', status: KeywordResearchStatus.COMPLETED, paid: true },
    { authorEmail: 'author2@example.com', title: 'El Secreto del Mar', status: KeywordResearchStatus.PROCESSING, paid: true },
    { authorEmail: 'author3@example.com', title: 'Aventuras na Amazonia', status: KeywordResearchStatus.PENDING, paid: false },
    { authorEmail: 'author5@example.com', title: 'Business Success Secrets', status: KeywordResearchStatus.COMPLETED, paid: true },
  ];

  for (const order of keywordOrders) {
    const author = createdAuthors[order.authorEmail];

    await prisma.keywordResearch.create({
      data: {
        authorProfileId: author.authorProfile.id,
        bookTitle: order.title,
        genre: 'Fiction',
        category: 'Fiction > General',
        description: `A compelling story about ${order.title.toLowerCase()}. This book explores themes of adventure, mystery, and personal growth.`,
        targetAudience: 'Adults who enjoy engaging fiction with well-developed characters and compelling plots.',
        bookLanguage: author.preferredLanguage,
        targetMarket: author.preferredLanguage === Language.PT ? TargetMarket.BR : TargetMarket.US,
        status: order.status,
        price: 49.99,
        paid: order.paid,
        paidAt: order.paid ? randomPastDate(14) : null,
        processingStartedAt: order.status !== KeywordResearchStatus.PENDING ? randomPastDate(7) : null,
        completedAt: order.status === KeywordResearchStatus.COMPLETED ? randomPastDate(3) : null,
        primaryKeywords: order.status === KeywordResearchStatus.COMPLETED
          ? JSON.stringify(['keyword1', 'keyword2', 'keyword3', 'keyword4', 'keyword5'])
          : null,
        secondaryKeywords: order.status === KeywordResearchStatus.COMPLETED
          ? JSON.stringify(['secondary1', 'secondary2', 'secondary3'])
          : null,
        longTailKeywords: order.status === KeywordResearchStatus.COMPLETED
          ? JSON.stringify(['long tail keyword 1', 'long tail keyword 2'])
          : null,
        pdfUrl: order.status === KeywordResearchStatus.COMPLETED
          ? `https://storage.example.com/keywords/${randomString(20)}.pdf`
          : null,
      },
    });
    console.log(`✓ Keyword research: ${order.title} (${order.status})`);
  }

  // ============================================
  // 16. CUSTOM PACKAGES & INVOICES
  // ============================================
  console.log('\n📄 Creating custom packages and invoices...');

  const closer = Object.values(createdClosers)[0] as any;

  const customPackages = [
    { clientName: 'Big Publisher Inc', clientEmail: 'publisher@bigpub.com', credits: 1000, price: 599.99, status: CustomPackageStatus.PAID },
    { clientName: 'Indie Author Joe', clientEmail: 'joe@indie.com', credits: 250, price: 149.99, status: CustomPackageStatus.SENT },
    { clientName: 'Small Press LLC', clientEmail: 'contact@smallpress.com', credits: 500, price: 299.99, status: CustomPackageStatus.PENDING_APPROVAL },
  ];

  for (const pkg of customPackages) {
    const customPkg = await prisma.customPackage.create({
      data: {
        closerProfileId: closer.closerProfile.id,
        packageName: `Custom Package for ${pkg.clientName}`,
        description: `Special package with ${pkg.credits} credits`,
        credits: pkg.credits,
        price: pkg.price,
        validityDays: 120,
        clientName: pkg.clientName,
        clientEmail: pkg.clientEmail,
        status: pkg.status,
        approvalRequired: pkg.status === CustomPackageStatus.PENDING_APPROVAL,
        approvalStatus: pkg.status === CustomPackageStatus.PENDING_APPROVAL
          ? PackageApprovalStatus.PENDING
          : PackageApprovalStatus.NOT_REQUIRED,
        paymentLink: pkg.status !== CustomPackageStatus.PENDING_APPROVAL
          ? `https://checkout.stripe.com/pay/${randomString(20)}`
          : null,
        sentAt: pkg.status !== CustomPackageStatus.PENDING_APPROVAL ? randomPastDate(7) : null,
      },
    });

    if (pkg.status === CustomPackageStatus.PAID) {
      await prisma.invoice.create({
        data: {
          closerProfileId: closer.closerProfile.id,
          customPackageId: customPkg.id,
          invoiceNumber: `INV-${randomString(8)}`,
          amount: pkg.price,
          description: `Invoice for ${pkg.clientName}`,
          paymentStatus: PaymentStatus.COMPLETED,
          paidAt: randomPastDate(3),
          stripePaymentId: `pi_${randomString(24)}`,
        },
      });
    }
    console.log(`✓ Custom package: ${pkg.clientName} (${pkg.status})`);
  }

  // ============================================
  // 17. AFFILIATE REFERRALS & COMMISSIONS
  // ============================================
  console.log('\n📊 Creating affiliate referrals and commissions...');

  const approvedAffiliate = Object.values(createdAffiliates).find((a: any) => a.affiliateProfile?.isApproved) as any;

  if (approvedAffiliate) {
    // Create referrals
    const referredAuthors = Object.values(createdAuthors).slice(0, 3) as any[];

    for (const author of referredAuthors) {
      await prisma.affiliateReferral.create({
        data: {
          affiliateProfileId: approvedAffiliate.affiliateProfile.id,
          referredAuthorId: author.authorProfile.id,
          registeredAt: randomPastDate(60),
          firstPurchaseAt: Math.random() > 0.3 ? randomPastDate(30) : null,
          ipAddress: '192.168.1.' + Math.floor(Math.random() * 255),
        },
      });
    }
    console.log(`✓ Created ${referredAuthors.length} affiliate referrals`);

    // Create commissions
    const purchases = await prisma.creditPurchase.findMany({
      where: { paymentStatus: PaymentStatus.COMPLETED },
      take: 3,
    });

    for (const purchase of purchases) {
      const commissionAmount = Number(purchase.amountPaid) * 0.2; // 20% commission

      await prisma.affiliateCommission.create({
        data: {
          affiliateProfileId: approvedAffiliate.affiliateProfile.id,
          creditPurchaseId: purchase.id,
          referredAuthorId: purchase.authorProfileId,
          purchaseAmount: purchase.amountPaid,
          commissionAmount,
          commissionRate: 20.00,
          status: Math.random() > 0.5 ? CommissionStatus.APPROVED : CommissionStatus.PENDING,
          pendingUntil: randomFutureDate(14),
        },
      });
    }
    console.log(`✓ Created ${purchases.length} affiliate commissions`);

    // Create clicks
    for (let i = 0; i < 20; i++) {
      await prisma.affiliateClick.create({
        data: {
          affiliateProfileId: approvedAffiliate.affiliateProfile.id,
          ipAddress: '192.168.1.' + Math.floor(Math.random() * 255),
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          landingPage: '/',
          cookieSet: true,
          cookieId: randomString(32),
          converted: Math.random() > 0.8,
          convertedAt: Math.random() > 0.8 ? randomPastDate(7) : null,
        },
      });
    }
    console.log('✓ Created 20 affiliate clicks');
  }

  // ============================================
  // 18. NOTIFICATIONS
  // ============================================
  console.log('\n🔔 Creating notifications...');

  const allUsers = [
    ...Object.values(createdAuthors),
    ...Object.values(createdReaders),
    ...Object.values(createdAdmins),
  ] as any[];

  let notifCount = 0;
  for (const user of allUsers.slice(0, 10)) {
    const numNotifs = Math.floor(Math.random() * 5) + 1;

    for (let i = 0; i < numNotifs; i++) {
      await prisma.notification.create({
        data: {
          userId: user.id,
          type: Object.values(NotificationType)[Math.floor(Math.random() * Object.values(NotificationType).length)],
          title: `Notification ${i + 1}`,
          message: 'This is a sample notification message for testing purposes.',
          priority: Object.values(NotificationPriority)[Math.floor(Math.random() * Object.values(NotificationPriority).length)],
          isRead: Math.random() > 0.5,
          readAt: Math.random() > 0.5 ? randomPastDate(3) : null,
        },
      });
      notifCount++;
    }
  }
  console.log(`✓ Created ${notifCount} notifications`);

  // ============================================
  // 19. LANDING PAGE LEADS
  // ============================================
  console.log('\n📧 Creating landing page leads...');

  const leads = [
    { email: 'lead1@example.com', name: 'Potential Author 1', userType: 'author', converted: false },
    { email: 'lead2@example.com', name: 'Potential Reader 2', userType: 'reader', converted: false },
    { email: 'lead3@example.com', name: 'Interested Writer', userType: 'author', converted: true },
    { email: 'lead4@example.com', name: 'Book Lover', userType: 'reader', converted: false },
    { email: 'lead5@example.com', name: 'Publisher Contact', userType: 'author', converted: false },
  ];

  for (const lead of leads) {
    await prisma.landingPageLead.create({
      data: {
        email: lead.email,
        name: lead.name,
        language: Language.EN,
        userType: lead.userType,
        source: 'google',
        medium: 'cpc',
        marketingConsent: true,
        consentedAt: new Date(),
        welcomeEmailSent: true,
        welcomeEmailSentAt: randomPastDate(7),
        converted: lead.converted,
        convertedAt: lead.converted ? randomPastDate(3) : null,
      },
    });
  }
  console.log(`✓ Created ${leads.length} landing page leads`);

  // ============================================
  // 20. PAYOUT REQUESTS
  // ============================================
  console.log('\n💸 Creating payout requests...');

  const readersWithBalance = Object.values(createdReaders).filter(
    (r: any) => r.readerProfile?.walletBalance > 10
  ) as any[];

  for (const reader of readersWithBalance.slice(0, 3)) {
    await prisma.payoutRequest.create({
      data: {
        readerProfileId: reader.readerProfile.id,
        amount: Math.min(reader.readerProfile.walletBalance, 20),
        paymentMethod: 'PayPal',
        paymentDetails: JSON.stringify({ email: reader.email }),
      },
    });
  }
  console.log(`✓ Created ${Math.min(readersWithBalance.length, 3)} payout requests`);

  // ============================================
  // SUMMARY
  // ============================================
  console.log('\n' + '='.repeat(50));
  console.log('🌱 SEEDING COMPLETED SUCCESSFULLY!');
  console.log('='.repeat(50));
  console.log('\n📊 Summary:');
  console.log(`   - System Settings: ${systemSettings.length}`);
  console.log(`   - Package Tiers: ${packageTiers.length}`);
  console.log(`   - Coupons: ${coupons.length}`);
  console.log(`   - Admin Users: ${admins.length}`);
  console.log(`   - Affiliate Users: ${affiliates.length}`);
  console.log(`   - Closer Users: ${closers.length}`);
  console.log(`   - Author Users: ${authors.length}`);
  console.log(`   - Reader Users: ${readers.length}`);
  console.log(`   - Books/Campaigns: ${books.length}`);
  console.log(`   - Reader Assignments: ${assignmentCount}`);
  console.log(`   - Reviews: ${reviewCount}`);
  console.log(`   - Credit Purchases: ${purchaseCount}`);
  console.log(`   - Credit Transactions: ${txCount}`);
  console.log(`   - Wallet Transactions: ${walletTxCount}`);
  console.log(`   - Keyword Research Orders: ${keywordOrders.length}`);
  console.log(`   - Custom Packages: ${customPackages.length}`);
  console.log(`   - Notifications: ${notifCount}`);
  console.log(`   - Landing Page Leads: ${leads.length}`);

  console.log('\n🔐 Default Credentials:');
  console.log('   Email: superadmin@bookproof.com');
  console.log('   Password: Test123!');
  console.log('\n   (Same password for all seeded users)');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
