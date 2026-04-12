"use client"
import { useState, useEffect } from "react"
import { v4 as uuid } from "uuid"
import RequestPanel from "@/components/RequestPanel"
import ResponsePanel from "@/components/ResponsePanel"
import HistoryPanel from "@/components/HistoryPanel"
import AuthButton from "@/components/AuthButton"
import { HistoryItem, ProxyResponse, RequestState } from "@/types"

const HISTORY_KEY = "api-playground-history"

function loadHistory(): HistoryItem[] {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) ?? "[]")
  } catch {
    return []
  }
}

function saveHistory(history: HistoryItem[]) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 30)))
}

export default function Home() {
  const [loading, setLoading] = useState(false)
  const [response, setResponse] = useState<ProxyResponse | null>(null)
  // const [history, setHistory] = useState<HistoryItem[]>(loadHistory)
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [activeRequest, setActiveRequest] = useState<RequestState | undefined>()
  const [historyOpen, setHistoryOpen] = useState(false)

  useEffect(() => {
    setHistory(loadHistory())
  }, [])


  const handleSend = async (req: RequestState) => {
    setLoading(true)
    setResponse(null)

    try {
      const res = await fetch("/api/proxy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: req.url,
          method: req.method,
          headers: Object.fromEntries(
            req.headers
              .filter(h => h.key.trim())
              .map(h => [h.key, h.value])
          ),
          body: req.body || undefined,
        }),
      })

      const data: ProxyResponse = await res.json()
      setResponse(data)

      // Save to history
      const item: HistoryItem = {
        ...req,
        id: uuid(),
        status: data.status ?? res.status,
        time: data.time ?? 0,
        timestamp: new Date().toISOString(),
      }
      const updated = [item, ...history]
      setHistory(updated)
      saveHistory(updated)
    } catch {
      setResponse({ status: 0, headers: {}, body: "", time: 0, error: "Network error" })
    } finally {
      setLoading(false)
    }
  }

  const handleSelectHistory = (req: RequestState) => {
    setActiveRequest(req)
    setHistoryOpen(false)
  }

  return (
    <div className="min-h-screen bg-[#0e1117] text-white flex flex-col">
      {/* Header */}
      <header className="border-b border-[#2a2f42] px-6 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-violet-400 font-mono">API Playground</span>
          <button
            onClick={() => setHistoryOpen(o => !o)}
            className="text-xs text-gray-500 hover:text-gray-300 transition-colors border border-[#2a2f42] px-2 py-1 rounded"
          >
            History {history.length > 0 && `(${history.length})`}
          </button>
        </div>
        <AuthButton />
      </header>

      {/* History drawer */}
      {historyOpen && (
        <div className="border-b border-[#2a2f42] px-6 py-3 bg-[#111827]">
          <HistoryPanel
            history={history}
            onSelect={handleSelectHistory}
            onClear={() => { setHistory([]); saveHistory([]) }}
          />
        </div>
      )}

      {/* Main panels */}
      <div className="flex flex-1 overflow-hidden divide-x divide-[#2a2f42]">
        {/* Request */}
        <div className="flex-1 flex flex-col p-6 overflow-hidden">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Request</h2>
          <div className="flex-1 overflow-hidden">
            <RequestPanel
              onSend={handleSend}
              loading={loading}
              initialState={activeRequest}
            />
          </div>
        </div>

        {/* Response */}
        <div className="flex-1 flex flex-col p-6 overflow-hidden">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Response</h2>
          <div className="flex-1 overflow-hidden">
            <ResponsePanel response={response} loading={loading} />
          </div>
        </div>
      </div>
    </div>
  )
}
