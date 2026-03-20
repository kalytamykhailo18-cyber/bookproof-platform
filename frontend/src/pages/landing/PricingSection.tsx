import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Check, Zap, Star, Crown, Building2, Search, ShieldCheck, BarChart2, Bell, FileText, X, Loader2 } from 'lucide-react';
import { usePricingContent } from '@/hooks/useLandingContent';
import { submitSalesContact, Language } from '@/lib/api/landing-pages';

// Visual styling per package index
const PACKAGE_STYLES = [
  { icon: Zap,       color: '#3b82f6', animation: 'animate-fade-up-fast' },
  { icon: Star,      color: '#8b5cf6', animation: 'animate-fade-up' },
  { icon: Crown,     color: '#f59e0b', animation: 'animate-fade-up-light-slow' },
  { icon: Building2, color: '#10b981', animation: 'animate-fade-up-slow' },
  { icon: Search,    color: '#ec4899', animation: 'animate-fade-up-fast' },
];

export function PricingSection() {
  const { t, i18n } = useTranslation('pricing');
  const content = usePricingContent();

  // Contact form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    reviewsNeeded: 200,
    message: '',
  });

  const handleOpenModal = () => {
    setIsModalOpen(true);
    setSubmitSuccess(false);
    setSubmitMessage('');
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    if (submitSuccess) {
      setFormData({ name: '', email: '', reviewsNeeded: 200, message: '' });
      setSubmitSuccess(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const lang = i18n.language.toUpperCase().startsWith('PT') ? 'PT'
        : i18n.language.toUpperCase().startsWith('ES') ? 'ES'
        : 'EN';

      const response = await submitSalesContact({
        ...formData,
        language: lang as Language,
      });

      setSubmitSuccess(true);
      setSubmitMessage(response.message);
    } catch (error) {
      setSubmitMessage(t('contactForm.error', 'Failed to submit. Please try again.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section
      id="pricing"
      className="py-24 sm:py-32 relative overflow-hidden"
      style={{ background: '#f1f5f9' }}
    >
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
      >
        <div
          className="w-[800px] h-[500px] rounded-full"
          style={{ background: 'radial-gradient(ellipse, rgba(139,92,246,0.05) 0%, transparent 70%)' }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16 sm:mb-20">
          <span
            className="inline-block px-3.5 py-1.5 rounded-md text-xs font-semibold uppercase tracking-wider mb-5 animate-fade-down-fast"
            style={{ background: 'rgba(139,92,246,0.1)', color: '#7c3aed', border: '1px solid rgba(139,92,246,0.25)' }}
          >
            {content.badge}
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-5 animate-fade-up-fast">
            {content.title}
          </h2>
          <p className="text-slate-600 text-lg max-w-2xl mx-auto animate-fade-up">
            {content.subtitle}
          </p>
          {content.creditLogic && (
            <p className="text-sm text-violet-600 font-medium mt-4 animate-fade-up">
              {content.creditLogic}
            </p>
          )}
          {content.installmentNote && (
            <p className="text-sm text-emerald-600 font-semibold mt-3 animate-fade-up flex items-center justify-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
              {content.installmentNote}
            </p>
          )}
        </div>

        {/* Pricing cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-5 sm:gap-6">
          {content.packages.map((pkg, index) => {
            const style = PACKAGE_STYLES[index % PACKAGE_STYLES.length];
            const Icon = style.icon;
            const color = style.color;
            const animation = style.animation;
            const isPopular = pkg.isPopular;
            const isEnterprise = pkg.isEnterprise;
            const isKeywordTool = pkg.isKeywordTool;
            const features = Array.isArray(pkg.features) ? pkg.features : [];

            return (
              <div
                key={pkg.key}
                className={`relative landing-card-light rounded-md p-7 flex flex-col transition-transform duration-300 hover:scale-105 hover:z-10 ${animation} ${isPopular ? 'ring-2 ring-violet-400/40' : ''}`}
                style={isPopular ? { boxShadow: `0 8px 32px ${color}18` } : undefined}
              >
                {isPopular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 animate-fade-down-fast">
                    <span
                      className="px-4 py-1 rounded-md text-xs font-bold text-white whitespace-nowrap"
                      style={{ background: `linear-gradient(135deg, ${color}, #6366f1)` }}
                    >
                      {t('popular', 'Most Popular')}
                    </span>
                  </div>
                )}

                {/* Icon + name */}
                <div className="mb-6">
                  <div
                    className="inline-flex items-center justify-center w-11 h-11 rounded-md mb-5"
                    style={{ background: `${color}12`, border: `1px solid ${color}28` }}
                  >
                    <Icon className="h-5 w-5" style={{ color }} />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">{pkg.name}</h3>
                  <p className="text-sm font-semibold mt-1" style={{ color }}>
                    {pkg.credits}
                  </p>
                </div>

                {/* Key info */}
                <div className="space-y-2 mb-6 pb-6 border-b border-slate-200">
                  {isKeywordTool ? (
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {pkg.subtitle}
                    </p>
                  ) : (
                    [
                      [t('infoRow.reviews'), pkg.reviews],
                      [t('infoRow.duration'), pkg.duration],
                      [t('infoRow.validity'), pkg.validity],
                    ].map(([label, value]) => (
                      <div key={label as string} className="flex items-center justify-between">
                        <span className="text-xs text-slate-500">{label}</span>
                        <span className="text-xs font-medium text-slate-700">{value}</span>
                      </div>
                    ))
                  )}
                </div>

                {/* Features */}
                <ul className="space-y-2.5 mb-6 flex-1">
                  {features.map((feature, fi) => (
                    <li key={fi} className="flex items-start gap-2.5 animate-fade-right-fast">
                      <span
                        className="flex-shrink-0 mt-0.5 flex items-center justify-center w-4 h-4 rounded-sm"
                        style={{ background: `${color}18` }}
                      >
                        <Check className="h-2.5 w-2.5" style={{ color }} />
                      </span>
                      <span className="text-xs text-slate-600 leading-relaxed">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* Price */}
                {pkg.price && (
                  <div className="text-center mb-6">
                    <span className="text-3xl font-bold text-slate-900">{pkg.price}</span>
                    {content.installmentNote && !isEnterprise && (
                      <p className="text-xs text-emerald-600 font-medium mt-1">
                        {content.installmentNote}
                      </p>
                    )}
                  </div>
                )}

                {/* CTA */}
                {isEnterprise ? (
                  <button
                    onClick={handleOpenModal}
                    className="block w-full text-center px-4 py-3 rounded-md text-sm font-semibold transition-all duration-200 border cursor-pointer"
                    style={{ color, borderColor: `${color}35`, background: `${color}0a` }}
                  >
                    {content.enterpriseCta}
                  </button>
                ) : isKeywordTool ? (
                  <Link
                    to="/register"
                    className="block text-center px-4 py-3 rounded-md text-sm font-semibold text-white transition-all duration-200"
                    style={{ background: `linear-gradient(135deg, ${color}, #a855f7)`, boxShadow: `0 4px 16px ${color}28` }}
                  >
                    {content.ctaText}
                  </Link>
                ) : (
                  <Link
                    to="/register"
                    className="block text-center px-4 py-3 rounded-md text-sm font-semibold text-white transition-all duration-200"
                    style={isPopular
                      ? { background: `linear-gradient(135deg, ${color}, #6366f1)`, boxShadow: `0 4px 16px ${color}28` }
                      : { background: `${color}18`, border: `1px solid ${color}28`, color }}
                  >
                    {content.ctaText}
                  </Link>
                )}
              </div>
            );
          })}
        </div>

        {content.organicNote && (
          <p className="text-center text-sm text-slate-500 mt-8 animate-fade-up-very-slow">
            {content.organicNote}
          </p>
        )}

        {/* All plans include strip */}
        {content.allInclude && content.allInclude.length > 0 && (
          <div className="mt-16 sm:mt-20 landing-card-light rounded-md p-7 sm:p-8 animate-zoom-in-slow">
            <h4 className="text-sm font-semibold text-slate-900 text-center mb-7">{t('allInclude.title')}</h4>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {content.allInclude.map((label, idx) => {
                const iconData = [
                  { Icon: ShieldCheck, color: '#3b82f6', anim: 'animate-fade-up-fast' },
                  { Icon: BarChart2,   color: '#8b5cf6', anim: 'animate-fade-up' },
                  { Icon: Bell,        color: '#f59e0b', anim: 'animate-fade-up-light-slow' },
                  { Icon: FileText,    color: '#10b981', anim: 'animate-fade-up-slow' },
                ][idx % 4];
                const { Icon, color, anim } = iconData;
                return (
                <div key={idx} className={`flex items-center gap-3.5 ${anim}`}>
                  <span
                    className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-md"
                    style={{ background: `${color}12`, border: `1px solid ${color}25` }}
                  >
                    <Icon className="h-4 w-4" style={{ color }} />
                  </span>
                  <span className="text-xs text-slate-600 leading-relaxed">{label}</span>
                </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Enterprise Contact Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-white rounded-xl shadow-2xl animate-fade-up-fast">
            {/* Close button */}
            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-4 p-1 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="p-6 sm:p-8">
              {submitSuccess ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-100 flex items-center justify-center">
                    <Check className="h-8 w-8 text-emerald-600" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">
                    {t('contactForm.successTitle', 'Message Sent!')}
                  </h3>
                  <p className="text-slate-600">{submitMessage}</p>
                  <button
                    onClick={handleCloseModal}
                    className="mt-6 px-6 py-2 bg-emerald-600 text-white rounded-md font-medium hover:bg-emerald-700 transition-colors"
                  >
                    {t('contactForm.close', 'Close')}
                  </button>
                </div>
              ) : (
                <>
                  <div className="text-center mb-6">
                    <div className="w-12 h-12 mx-auto mb-4 rounded-md bg-emerald-100 flex items-center justify-center">
                      <Building2 className="h-6 w-6 text-emerald-600" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900">
                      {t('contactForm.title', 'Enterprise Inquiry')}
                    </h3>
                    <p className="text-sm text-slate-500 mt-1">
                      {t('contactForm.subtitle', 'Tell us about your needs and we\'ll create a custom package for you.')}
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        {t('contactForm.name', 'Name')} *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors"
                        placeholder={t('contactForm.namePlaceholder', 'Your full name')}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        {t('contactForm.email', 'Email')} *
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors"
                        placeholder={t('contactForm.emailPlaceholder', 'your@email.com')}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        {t('contactForm.reviewsNeeded', 'Number of Reviews Needed')} *
                      </label>
                      <input
                        type="number"
                        required
                        min={1}
                        value={formData.reviewsNeeded}
                        onChange={(e) => setFormData({ ...formData, reviewsNeeded: parseInt(e.target.value) || 200 })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        {t('contactForm.message', 'Message')} *
                      </label>
                      <textarea
                        required
                        rows={4}
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors resize-none"
                        placeholder={t('contactForm.messagePlaceholder', 'Tell us about your project...')}
                      />
                    </div>

                    {submitMessage && !submitSuccess && (
                      <p className="text-sm text-red-600">{submitMessage}</p>
                    )}

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3 bg-emerald-600 text-white rounded-md font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          {t('contactForm.sending', 'Sending...')}
                        </>
                      ) : (
                        t('contactForm.submit', 'Send Message')
                      )}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
