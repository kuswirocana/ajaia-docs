'use client'
import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import Header from '@/components/Header'
import ShareModal from '@/components/ShareModal'
import { apiFetch } from '@/lib/api'

const Editor = dynamic(() => import('@/components/Editor'), { ssr: false })

interface Share {
  name: string
  email: string
}

interface Document {
  id: string
  title: string
  content: string
  isOwner: boolean
  shares: Share[]
  updatedAt: string
}

type SaveStatus = 'idle' | 'saving' | 'saved'

export default function DocPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [doc, setDoc] = useState<Document | null>(null)
  const [title, setTitle] = useState('')
  const [editingTitle, setEditingTitle] = useState(false)
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')
  const [showShare, setShowShare] = useState(false)
  const [error, setError] = useState('')
  const titleRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    apiFetch(`/api/documents/${params.id}`)
      .then((data) => {
        setDoc(data)
        setTitle(data.title)
      })
      .catch(() => setError('Document not found or you do not have access.'))
  }, [params.id])

  useEffect(() => {
    if (editingTitle) titleRef.current?.focus()
  }, [editingTitle])

  async function saveContent(html: string) {
    try {
      await apiFetch(`/api/documents/${params.id}`, {
        method: 'PUT',
        body: JSON.stringify({ content: html }),
      })
    } catch {
      setError('Failed to save')
    }
  }

  async function saveTitle() {
    setEditingTitle(false)
    if (!title.trim() || title === doc?.title) return
    try {
      await apiFetch(`/api/documents/${params.id}`, {
        method: 'PUT',
        body: JSON.stringify({ title: title.trim() }),
      })
      setDoc((d) => d ? { ...d, title: title.trim() } : d)
    } catch {
      setError('Failed to rename')
    }
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header backLink />
        <div className="max-w-3xl mx-auto px-6 py-16 text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button onClick={() => router.push('/')} className="text-blue-600 hover:underline text-sm">
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  if (!doc) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header backLink />
        <div className="max-w-3xl mx-auto px-6 py-16 text-center text-gray-400 text-sm">
          Loading…
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header backLink />

      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Document header row */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex-1 mr-4">
            {editingTitle ? (
              <input
                ref={titleRef}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={saveTitle}
                onKeyDown={(e) => { if (e.key === 'Enter') saveTitle() }}
                className="w-full text-2xl font-bold text-gray-900 border-b-2 border-blue-400 bg-transparent focus:outline-none"
              />
            ) : (
              <h1
                onClick={() => doc.isOwner && setEditingTitle(true)}
                className={`text-2xl font-bold text-gray-900 ${doc.isOwner ? 'cursor-pointer hover:text-blue-600' : ''}`}
                title={doc.isOwner ? 'Click to rename' : undefined}
              >
                {title}
              </h1>
            )}
            <div className="flex items-center gap-3 mt-1">
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                doc.isOwner
                  ? 'bg-blue-50 text-blue-600 border border-blue-200'
                  : 'bg-purple-50 text-purple-600 border border-purple-200'
              }`}>
                {doc.isOwner ? 'Owner' : 'Shared with me'}
              </span>
              {saveStatus === 'saving' && (
                <span className="text-xs text-gray-400">Saving…</span>
              )}
              {saveStatus === 'saved' && (
                <span className="text-xs text-green-500">Saved</span>
              )}
            </div>
          </div>
          {doc.isOwner && (
            <button
              onClick={() => setShowShare(true)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Share
              {doc.shares.length > 0 && (
                <span className="bg-blue-100 text-blue-700 text-xs rounded-full px-1.5 py-0.5">
                  {doc.shares.length}
                </span>
              )}
            </button>
          )}
        </div>

        <Editor
          content={doc.content}
          onSave={saveContent}
          onSaveStatusChange={setSaveStatus}
        />
      </main>

      {showShare && (
        <ShareModal
          docId={doc.id}
          shares={doc.shares}
          onClose={() => setShowShare(false)}
          onUpdate={(shares) => setDoc((d) => d ? { ...d, shares } : d)}
        />
      )}
    </div>
  )
}
