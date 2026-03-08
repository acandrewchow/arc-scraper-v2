/**
 * Utility functions
 */
import crypto from 'crypto';

export function getSubscriptionKey(email: string, productUrl: string): string {
  return crypto.createHash('md5').update(`${email}:${productUrl}`).digest('hex');
}

export function getSessionIdFromRequest(request: Request): string {
  // Try to get session ID from cookie or generate a new one
  const cookieHeader = request.headers.get('cookie');
  if (cookieHeader) {
    const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=');
      acc[key] = value;
      return acc;
    }, {} as Record<string, string>);

    if (cookies.session_id) {
      return cookies.session_id;
    }
  }

  // Generate new session ID
  return crypto.randomBytes(16).toString('hex');
}
