import { cookies } from 'next/headers'
import AdminGate from './AdminGate'
import AdminDashboard from './AdminDashboard'
import { getAdminCookieName, verifyAdminSessionToken } from '@/lib/adminAuth'

export default async function AdminPage() {
  const secret = process.env.ADMIN_SECRET_KEY
  const token = (await cookies()).get(getAdminCookieName())?.value

  const authed =
    !!secret &&
    !!token &&
    verifyAdminSessionToken(secret, token, 7 * 24 * 60 * 60 * 1000)

  if (!authed) {
    return <AdminGate />
  }

  return <AdminDashboard />
}

