/**
 * Simple plan utility — one place for all plan logic.
 * free = 3 scans/mo
 * creator = 30 scans/mo  
 * studio = 100 scans/mo
 */

export type PlanTier = 'free' | 'creator' | 'studio';

const LIMITS: Record<string, number> = {
  free: 3,
  creator: 30,
  studio: 100,
  agency: 100,    // legacy — treated as studio
  founding: 30,   // legacy — treated as creator
};

const LABELS: Record<string, string> = {
  free: 'Free Trial',
  creator: 'Creator',
  studio: 'The Studio',
  agency: 'The Studio',
  founding: 'Creator',
};

export function getPlanLimit(tier: string): number {
  return LIMITS[tier] ?? 3;
}

export function getPlanLabel(tier: string): string {
  return LABELS[tier] ?? 'Free Trial';
}

export function isStudio(tier: string): boolean {
  return tier === 'studio' || tier === 'agency';
}

export function isCreatorOrAbove(tier: string): boolean {
  return tier === 'creator' || isStudio(tier) || tier === 'founding';
}

export function getScansRemaining(tier: string, scansUsed: number): number {
  return Math.max(0, getPlanLimit(tier) - scansUsed);
}
