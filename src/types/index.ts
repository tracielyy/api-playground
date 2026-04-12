export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE"

export type KeyValue = {
  id: string
  key: string
  value: string
}

export type RequestState = {
  method: HttpMethod
  url: string
  headers: KeyValue[]
  body: string
}

export type HistoryItem = RequestState & {
  id: string
  status: number
  time: number
  timestamp: string
}

export type ProxyResponse = {
  status: number
  headers: Record<string, string>
  body: string
  time: number
  error?: string
}
