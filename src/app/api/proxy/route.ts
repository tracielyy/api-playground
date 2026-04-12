import { getServerSession } from "next-auth"
import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"
import { isBlockedUrl } from "@/lib/ssrf"

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(20, "1 m"), // 20 requests per minute per user
})

const MAX_RESPONSE_SIZE = 100_000 // 100KB

export async function POST(req: Request) {
  // 1. Auth check
  const session = await getServerSession();
  if (!session?.user?.email) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  // 2. Rate limit per user email
  const { success, remaining } = await ratelimit.limit(session.user.email)
  if (!success) {
    return Response.json(
      { error: "Rate limit exceeded. Try again in a minute." },
      {
        status: 429,
        headers: { "X-RateLimit-Remaining": "0" },
      }
    )
  }

  const { url, method, headers, body } = await req.json()

  // 3. SSRF protection
  if (!url || isBlockedUrl(url)) {
    return Response.json({ error: "Blocked or invalid URL" }, { status: 403 })
  }

  // 4. Fire the request
  try {
    const start = Date.now()

    const res = await fetch(url, {
      method,
      headers: headers ?? {},
      body: method !== "GET" && method !== "HEAD" ? body : undefined,
    })

    // 5. Cap response size
    const text = await res.text()
    if (text.length > MAX_RESPONSE_SIZE) {
      return Response.json(
        { error: `Response too large (max ${MAX_RESPONSE_SIZE / 1000}KB)` },
        { status: 413 }
      )
    }

    return Response.json({
      status: res.status,
      headers: Object.fromEntries(res.headers.entries()),
      body: text,
      time: Date.now() - start,
    })
  } catch (err) {
    return Response.json({ error: "Request failed" }, { status: 500 })
  }
}
