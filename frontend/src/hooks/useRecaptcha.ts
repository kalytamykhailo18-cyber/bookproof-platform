import { useCallback, useEffect, useState } from 'react';

declare global {
  interface Window {
    grecaptcha: {
      ready: (callback: () => void) => void;
      execute: (siteKey: string, options: { action: string }) => Promise<string>;
    };
  }
}

const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY || '';
const RECAPTCHA_ENABLED = import.meta.env.VITE_RECAPTCHA_ENABLED === 'true';

/**
 * Hook for Google reCAPTCHA v3 integration
 *
 * reCAPTCHA v3 is invisible and returns a score (0.0 - 1.0) indicating
 * the likelihood of human interaction. Higher scores mean more likely human.
 */
export function useRecaptcha() {
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load the reCAPTCHA script
  useEffect(() => {
    // Skip if CAPTCHA is disabled or no site key
    if (!RECAPTCHA_ENABLED || !RECAPTCHA_SITE_KEY) {
      setIsReady(true); // Mark as ready since we'll skip verification
      return;
    }

    // Check if script is already loaded
    if (window.grecaptcha) {
      window.grecaptcha.ready(() => setIsReady(true));
      return;
    }

    // Create and load the script
    const script = document.createElement('script');
    script.src = `https://www.google.com/recaptcha/api.js?render=${RECAPTCHA_SITE_KEY}`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      window.grecaptcha.ready(() => setIsReady(true));
    };

    script.onerror = () => {
      setError('Failed to load reCAPTCHA');
      setIsReady(true); // Mark as ready anyway to not block the form
    };

    document.head.appendChild(script);

    return () => {
      // Cleanup is tricky with reCAPTCHA, leave the script loaded
    };
  }, []);

  /**
   * Execute reCAPTCHA verification and get a token
   * @param action - The action name (e.g., 'login', 'register')
   * @returns The reCAPTCHA token or undefined if disabled/error
   */
  const executeRecaptcha = useCallback(
    async (action: string): Promise<string | undefined> => {
      // Skip if CAPTCHA is disabled
      if (!RECAPTCHA_ENABLED || !RECAPTCHA_SITE_KEY) {
        return undefined;
      }

      // Wait for reCAPTCHA to be ready
      if (!isReady || !window.grecaptcha) {
        console.warn('reCAPTCHA not ready yet');
        return undefined;
      }

      setIsLoading(true);
      setError(null);

      try {
        const token = await window.grecaptcha.execute(RECAPTCHA_SITE_KEY, { action });
        return token;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to execute reCAPTCHA';
        setError(errorMessage);
        console.error('reCAPTCHA execution failed:', err);
        return undefined;
      } finally {
        setIsLoading(false);
      }
    },
    [isReady]
  );

  return {
    executeRecaptcha,
    isReady,
    isLoading,
    error,
    isEnabled: RECAPTCHA_ENABLED && !!RECAPTCHA_SITE_KEY,
  };
}
