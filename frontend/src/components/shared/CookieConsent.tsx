import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Cookie, Settings, X } from 'lucide-react';

/**
 * Cookie consent types
 */
export interface CookiePreferences {
  essential: boolean; // Always true, cannot be disabled
  functional: boolean; // Language, theme preferences
  analytics: boolean; // Google Analytics, Plausible
  marketing: boolean; // Affiliate tracking
  consentedAt?: string;
}

const COOKIE_CONSENT_KEY = 'bp_cookie_consent';
const DEFAULT_PREFERENCES: CookiePreferences = {
  essential: true,
  functional: true,
  analytics: false,
  marketing: false,
};

/**
 * Cookie Consent Banner Component
 *
 * Per requirements.md Additional Business Considerations:
 * - Cookie consent required
 * - GDPR compliance for EU users
 */
export function CookieConsent() {
  const { t } = useTranslation('cookies');
  const params = useParams();
  const navigate = useNavigate();
  const locale = (params?.locale as string) || 'en';

  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>(DEFAULT_PREFERENCES);

  // Check if user has already consented
  useEffect(() => {
    const stored = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as CookiePreferences;
        setPreferences(parsed);
        setShowBanner(false);
      } catch {
        setShowBanner(true);
      }
    } else {
      // Show banner after a short delay for better UX
      const timer = setTimeout(() => setShowBanner(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const savePreferences = (prefs: CookiePreferences) => {
    const withTimestamp = {
      ...prefs,
      consentedAt: new Date().toISOString(),
    };
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(withTimestamp));
    setPreferences(withTimestamp);
    setShowBanner(false);
    setShowSettings(false);
  };

  const acceptAll = () => {
    savePreferences({
      essential: true,
      functional: true,
      analytics: true,
      marketing: true,
    });
  };

  const acceptEssential = () => {
    savePreferences({
      essential: true,
      functional: false,
      analytics: false,
      marketing: false,
    });
  };

  const handleSaveSettings = () => {
    savePreferences(preferences);
  };

  const goToCookiePolicy = () => {
    navigate(`/cookies`);
  };

  if (!showBanner) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-fade-up">
      <Card className="mx-auto max-w-4xl shadow-lg border-2">
        <CardContent className="p-6">
          {!showSettings ? (
            // Main Banner View
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="rounded-full bg-primary/10 p-3">
                  <Cookie className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1 space-y-2">
                  <h3 className="text-lg font-semibold">{t('banner.title')}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t('banner.description')}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={acceptEssential}
                  className="shrink-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex flex-wrap items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={goToCookiePolicy}
                >
                  {t('banner.learnMore')}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSettings(true)}
                >
                  <Settings className="mr-2 h-4 w-4" />
                  {t('banner.customize')}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={acceptEssential}
                >
                  {t('banner.essentialOnly')}
                </Button>
                <Button type="button" size="sm" onClick={acceptAll}>
                  {t('banner.acceptAll')}
                </Button>
              </div>
            </div>
          ) : (
            // Settings View
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">{t('settings.title')}</h3>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowSettings(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-4">
                {/* Essential Cookies - Always On */}
                <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/50">
                  <div className="space-y-1">
                    <Label className="text-base font-medium">{t('settings.essential.title')}</Label>
                    <p className="text-sm text-muted-foreground">
                      {t('settings.essential.description')}
                    </p>
                  </div>
                  <Switch checked disabled />
                </div>

                {/* Functional Cookies */}
                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="space-y-1">
                    <Label className="text-base font-medium">{t('settings.functional.title')}</Label>
                    <p className="text-sm text-muted-foreground">
                      {t('settings.functional.description')}
                    </p>
                  </div>
                  <Switch
                    checked={preferences.functional}
                    onCheckedChange={(checked) =>
                      setPreferences((prev) => ({ ...prev, functional: checked }))
                    }
                  />
                </div>

                {/* Analytics Cookies */}
                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="space-y-1">
                    <Label className="text-base font-medium">{t('settings.analytics.title')}</Label>
                    <p className="text-sm text-muted-foreground">
                      {t('settings.analytics.description')}
                    </p>
                  </div>
                  <Switch
                    checked={preferences.analytics}
                    onCheckedChange={(checked) =>
                      setPreferences((prev) => ({ ...prev, analytics: checked }))
                    }
                  />
                </div>

                {/* Marketing/Affiliate Cookies */}
                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="space-y-1">
                    <Label className="text-base font-medium">{t('settings.marketing.title')}</Label>
                    <p className="text-sm text-muted-foreground">
                      {t('settings.marketing.description')}
                    </p>
                  </div>
                  <Switch
                    checked={preferences.marketing}
                    onCheckedChange={(checked) =>
                      setPreferences((prev) => ({ ...prev, marketing: checked }))
                    }
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={acceptEssential}>
                  {t('settings.rejectAll')}
                </Button>
                <Button type="button" onClick={handleSaveSettings}>
                  {t('settings.savePreferences')}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Hook to check cookie consent preferences
 */
export function useCookieConsent(): CookiePreferences | null {
  const [preferences, setPreferences] = useState<CookiePreferences | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (stored) {
      try {
        setPreferences(JSON.parse(stored));
      } catch {
        setPreferences(null);
      }
    }
  }, []);

  return preferences;
}

/**
 * Utility to check if a specific cookie type is allowed
 */
export function isCookieAllowed(type: 'essential' | 'functional' | 'analytics' | 'marketing'): boolean {
  if (typeof window === 'undefined') return false;

  const stored = localStorage.getItem(COOKIE_CONSENT_KEY);
  if (!stored) return false;

  try {
    const preferences = JSON.parse(stored) as CookiePreferences;
    return preferences[type] ?? false;
  } catch {
    return false;
  }
}
