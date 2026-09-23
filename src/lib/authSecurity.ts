export function safeNextPath(search: string): string | null {
  const next = new URLSearchParams(search).get('next');
  if (!next || !next.startsWith('/') || next.startsWith('//') || next.includes('\\')) return null;
  return next;
}

export function postAuthPath(search: string): string {
  return safeNextPath(search) ?? '/dashboard';
}

export function googleRedirectTo(origin: string, search: string): string {
  const next = safeNextPath(search);
  return next
    ? `${origin}/auth?next=${encodeURIComponent(next)}`
    : `${origin}/auth`;
}

export function authCallbackError(search: string): string | null {
  const params = new URLSearchParams(search);
  const error = params.get('error');
  if (!error) return null;
  return params.get('error_description') || 'Authentication failed. Please try again.';
}
