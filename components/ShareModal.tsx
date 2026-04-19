'use client'
import { useState } from 'react'
import { apiFetch, USERS, getCurrentUserEmail } from '@/lib/api'

interface Share {
  name: string
  email: string
}

interface ShareModalProps {
  docId: string
  shares: Share[]
  onClose: () => void
  onUpdate: (shares: Share[]) => void
}

export default function ShareModal({ docId, shares, onClose, onUpdate }: ShareModalProps) {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const otherUsers = USERS.filter((u) => u.email !== getCurrentUserEmail())

  async function handleShare(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setError('')
    setLoading(true)
    try {
      const res = await apiFetch(`/api/documents/${docId}/share`, {
        method: 'POST',
        body: JSON.stringify({ email: email.trim() }),
      })
      onUpdate([...shares, res.sharedWith])
      setEmail('')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to share')
    } finally {
      setLoading(false)
    }
  }

  async function handleRevoke(targetEmail: string) {
    try {
      await apiFetch(`/api/documents/${docId}/share`, {
        method: 'DELETE',
        body: JSON.stringify({ email: targetEmail }),
      })
      onUpdate(shares.filter((s) => s.email !== targetEmail))
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to revoke')
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Share Document</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
        </div>

        <form onSubmit={handleShare} className="flex gap-2 mb-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter email address"
            list="user-suggestions"
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <datalist id="user-suggestions">
            {otherUsers.map((u) => (
              <option key={u.email} value={u.email}>{u.name}</option>
            ))}
          </datalist>
          <button
            type="submit"
            disabled={loading || !email.trim()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? '...' : 'Share'}
          </button>
        </form>

        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
            Shared with
          </p>
          {shares.length === 0 ? (
            <p className="text-sm text-gray-400">No one else has access yet.</p>
          ) : (
            <ul className="space-y-2">
              {shares.map((s) => (
                <li key={s.email} className="flex items-center justify-between py-1">
                  <div>
                    <span className="text-sm font-medium text-gray-800">{s.name}</span>
                    <span className="text-xs text-gray-500 ml-2">{s.email}</span>
                  </div>
                  <button
                    onClick={() => handleRevoke(s.email)}
                    className="text-xs text-red-500 hover:text-red-700"
                  >
                    Revoke
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
