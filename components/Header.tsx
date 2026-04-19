'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { USERS, getCurrentUserEmail, setCurrentUserEmail } from '@/lib/api'

interface HeaderProps {
  onUserChange?: () => void
  backLink?: boolean
}

export default function Header({ onUserChange, backLink }: HeaderProps) {
  const [userEmail, setUserEmail] = useState(USERS[0].email)

  useEffect(() => {
    setUserEmail(getCurrentUserEmail())
  }, [])

  function handleSwitch(e: React.ChangeEvent<HTMLSelectElement>) {
    setCurrentUserEmail(e.target.value)
    setUserEmail(e.target.value)
    onUserChange?.()
  }

  const currentUser = USERS.find((u) => u.email === userEmail)

  return (
    <header className="bg-[#1a2744] text-white px-6 py-3 flex items-center justify-between shadow-md">
      <div className="flex items-center gap-4">
        {backLink && (
          <Link href="/" className="text-gray-300 hover:text-white text-sm">
            ← Dashboard
          </Link>
        )}
        <Link href="/" className="font-bold text-lg tracking-tight">
          AjaiaDocs
        </Link>
      </div>
      <div className="flex items-center gap-2 text-sm">
        <span className="text-gray-300">Signed in as</span>
        <select
          value={userEmail}
          onChange={handleSwitch}
          className="bg-[#243459] border border-[#3a4f7a] text-white rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
        >
          {USERS.map((u) => (
            <option key={u.email} value={u.email}>
              {u.name} ({u.email})
            </option>
          ))}
        </select>
      </div>
    </header>
  )
}
