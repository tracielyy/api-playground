"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState, useCallback } from "react";
import { redirect } from "next/navigation";

type ListKey = "allowedEmails" | "trustedDomains";

interface ListData {
  allowedEmails: string[];
  trustedDomains: string[];
}

function ListEditor({
  label,
  description,
  items,
  onAdd,
  onRemove,
  placeholder,
}: {
  label: string;
  description: string;
  items: string[];
  onAdd: (value: string) => void;
  onRemove: (value: string) => void;
  placeholder: string;
}) {
  const [input, setInput] = useState("");

  const handleAdd = () => {
    const trimmed = input.trim().toLowerCase();
    if (!trimmed || items.includes(trimmed)) return;
    onAdd(trimmed);
    setInput("");
  };

  return (
    <div className="rounded-lg bg-[#1d2130] border border-[#2a2f42] p-5 space-y-4">
      <div>
        <h2 className="text-sm font-semibold text-[#e2deff] tracking-wide uppercase">
          {label}
        </h2>
        <p className="text-xs text-[#6b7280] mt-1">{description}</p>
      </div>

      {/* Add input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          placeholder={placeholder}
          className="flex-1 bg-slate-bg border border-[#2a2f42] rounded-md px-3 py-2 text-sm text-white placeholder-[#4b5563] focus:outline-none focus:border-[#7c3aed] transition-colors"
        />
        <button
          onClick={handleAdd}
          className="px-4 py-2 rounded-md bg-[#7c3aed] hover:bg-[#6d28d9] hover:cursor-pointer text-white text-sm font-medium transition-colors"
        >
          Add
        </button>
      </div>

      {/* List */}
      <div className="space-y-2">
        {items.length === 0 ? (
          <p className="text-xs text-[#4b5563] italic">No entries yet.</p>
        ) : (
          items.map((item) => (
            <div
              key={item}
              className="flex items-center justify-between px-3 py-2 rounded-md border border-[#2a2f42] group"
            >
              <span className="text-sm text-[#a78bfa] font-mono">{item}</span>
              <button
                onClick={() => onRemove(item)}
                className="text-[#4b5563] hover:text-red-400 hover:cursor-pointer transition-colors text-xs opacity-0 group-hover:opacity-100"
              >
                Remove
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default function AdminPage() {
  const { data: session, status } = useSession();
  const [data, setData] = useState<ListData>({ allowedEmails: [], trustedDomains: [] });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<ListKey | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Redirect if not admin
  if (status === "authenticated" && !session?.user?.isAdmin) {
    redirect("/");
  }

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/allowlist");
      if (!res.ok) throw new Error("Failed to fetch");
      const json = await res.json();
      setData(json);
    } catch {
      setError("Failed to load allowlist data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === "authenticated") fetchData();
  }, [status, fetchData]);

  const updateList = async (key: ListKey, newList: string[]) => {
    setSaving(key);
    setError(null);
    try {
      const res = await fetch("/api/admin/allowlist", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value: newList }),
      });
      if (!res.ok) throw new Error("Failed to save");
      setData((prev) => ({ ...prev, [key]: newList }));
    } catch {
      setError("Failed to save. Try again.");
    } finally {
      setSaving(null);
    }
  };

  const handleAdd = (key: ListKey) => (value: string) => {
    updateList(key, [...data[key], value]);
  };

  const handleRemove = (key: ListKey) => (value: string) => {
    updateList(key, data[key].filter((v) => v !== value));
  };

  if (status === "loading" || loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-[#6b7280] text-sm">Loading...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-4 py-10">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-1">
          <h1 className="text-xl font-bold text-[#e2deff]">Allowlist Manager</h1>
          <p className="text-sm text-[#6b7280]">
            Manage who can access the API Playground.
          </p>
        </div>

        {error && (
          <div className="rounded-md bg-red-900/30 border border-red-700/40 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {saving && (
          <div className="rounded-md bg-violet-900/20 border border-violet-700/30 px-4 py-3 text-sm text-[#a78bfa]">
            Saving {saving === "allowedEmails" ? "email list" : "domain list"}...
          </div>
        )}

        <ListEditor
          label="Exact Emails"
          description="Users with these exact email addresses can sign in."
          items={data.allowedEmails}
          onAdd={handleAdd("allowedEmails")}
          onRemove={handleRemove("allowedEmails")}
          placeholder="user@example.com"
        />

        <ListEditor
          label="Trusted Domains"
          description="Any email from these domains can sign in (e.g. gov.sg matches user@agency.gov.sg)."
          items={data.trustedDomains}
          onAdd={handleAdd("trustedDomains")}
          onRemove={handleRemove("trustedDomains")}
          placeholder="gov.sg"
        />
      </div>
    </main>
  );
}