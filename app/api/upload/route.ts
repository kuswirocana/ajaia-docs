import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isValidUploadFile, filenameToTitle, plainTextToHtml } from '@/lib/utils'

export async function POST(req: NextRequest) {
  const email = req.headers.get('x-user-email')
  if (!email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const formData = await req.formData().catch(() => null)
  if (!formData) return NextResponse.json({ error: 'Invalid form data' }, { status: 400 })

  const file = formData.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

  if (!isValidUploadFile(file.name))
    return NextResponse.json(
      { error: 'Only .txt and .md files are supported' },
      { status: 400 }
    )

  const text = await file.text()
  const title = filenameToTitle(file.name)
  const content = plainTextToHtml(text)

  const doc = await prisma.document.create({
    data: { title, content, ownerId: user.id },
  })

  return NextResponse.json(doc, { status: 201 })
}
