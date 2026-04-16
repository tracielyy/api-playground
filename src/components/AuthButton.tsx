"use client"
import { useSession, signOut } from "next-auth/react"

export default function AuthButton() {
  const { data: session } = useSession()

  if (!session) return null

  return (
    <div className="flex items-center gap-3">
      {session.user?.image && (
        <img
          src={session.user.image}
          alt="avatar"
          className="w-6 h-6 rounded-full"
        />
      )}
      <span className="text-xs text-gray-400">{session.user?.email}</span>
      <button
        onClick={() => signOut({ callbackUrl: "/login" })}
        className="text-xs text-gray-600 hover:text-gray-300 transition-colors hover:cursor-pointer"
      >
        Sign out
      </button>
    </div>
  )
}
