"use client"
import { useState } from "react"
import { KeyValue, HttpMethod, RequestState } from "@/types"
import { v4 as uuid } from "uuid"

const METHODS: HttpMethod[] = ["GET", "POST", "PUT", "PATCH", "DELETE"]

const METHOD_COLORS: Record<HttpMethod, string> = {
  GET: "text-green-400",
  POST: "text-blue-400",
  PUT: "text-yellow-400",
  PATCH: "text-orange-400",
  DELETE: "text-red-400",
}

type Props = {
  onSend: (req: RequestState) => void
  loading: boolean
  initialState?: RequestState
}

export default function RequestPanel({ onSend, loading, initialState }: Props) {
  const [method, setMethod] = useState<HttpMethod>(initialState?.method ?? "GET")
  const [url, setUrl] = useState(initialState?.url ?? "")
  const [headers, setHeaders] = useState<KeyValue[]>(
    initialState?.headers ?? [{ id: uuid(), key: "", value: "" }]
  )
  const [body, setBody] = useState(initialState?.body ?? "")
  const [tab, setTab] = useState<"headers" | "body">("headers")

  const addHeader = () => setHeaders(h => [...h, { id: uuid(), key: "", value: "" }])
  const removeHeader = (id: string) => setHeaders(h => h.filter(x => x.id !== id))
  const updateHeader = (id: string, field: "key" | "value", val: string) =>
    setHeaders(h => h.map(x => (x.id === id ? { ...x, [field]: val } : x)))

  const handleSend = () => {
    if (!url.trim()) return
    onSend({ method, url, headers, body })
  }

  return (
    <div className="flex flex-col h-full gap-4">
      {/* URL bar */}
      <div className="flex gap-2">
        <select
          value={method}
          onChange={e => setMethod(e.target.value as HttpMethod)}
          className={`bg-[#1a1f2e] border border-[#2a2f42] rounded-lg px-3 py-2 text-sm font-mono font-semibold focus:outline-none focus:border-violet-500 hover:cursor-pointer ${METHOD_COLORS[method]}`}
        >
          {METHODS.map(m => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
        <input
          type="text"
          value={url}
          onChange={e => setUrl(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleSend()}
          placeholder="https://api.example.com/endpoint"
          className="flex-1 bg-[#1a1f2e] border border-[#2a2f42] rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-violet-500 font-mono"
        />
        <button
          onClick={handleSend}
          disabled={loading || !url.trim()}
          className="px-4 py-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm font-medium text-white transition-colors hover:cursor-pointer"
        >
          {loading ? "Sending..." : "Send"}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-[#2a2f42]">
        {(["headers", "body"] as const).map(t => (
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
            {t === "headers" && headers.filter(h => h.key).length > 0 && (
              <span className="ml-1.5 text-xs bg-violet-600/30 text-violet-400 px-1.5 py-0.5 rounded-full">
                {headers.filter(h => h.key).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Headers */}
      {tab === "headers" && (
        <div className="flex flex-col gap-2 flex-1 overflow-y-auto">
          {headers.map(h => (
            <div key={h.id} className="flex gap-2">
              <input
                placeholder="Key"
                value={h.key}
                onChange={e => updateHeader(h.id, "key", e.target.value)}
                className="flex-1 bg-[#1a1f2e] border border-[#2a2f42] rounded-lg px-3 py-1.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-violet-500 font-mono"
              />
              <input
                placeholder="Value"
                value={h.value}
                onChange={e => updateHeader(h.id, "value", e.target.value)}
                className="flex-1 bg-[#1a1f2e] border border-[#2a2f42] rounded-lg px-3 py-1.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-violet-500 font-mono"
              />
              <button
                onClick={() => removeHeader(h.id)}
                className="px-2 text-gray-600 hover:text-red-400 transition-colors hover:cursor-pointer"
              >
                ✕
              </button>
            </div>
          ))}
          <button
            onClick={addHeader}
            className="text-sm text-violet-400 hover:text-violet-300 text-left transition-colors hover:cursor-pointer"
          >
            + Add header
          </button>
        </div>
      )}

      {/* Body */}
      {tab === "body" && (
        <textarea
          value={body}
          onChange={e => setBody(e.target.value)}
          placeholder='{ "key": "value" }'
          disabled={method === "GET" || method === "DELETE"}
          className="flex-1 bg-[#1a1f2e] border border-[#2a2f42] rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-violet-500 font-mono resize-none disabled:opacity-40 disabled:cursor-not-allowed"
        />
      )}
    </div>
  )
}
