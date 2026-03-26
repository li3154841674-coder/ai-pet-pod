import crypto from 'crypto'
import type { NextRequest } from 'next/server'

const COOKIE_NAME = 'admin_session'

function base64UrlEncode(input: Buffer | string) {
  const buf = Buffer.isBuffer(input) ? input : Buffer.from(input)
  return buf
    .toString('base64')
    .replaceAll('+', '-')
    .replaceAll('/', '_')
    .replaceAll('=', '')
}

function base64UrlDecodeToBuffer(input: string) {
  const pad = input.length % 4 === 0 ? '' : '='.repeat(4 - (input.length % 4))
  const b64 = input.replaceAll('-', '+').replaceAll('_', '/') + pad
  return Buffer.from(b64, 'base64')
}

function timingSafeEqual(a: string, b: string) {
  const aBuf = Buffer.from(a)
  const bBuf = Buffer.from(b)
  if (aBuf.length !== bBuf.length) return false
  return crypto.timingSafeEqual(aBuf, bBuf)
}

export function getAdminCookieName() {
  return COOKIE_NAME
}

export function signAdminSessionToken(secret: string, issuedAtMs: number) {
  const payload = { iat: issuedAtMs }
  const payloadB64 = base64UrlEncode(JSON.stringify(payload))
  const sig = crypto.createHmac('sha256', secret).update(payloadB64).digest('hex')
  return `${payloadB64}.${sig}`
}

export function verifyAdminSessionToken(secret: string, token: string, maxAgeMs: number) {
  const [payloadB64, sig] = token.split('.')
  if (!payloadB64 || !sig) return false

  const expectedSig = crypto.createHmac('sha256', secret).update(payloadB64).digest('hex')
  if (!timingSafeEqual(expectedSig, sig)) return false

  let payload: any
  try {
    payload = JSON.parse(base64UrlDecodeToBuffer(payloadB64).toString('utf8'))
  } catch {
    return false
  }

  const iat = typeof payload?.iat === 'number' ? payload.iat : 0
  if (!iat) return false
  if (Date.now() - iat > maxAgeMs) return false

  return true
}

export function isAdminAuthedFromRequest(req: NextRequest) {
  const secret = process.env.ADMIN_SECRET_KEY
  if (!secret) return false

  const token = req.cookies.get(COOKIE_NAME)?.value
  if (!token) return false

  // 7 days
  return verifyAdminSessionToken(secret, token, 7 * 24 * 60 * 60 * 1000)
}

