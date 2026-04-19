// app/api/admin/allowlist/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { get } from "@vercel/edge-config";
import { isAdmin } from "@/lib/allowlist";

/* Verifies if its admin */
async function requireAdmin() {
    const session = await getServerSession();
    if (!session?.user?.email || !isAdmin(session.user.email)) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return null;
}

export async function GET() {
    const denied = await requireAdmin();
    if (denied) return denied;

    const [allowedEmails, trustedDomains] = await Promise.all([
        get<string[]>("allowedEmails"),
        get<string[]>("trustedDomains"),
    ]);

    return NextResponse.json({
        allowedEmails: allowedEmails ?? [],
        trustedDomains: trustedDomains ?? [],
    });
}

export async function PATCH(req: Request) {
    const denied = await requireAdmin();
    if (denied) return denied;

    const { key, value }: { key: "allowedEmails" | "trustedDomains"; value: string[] } =
        await req.json();

    if (!["allowedEmails", "trustedDomains"].includes(key)) {
        return NextResponse.json({ error: "Invalid key" }, { status: 400 });
    }

    const res = await fetch(
        `https://api.vercel.com/v1/edge-config/${process.env.EDGE_CONFIG_ID}/items`,
        {
            method: "PATCH",
            headers: {
                Authorization: `Bearer ${process.env.VERCEL_API_TOKEN}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                items: [{ operation: "upsert", key, value }],
            }),
        }
    );

    if (!res.ok) {
        const body = await res.text();
        console.error("Vercel API error:", res.status, body); // add this
        return NextResponse.json({ error: "Failed to update" }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
}