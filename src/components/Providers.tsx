"use client";

import React, { useEffect, useState } from 'react';
import posthog from 'posthog-js';
import { PostHogProvider } from 'posthog-js/react';

export function Providers({ children }: { children: React.ReactNode }) {
  const [isClient, setIsClient] = useState(false);
  const [hasPostHog, setHasPostHog] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    if (key && key !== 'phc_placeholder_key' && !key.includes('placeholder')) {
      try {
        posthog.init(key, {
          api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
          person_profiles: 'identified_only',
          loaded: () => setHasPostHog(true),
        });
      } catch (e) {
        console.warn('PostHog initialization skipped:', e);
      }
    }
  }, []);

  if (!isClient || !hasPostHog) {
    return <>{children}</>;
  }

  return <PostHogProvider client={posthog}>{children}</PostHogProvider>;
}
