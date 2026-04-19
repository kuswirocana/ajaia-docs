import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

async function resolveAccess(docId: string, email: string) {
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) return null

  const doc = await prisma.document.findUnique({
    where: { id: docId },
    include: {
      owner: { select: { id: true, name: true, email: true } },
      shares: { include: { user: { select: { id: true, name: true, email: true } } } },
    },
  })
  if (!doc) return null

  const isOwner = doc.ownerId === user.id
  const isShared = doc.shares.some((s) => s.userId === user.id)
  if (!isOwner && !isShared) return null

  return { doc, user, isOwner }
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const email = req.headers.get('x-user-email')
  if (!email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const result = await resolveAccess(params.id, email)
  if (!result) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { doc, isOwner } = result
  return NextResponse.json({
    id: doc.id,
    title: doc.title,
    content: doc.content,
    updatedAt: doc.updatedAt,
    createdAt: doc.createdAt,
    isOwner,
    owner: doc.owner,
    shares: doc.shares.map((s) => ({ name: s.user.name, email: s.user.email })),
  })
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const email = req.headers.get('x-user-email')
  if (!email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const result = await resolveAccess(params.id, email)
  if (!result) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const body = await req.json().catch(() => ({}))
  const updated = await prisma.document.update({
    where: { id: params.id },
    data: {
      ...(body.title !== undefined && { title: body.title }),
      ...(body.content !== undefined && { content: body.content }),
    },
  })

  return NextResponse.json(updated)
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const email = req.headers.get('x-user-email')
  if (!email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const result = await resolveAccess(params.id, email)
  if (!result) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (!result.isOwner)
    return NextResponse.json({ error: 'Only the owner can delete this document' }, { status: 403 })

  await prisma.document.delete({ where: { id: params.id } })
  return NextResponse.json({ success: true })
}
