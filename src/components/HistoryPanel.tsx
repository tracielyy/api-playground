"use client"
import { HistoryItem, RequestState } from "@/types"

const METHOD_COLORS: Record<string, string> = {
  GET: "text-green-400",
  POST: "text-blue-400",
  PUT: "text-yellow-400",
  PATCH: "text-orange-400",
  DELETE: "text-red-400",
}

type Props = {
  history: HistoryItem[]
  onSelect: (req: RequestState) => void
  onClear: () => void
}

export default function HistoryPanel({ history, onSelect, onClear }: Props) {
  if (history.length === 0) {
    return (
      <div className="text-xs text-gray-600 px-2 py-3">No history yet</div>
    )
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between px-2 pb-1">
        <span className="text-xs text-gray-500">Recent</span>
        <button
          onClick={onClear}
          className="text-xs text-gray-600 hover:text-red-400 transition-colors hover:cursor-pointer"
        >
          Clear
        </button>
      </div>
      {history.map(item => (
        <button
          key={item.id}
          onClick={() => onSelect(item)}
          className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-[#1a1f2e] text-left transition-colors group hover:cursor-pointer"
        >
          <span className={`text-xs font-mono font-semibold w-12 shrink-0 ${METHOD_COLORS[item.method] ?? "text-gray-400"}`}>
            {item.method}
          </span>
          <span className="text-xs text-gray-400 truncate flex-1 font-mono group-hover:text-gray-200 transition-colors">
            {item.url}
          </span>
          <span className={`text-xs font-mono shrink-0 ${item.status >= 400 ? "text-red-400" : "text-green-400"}`}>
            {item.status}
          </span>
        </button>
      ))}
    </div>
  )
}
