import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from './schema'

export function getDb() {
  const url = process.env.DATABASE_URL
  if (!url) {
    // Avoid crashing `next build` page-data collection; runtime requests still need a real URL.
    if (process.env.NEXT_PHASE === 'phase-production-build') {
      const sql = neon('postgresql://build:build@127.0.0.1/build')
      return drizzle(sql, { schema })
    }
    throw new Error('DATABASE_URL is not set')
  }
  const sql = neon(url)
  return drizzle(sql, { schema })
}

export type Db = ReturnType<typeof getDb>
