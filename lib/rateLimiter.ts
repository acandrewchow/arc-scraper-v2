/**
 * Rate limiting utilities to prevent abuse of subscription system
 * Ported from app/rate_limiter.py
 */
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { loadSubscriptions } from './db';
import crypto from 'crypto';

const MAX_SUBSCRIPTIONS_PER_EMAIL = parseInt(
  process.env.MAX_SUBSCRIPTIONS_PER_EMAIL || '50',
  10
);
const MAX_ATTEMPTS_PER_EMAIL_PER_HOUR = parseInt(
  process.env.MAX_ATTEMPTS_PER_EMAIL_PER_HOUR || '10',
  10
);
const MAX_ATTEMPTS_PER_SESSION_PER_HOUR = parseInt(
  process.env.MAX_ATTEMPTS_PER_SESSION_PER_HOUR || '20',
  10
);
const RATE_LIMIT_WINDOW_HOURS = parseInt(
  process.env.RATE_LIMIT_WINDOW_HOURS || '1',
  10
);

function getSupabaseClient(): SupabaseClient {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_KEY;

  if (!url || !key) {
    throw new Error(
      'Supabase not configured. Please set SUPABASE_URL and SUPABASE_KEY as environment variables.'
    );
  }

  return createClient(url, key);
}

export function getSessionId(): string {
  // Generate a session ID (in a real app, this would come from cookies/session)
  // For now, we'll generate a random one - in API routes, this should come from request
  return crypto.randomBytes(16).toString('hex');
}

export async function recordRateLimitAttempt(
  email: string,
  sessionId: string,
  success: boolean = false
): Promise<void> {
  const supabase = getSupabaseClient();

  try {
    const attemptData = {
      email: email.toLowerCase().trim(),
      session_id: sessionId,
      success,
      attempted_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from('rate_limit_attempts')
      .insert(attemptData);

    if (error) {
      // Log error but don't fail - rate limiting should be best effort
      console.error(`Error recording rate limit attempt: ${error.message}`);
    }
  } catch (error) {
    // Log error but don't fail
    console.error(`Error recording rate limit attempt: ${error}`);
  }
}

export async function cleanupOldAttempts(): Promise<void> {
  const supabase = getSupabaseClient();

  try {
    const cutoffTime = new Date();
    cutoffTime.setHours(cutoffTime.getHours() - RATE_LIMIT_WINDOW_HOURS - 1);

    const { error } = await supabase
      .from('rate_limit_attempts')
      .delete()
      .lt('attempted_at', cutoffTime.toISOString());

    if (error) {
      console.error(`Error cleaning up old rate limit attempts: ${error.message}`);
    }
  } catch (error) {
    console.error(`Error cleaning up old rate limit attempts: ${error}`);
  }
}

async function countEmailSubscriptions(email: string): Promise<number> {
  try {
    const subscriptions = await loadSubscriptions();
    const emailLower = email.toLowerCase().trim();
    let count = 0;

    for (const sub of Object.values(subscriptions)) {
      if (
        sub.email.toLowerCase().trim() === emailLower &&
        sub.verified
      ) {
        count++;
      }
    }
    return count;
  } catch (error) {
    console.error(`Error counting email subscriptions: ${error}`);
    return 0;
  }
}

async function countEmailAttempts(
  email: string,
  windowHours: number = RATE_LIMIT_WINDOW_HOURS
): Promise<number> {
  const supabase = getSupabaseClient();

  try {
    const cutoffTime = new Date();
    cutoffTime.setHours(cutoffTime.getHours() - windowHours);

    const { data, error } = await supabase
      .from('rate_limit_attempts')
      .select('id')
      .eq('email', email.toLowerCase().trim())
      .gte('attempted_at', cutoffTime.toISOString());

    if (error) throw error;

    return data?.length || 0;
  } catch (error) {
    console.error(`Error counting email attempts: ${error}`);
    return 0;
  }
}

async function countSessionAttempts(
  sessionId: string,
  windowHours: number = RATE_LIMIT_WINDOW_HOURS
): Promise<number> {
  const supabase = getSupabaseClient();

  try {
    const cutoffTime = new Date();
    cutoffTime.setHours(cutoffTime.getHours() - windowHours);

    const { data, error } = await supabase
      .from('rate_limit_attempts')
      .select('id')
      .eq('session_id', sessionId)
      .gte('attempted_at', cutoffTime.toISOString());

    if (error) throw error;

    return data?.length || 0;
  } catch (error) {
    console.error(`Error counting session attempts: ${error}`);
    return 0;
  }
}

export async function checkRateLimit(
  email: string,
  sessionId?: string
): Promise<{ allowed: boolean; errorMessage?: string }> {
  if (!sessionId) {
    sessionId = getSessionId();
  }

  const emailLower = email.toLowerCase().trim();

  // Check 1: Max subscriptions per email
  const currentSubscriptions = await countEmailSubscriptions(emailLower);
  if (currentSubscriptions >= MAX_SUBSCRIPTIONS_PER_EMAIL) {
    return {
      allowed: false,
      errorMessage: `You have reached the maximum of ${MAX_SUBSCRIPTIONS_PER_EMAIL} subscriptions per email address. Please unsubscribe from some products before adding new ones.`,
    };
  }

  // Check 2: Max attempts per email per hour
  const emailAttempts = await countEmailAttempts(emailLower);
  if (emailAttempts >= MAX_ATTEMPTS_PER_EMAIL_PER_HOUR) {
    return {
      allowed: false,
      errorMessage: `Too many subscription attempts. Please wait before trying again. (Limit: ${MAX_ATTEMPTS_PER_EMAIL_PER_HOUR} attempts per hour)`,
    };
  }

  // Check 3: Max attempts per session per hour
  const sessionAttempts = await countSessionAttempts(sessionId);
  if (sessionAttempts >= MAX_ATTEMPTS_PER_SESSION_PER_HOUR) {
    return {
      allowed: false,
      errorMessage: `Too many subscription attempts from this session. Please wait before trying again. (Limit: ${MAX_ATTEMPTS_PER_SESSION_PER_HOUR} attempts per hour)`,
    };
  }

  return { allowed: true };
}

export {
  MAX_SUBSCRIPTIONS_PER_EMAIL,
  MAX_ATTEMPTS_PER_EMAIL_PER_HOUR,
  MAX_ATTEMPTS_PER_SESSION_PER_HOUR,
};
