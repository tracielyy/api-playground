const BLOCKED_HOSTNAMES = [
  "localhost",
  "127.0.0.1",
  "0.0.0.0",
  "169.254.169.254",   // AWS metadata
  "metadata.google.internal",
  "::1",               // IPv6 loopback
]

const BLOCKED_RANGES = [
  /^10\./,             // 10.0.0.0/8
  /^192\.168\./,       // 192.168.0.0/16
  /^172\.(1[6-9]|2\d|3[01])\./, // 172.16.0.0/12
]

export function isBlockedUrl(rawUrl: string): boolean {
  try {
    const { hostname, protocol } = new URL(rawUrl)
    if (!["http:", "https:"].includes(protocol)) return true
    if (BLOCKED_HOSTNAMES.some(b => hostname === b)) return true
    if (BLOCKED_RANGES.some(r => r.test(hostname))) return true
    return false
  } catch {
    return true // invalid URL = block
  }
}
