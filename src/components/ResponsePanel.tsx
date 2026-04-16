"use client"
import { useState } from "react"
import { ProxyResponse } from "@/types"

type Props = {
  response: ProxyResponse | null
  loading: boolean
}

function StatusBadge({ status }: { status: number }) {
  const color =
    status >= 500 ? "bg-red-500/20 text-red-400" :
    status >= 400 ? "bg-orange-500/20 text-orange-400" :
    status >= 300 ? "bg-yellow-500/20 text-yellow-400" :
    "bg-green-500/20 text-green-400"

  return (
    <span className={`px-2 py-0.5 rounded text-xs font-mono font-semibold ${color}`}>
      {status}
    </span>
  )
}

function tryFormatJson(raw: string): string {
  try {
    return JSON.stringify(JSON.parse(raw), null, 2)
  } catch {
    return raw
  }
}

export default function ResponsePanel({ response, loading }: Props) {
  const [tab, setTab] = useState<"body" | "headers">("body")
  const [copied, setCopied] = useState(false)

  const copy = () => {
    if (!response) return
    navigator.clipboard.writeText(response.body)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500 text-sm">
        <span className="animate-pulse">Sending request...</span>
      </div>
    )
  }

  if (!response) {
    return (
      <div className="flex items-center justify-center h-full text-gray-600 text-sm">
        Hit Send to see a response
      </div>
    )
  }

  if (response.error) {
    return (
      <div className="flex items-center justify-center h-full text-red-400 text-sm">
        {response.error}
      </div>
    )
  }

  const formatted = tryFormatJson(response.body)

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Status bar */}
      <div className="flex items-center gap-3">
        <StatusBadge status={response.status} />
        <span className="text-xs text-gray-500">{response.time}ms</span>
        <span className="text-xs text-gray-500">
          {(new TextEncoder().encode(response.body).length / 1024).toFixed(1)}KB
        </span>
        <button
          onClick={copy}
          className="ml-auto text-xs text-gray-500 hover:text-gray-300 transition-colors"
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-[#2a2f42]">
        {(["body", "headers"] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-3 py-1.5 text-sm capitalize transition-colors hover:cursor-pointer ${
              tab === t
                ? "text-violet-400 border-b-2 border-violet-400"
                : "text-gray-500 hover:text-gray-300"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Body */}
      {tab === "body" && (
        <pre className="flex-1 overflow-auto text-xs text-gray-300 font-mono bg-[#1a1f2e] rounded-lg p-3 whitespace-pre-wrap break-words">
          {formatted}
        </pre>
      )}

      {/* Headers */}
      {tab === "headers" && (
        <div className="flex-1 overflow-auto space-y-1">
          {Object.entries(response.headers).map(([k, v]) => (
            <div key={k} className="flex gap-2 text-xs font-mono">
              <span className="text-violet-400 min-w-[140px] shrink-0">{k}</span>
              <span className="text-gray-300 break-all">{v}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
