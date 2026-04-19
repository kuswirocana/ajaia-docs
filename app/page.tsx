'use client'
import { useEffect, useRef, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import { apiFetch, getCurrentUserEmail } from '@/lib/api'
import { formatDate } from '@/lib/utils'

interface DocSummary {
  id: string
  title: string
  updatedAt: string
  sharedBy?: string
}

export default function Dashboard() {
  const router = useRouter()
  const [owned, setOwned] = useState<DocSummary[]>([])
  const [shared, setShared] = useState<DocSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await apiFetch('/api/documents')
      setOwned(data.owned)
      setShared(data.shared)
    } catch {
      setError('Failed to load documents. Make sure the database is connected.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  async function createDoc() {
    try {
      const doc = await apiFetch('/api/documents', {
        method: 'POST',
        body: JSON.stringify({ title: 'Untitled Document' }),
      })
      router.push(`/docs/${doc.id}`)
    } catch {
      setError('Failed to create document')
    }
  }

  async function deleteDoc(id: string, e: React.MouseEvent) {
    e.stopPropagation()
    if (!confirm('Delete this document?')) return
    try {
      await apiFetch(`/api/documents/${id}`, { method: 'DELETE' })
      setOwned((prev) => prev.filter((d) => d.id !== id))
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to delete')
    }
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setError('')
    try {
      const form = new FormData()
      form.append('file', file)
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'x-user-email': getCurrentUserEmail() },
        body: form,
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error)
      }
      const doc = await res.json()
      router.push(`/docs/${doc.id}`)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onUserChange={load} />

      <main className="max-w-5xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
          <div className="flex gap-3">
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              {uploading ? 'Uploading…' : '↑ Upload .txt / .md'}
            </button>
            <input
              ref={fileRef}
              type="file"
              accept=".txt,.md"
              className="hidden"
              onChange={handleUpload}
            />
            <button
              onClick={createDoc}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
            >
              + New Document
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-gray-500 text-sm">Loading…</div>
        ) : (
          <>
            <Section
              title="My Documents"
              docs={owned}
              onOpen={(id) => router.push(`/docs/${id}`)}
              onDelete={deleteDoc}
              showDelete
              emptyText="No documents yet. Create one to get started."
            />
            <Section
              title="Shared with Me"
              docs={shared}
              onOpen={(id) => router.push(`/docs/${id}`)}
              emptyText="No documents have been shared with you yet."
              badge={(doc) => doc.sharedBy ? `Shared by ${doc.sharedBy}` : undefined}
            />
          </>
        )}
      </main>
    </div>
  )
}

function Section({
  title,
  docs,
  onOpen,
  onDelete,
  showDelete,
  emptyText,
  badge,
}: {
  title: string
  docs: DocSummary[]
  onOpen: (id: string) => void
  onDelete?: (id: string, e: React.MouseEvent) => void
  showDelete?: boolean
  emptyText: string
  badge?: (doc: DocSummary) => string | undefined
}) {
  return (
    <section className="mb-10">
      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">{title}</h2>
      {docs.length === 0 ? (
        <p className="text-sm text-gray-400">{emptyText}</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {docs.map((doc) => (
            <div
              key={doc.id}
              onClick={() => onOpen(doc.id)}
              className="bg-white border border-gray-200 rounded-xl p-5 cursor-pointer hover:shadow-md hover:border-blue-300 transition-all group"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{doc.title}</p>
                  <p className="text-xs text-gray-400 mt-1">{formatDate(doc.updatedAt)}</p>
                  {badge?.(doc) && (
                    <span className="mt-2 inline-block text-xs bg-purple-50 text-purple-600 border border-purple-200 px-2 py-0.5 rounded-full">
                      {badge(doc)}
                    </span>
                  )}
                </div>
                {showDelete && onDelete && (
                  <button
                    onClick={(e) => onDelete(doc.id, e)}
                    className="ml-2 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity text-lg leading-none"
                    title="Delete"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
