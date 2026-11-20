'use client'

import { useRouter } from 'next/navigation'
import { authClient } from '@/lib/auth-client'
import { Button } from '@/components/ui/Button'

export function SignOutButton() {
  const router = useRouter()
  return (
    <Button
      type="button"
      variant="secondary"
      size="sm"
      onClick={async () => {
        await authClient.signOut()
        router.push('/login')
        router.refresh()
      }}
    >
      Sign out
    </Button>
  )
}
