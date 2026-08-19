"use client";

import posthog from 'posthog-js';
import { PostHogProvider } from 'posthog-js/react';

if (
  typeof window !== 'undefined' &&
  process.env.NEXT_PUBLIC_POSTHOG_KEY &&
  process.env.NEXT_PUBLIC_POSTHOG_KEY !== 'phc_placeholder_key'
) {
  try {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
      person_profiles: 'identified_only',
    });
  } catch (e) {
    console.warn('PostHog init skipped:', e);
  }
}

export function Providers({ children }: { children: React.ReactNode }) {
    return <PostHogProvider client={posthog}>{children}</PostHogProvider>;
}
