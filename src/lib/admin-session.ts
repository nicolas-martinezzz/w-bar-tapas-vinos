const encoder = new TextEncoder();

function timingSafeEqualUtf8(a: string, b: string): boolean {
  const ba = encoder.encode(a);
  const bb = encoder.encode(b);
  if (ba.length !== bb.length) {
    return false;
  }
  let diff = 0;
  for (let i = 0; i < ba.length; i++) {
    diff |= ba[i] ^ bb[i];
  }
  return diff === 0;
}

export const ADMIN_SESSION_COOKIE = 'admin_session';
export const ADMIN_SESSION_DURATION_SECONDS = 60 * 60 * 8;

type AdminSessionPayload = {
  role: 'admin';
  iat: number;
  exp: number;
};

function toBase64Url(input: string): string {
  return btoa(input).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function fromBase64Url(input: string): string {
  const normalized = input.replace(/-/g, '+').replace(/_/g, '/');
  const padding = '='.repeat((4 - (normalized.length % 4)) % 4);
  return atob(`${normalized}${padding}`);
}

async function signPayload(payloadBase64Url: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(payloadBase64Url));
  const bytes = new Uint8Array(signature);
  const signatureBinary = Array.from(bytes, (byte) => String.fromCharCode(byte)).join('');
  return toBase64Url(signatureBinary);
}

export async function createAdminSessionToken(secret: string): Promise<string> {
  const issuedAt = Math.floor(Date.now() / 1000);
  const payload: AdminSessionPayload = {
    role: 'admin',
    iat: issuedAt,
    exp: issuedAt + ADMIN_SESSION_DURATION_SECONDS,
  };

  const payloadBase64Url = toBase64Url(JSON.stringify(payload));
  const signature = await signPayload(payloadBase64Url, secret);

  return `${payloadBase64Url}.${signature}`;
}

export async function verifyAdminSessionToken(
  token: string | undefined,
  secret: string
): Promise<boolean> {
  if (!token) {
    return false;
  }

  const [payloadBase64Url, signature] = token.split('.');
  if (!payloadBase64Url || !signature) {
    return false;
  }

  const expectedSignature = await signPayload(payloadBase64Url, secret);
  if (!timingSafeEqualUtf8(signature, expectedSignature)) {
    return false;
  }

  let payload: AdminSessionPayload;
  try {
    payload = JSON.parse(fromBase64Url(payloadBase64Url)) as AdminSessionPayload;
  } catch {
    return false;
  }

  const now = Math.floor(Date.now() / 1000);
  return payload.role === 'admin' && payload.exp > now;
}
