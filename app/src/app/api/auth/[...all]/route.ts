import { getAuth } from '@/server/auth'
import { toNextJsHandler } from 'better-auth/next-js'

type Handler = (req: Request) => Promise<Response> | Response

function handlers() {
  return toNextJsHandler(getAuth())
}

export const GET: Handler = (req) => handlers().GET(req)
export const POST: Handler = (req) => handlers().POST(req)
