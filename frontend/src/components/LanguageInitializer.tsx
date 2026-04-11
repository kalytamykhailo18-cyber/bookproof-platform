import { useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import i18n from '@/lib/i18n';

/**
 * Language Initializer Component
 *
 * Automatically sets the i18n language based on the user's preferredLanguage
 * when the app loads or when the user changes.
 */
export function LanguageInitializer() {
  const { user, _hasHydrated } = useAuthStore();

  useEffect(() => {
    // Wait for auth store to hydrate from localStorage
    if (!_hasHydrated) return;

    // Set language from user's preference if user is logged in
    if (user?.preferredLanguage) {
      const langCode = user.preferredLanguage.toLowerCase();
      // Only change if different from current language
      if (i18n.language !== langCode) {
        console.log(`🌐 LanguageInitializer: Changing language from ${i18n.language} to ${langCode}`);
        i18n.changeLanguage(langCode).then(() => {
          console.log(`✅ Language changed successfully to ${langCode}`);
        });
      } else {
        console.log(`🌐 LanguageInitializer: Language already set to ${langCode}`);
      }
    }
  }, [user, _hasHydrated]);

  // This component doesn't render anything
  return null;
}
