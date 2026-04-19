import { get } from "@vercel/edge-config";

export async function isAllowed(email: string): Promise<boolean> {

  if (!email) return false;

  const [allowedEmails, trustedDomains] = await Promise.all([
    get<string[]>("allowedEmails"),
    get<string[]>("trustedDomains"),
  ]);

  // Check exact email match
  if (allowedEmails?.includes(email)) return true;


  // Check domain match
  const domain = email.split("@")[1];
  if (trustedDomains?.some((d) => domain === d || domain.endsWith(`.${d}`)))
    return true;
 
  return false;
}

export function isAdmin(email: string): boolean {
  return email === process.env.ADMIN_EMAIL;
}
