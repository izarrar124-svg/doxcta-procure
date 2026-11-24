import { getAuth } from '@/server/auth'
import { toNextJsHandler } from 'better-auth/next-js'

type Handler = (req: Request) => Promise<Response> | Response

function handlers() {
  return toNextJsHandler(getAuth())
}

function authErrorResponse(err: unknown) {
  const message = err instanceof Error ? err.message : 'Authentication service unavailable'
  return Response.json({ message, error: message }, { status: 500 })
}

export const GET: Handler = async (req) => {
  try {
    return await handlers().GET(req)
  } catch (err) {
    return authErrorResponse(err)
  }
}

export const POST: Handler = async (req) => {
  try {
    return await handlers().POST(req)
  } catch (err) {
    return authErrorResponse(err)
  }
}
