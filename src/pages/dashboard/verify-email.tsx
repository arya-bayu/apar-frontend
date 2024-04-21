import AuthCard from '@/components/AuthCard'
import AuthSessionStatus from '@/components/AuthSessionStatus'
import GuestLayout from '@/components/Layouts/GuestLayout'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'
import { useState } from 'react'

const VerifyEmail = () => {
  const { logout, resendEmailVerification } = useAuth({
    middleware: 'auth',
    redirectIfAuthenticated: '/dashboard',
  })

  const [status, setStatus] = useState<string | null>(null)

  return (
    <GuestLayout title="Verifikasi Email">
      <AuthCard>
        <div className="mb-4 text-sm text-gray-600">
          Sebelum memulai, verifikasi alamat alamat email Anda dengan mengklik
          tautan yang telah kami kirimkan. Jika belum menerima email, Anda dapat
          meminta tautan yang baru.
        </div>

        {status === 'verification-link-sent' && (
          <AuthSessionStatus
            className="mb-4"
            status="A new verification link has been sent to the email
                        address you provided during registration"
          />
        )}

        <div className="mt-4 flex items-center justify-between">
          <Button
            onClick={() =>
              resendEmailVerification({
                setStatus,
                setErrors: () => {},
              })
            }
          >
            Kirim Ulang Email Verifikasi
          </Button>

          <Button variant="secondary" onClick={logout}>
            Logout
          </Button>
        </div>
      </AuthCard>
    </GuestLayout>
  )
}

export default VerifyEmail
