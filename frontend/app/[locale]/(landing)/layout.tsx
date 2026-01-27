import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { Metadata } from 'next';
import { locales, Locale, getMessages } from '@/lib/i18n';

interface LandingLayoutProps {
  children: React.ReactNode;
  params: {
    locale: string;
  };
}

// SEO metadata configuration per language
const seoContent = {
  en: {
    title: 'BookProof - Authentic Amazon Reviews for Authors',
    description:
      'Connect with verified readers to get authentic Amazon reviews for your book. Natural distribution, real readers, 14-day guarantee.',
    keywords:
      'amazon reviews, book reviews, author marketing, book promotion, authentic reviews, verified readers',
  },
  pt: {
    title: 'BookProof - Avaliações Autênticas na Amazon para Autores',
    description:
      'Conecte-se com leitores verificados para obter avaliações autênticas na Amazon para seu livro. Distribuição natural, leitores reais, garantia de 14 dias.',
    keywords:
      'avaliações amazon, resenhas de livros, marketing de autores, promoção de livros, avaliações autênticas, leitores verificados',
  },
  es: {
    title: 'BookProof - Reseñas Auténticas en Amazon para Autores',
    description:
      'Conéctate con lectores verificados para obtener reseñas auténticas en Amazon para tu libro. Distribución natural, lectores reales, garantía de 14 días.',
    keywords:
      'reseñas amazon, reseñas de libros, marketing de autores, promoción de libros, reseñas auténticas, lectores verificados',
  },
};

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const locale = params.locale as Locale;
  const content = seoContent[locale] || seoContent.en;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://bookproof.app';

  // Generate alternate language URLs for hreflang
  const languages: Record<string, string> = {};
  locales.forEach((loc) => {
    languages[loc] = `${baseUrl}/${loc}`;
  });

  return {
    title: content.title,
    description: content.description,
    keywords: content.keywords,
    openGraph: {
      title: content.title,
      description: content.description,
      url: `${baseUrl}/${locale}`,
      siteName: 'BookProof',
      locale: locale === 'pt' ? 'pt_BR' : locale === 'es' ? 'es_ES' : 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: content.title,
      description: content.description,
    },
    alternates: {
      canonical: `${baseUrl}/${locale}`,
      languages,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function LandingLayout({ children, params }: LandingLayoutProps) {
  const { locale } = params;

  if (!locales.includes(locale as Locale)) {
    notFound();
  }

  const messages = await getMessages(locale as Locale, ['common', 'landing']);

  if (!messages) {
    notFound();
  }

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <div className="flex min-h-screen flex-col">{children}</div>
    </NextIntlClientProvider>
  );
}
