'use client'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import { useEffect, useRef } from 'react'
import Toolbar from './Toolbar'

interface EditorProps {
  content: string
  onSave: (html: string) => void
  onSaveStatusChange?: (status: 'idle' | 'saving' | 'saved') => void
}

export default function Editor({ content, onSave, onSaveStatusChange }: EditorProps) {
  const saveTimer = useRef<ReturnType<typeof setTimeout>>()
  const initialized = useRef(false)

  const editor = useEditor({
    extensions: [StarterKit, Underline],
    content,
    editorProps: {
      attributes: {
        class: 'p-6 min-h-[500px] focus:outline-none',
      },
    },
    onUpdate: ({ editor }) => {
      clearTimeout(saveTimer.current)
      onSaveStatusChange?.('saving')
      saveTimer.current = setTimeout(() => {
        onSave(editor.getHTML())
        onSaveStatusChange?.('saved')
        setTimeout(() => onSaveStatusChange?.('idle'), 2000)
      }, 1000)
    },
  })

  useEffect(() => {
    if (editor && !initialized.current && content) {
      editor.commands.setContent(content, false)
      initialized.current = true
    }
  }, [editor, content])

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
      {editor && <Toolbar editor={editor} />}
      <EditorContent editor={editor} />
    </div>
  )
}
