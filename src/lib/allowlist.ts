import allowlist from "@/data/allowlist.json"

export function isAllowed(email: string): boolean {
  return allowlist.includes(email)
}
