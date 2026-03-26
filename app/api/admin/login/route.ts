import { NextRequest, NextResponse } from 'next/server'
import { getAdminCookieName, signAdminSessionToken } from '@/lib/adminAuth'

export async function POST(req: NextRequest) {
  const secret = process.env.ADMIN_SECRET_KEY
  if (!secret) {
    return NextResponse.json({ error: 'ADMIN_SECRET_KEY not configured' }, { status: 500 })
  }

  let body: any
  try {
    body = await req.json()
  } catch {
    body = {}
  }

  const password = typeof body?.password === 'string' ? body.password : ''
  if (!password) {
    return NextResponse.json({ error: 'Missing password' }, { status: 400 })
  }

  if (password !== secret) {
    return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
  }

  const token = signAdminSessionToken(secret, Date.now())
  const res = NextResponse.json({ ok: true })

  res.cookies.set(getAdminCookieName(), token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 7 * 24 * 60 * 60,
  })

  return res
}

