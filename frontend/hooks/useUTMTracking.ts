'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

interface UTMParams {
  source?: string;
  medium?: string;
  campaign?: string;
  term?: string;
  content?: string;
}

export function useUTMTracking() {
  const searchParams = useSearchParams();

  useEffect(() => {
    // Extract UTM parameters from URL
    const utmParams: UTMParams = {
      source: searchParams.get('utm_source') || undefined,
      medium: searchParams.get('utm_medium') || undefined,
      campaign: searchParams.get('utm_campaign') || undefined,
      term: searchParams.get('utm_term') || undefined,
      content: searchParams.get('utm_content') || undefined,
    };

    // Store UTM parameters in sessionStorage for persistence
    if (Object.values(utmParams).some((value) => value !== undefined)) {
      sessionStorage.setItem('utm_params', JSON.stringify(utmParams));
    }
  }, [searchParams]);

  // Get stored UTM parameters
  const getUTMParams = (): UTMParams => {
    const storedParams = sessionStorage.getItem('utm_params');
    return storedParams ? JSON.parse(storedParams) : {};
  };

  // Get referrer
  const getReferrer = (): string | undefined => {
    return document.referrer || undefined;
  };

  // Get IP address (note: this should be done server-side for accuracy)
  const getClientInfo = () => {
    return {
      userAgent: navigator.userAgent,
      language: navigator.language,
      referrer: getReferrer(),
    };
  };

  return {
    getUTMParams,
    getClientInfo,
  };
}
