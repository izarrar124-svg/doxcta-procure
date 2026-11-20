import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { nextCookies } from 'better-auth/next-js'
import { getDb } from '@/server/db'
import * as schema from '@/server/db/schema'
import { sendEmail } from '@/server/email'

export function createAuth() {
  return betterAuth({
    database: drizzleAdapter(getDb(), {
      provider: 'pg',
      schema: {
        user: schema.users,
        session: schema.sessions,
        account: schema.accounts,
        verification: schema.verifications,
      },
    }),
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false,
      sendResetPassword: async ({ user, url }) => {
        await sendEmail({
          to: user.email,
          subject: 'Reset your Doxcta Procure password',
          html: `<p>Reset your password:</p><p><a href="${url}">${url}</a></p>`,
        })
      },
    },
    emailVerification: {
      sendVerificationEmail: async ({ user, url }) => {
        await sendEmail({
          to: user.email,
          subject: 'Verify your Doxcta Procure email',
          html: `<p>Verify your email:</p><p><a href="${url}">${url}</a></p>`,
        })
      },
    },
    user: {
      additionalFields: {
        isSuperAdmin: {
          type: 'boolean',
          defaultValue: false,
          required: false,
          input: false,
        },
      },
    },
    session: {
      additionalFields: {
        activeCompanyId: {
          type: 'string',
          required: false,
          input: false,
        },
      },
    },
    plugins: [nextCookies()],
  })
}

export type Auth = ReturnType<typeof createAuth>

let _auth: Auth | null = null
export function getAuth() {
  if (!_auth) _auth = createAuth()
  return _auth
}
