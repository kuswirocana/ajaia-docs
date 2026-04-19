import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const ownerEmail = req.headers.get('x-user-email')
  if (!ownerEmail) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const owner = await prisma.user.findUnique({ where: { email: ownerEmail } })
  if (!owner) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const doc = await prisma.document.findUnique({ where: { id: params.id } })
  if (!doc || doc.ownerId !== owner.id)
    return NextResponse.json({ error: 'Document not found or you are not the owner' }, { status: 403 })

  const body = await req.json().catch(() => ({}))
  const { email } = body
  if (!email) return NextResponse.json({ error: 'Email is required' }, { status: 400 })
  if (email === ownerEmail)
    return NextResponse.json({ error: 'You cannot share a document with yourself' }, { status: 400 })

  const target = await prisma.user.findUnique({ where: { email } })
  if (!target) return NextResponse.json({ error: 'No user found with that email' }, { status: 404 })

  await prisma.documentShare.upsert({
    where: { documentId_userId: { documentId: params.id, userId: target.id } },
    update: {},
    create: { documentId: params.id, userId: target.id },
  })

  return NextResponse.json({ success: true, sharedWith: { name: target.name, email: target.email } })
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const ownerEmail = req.headers.get('x-user-email')
  if (!ownerEmail) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const owner = await prisma.user.findUnique({ where: { email: ownerEmail } })
  if (!owner) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const doc = await prisma.document.findUnique({ where: { id: params.id } })
  if (!doc || doc.ownerId !== owner.id)
    return NextResponse.json({ error: 'Not found or not owner' }, { status: 403 })

  const body = await req.json().catch(() => ({}))
  const target = await prisma.user.findUnique({ where: { email: body.email } })
  if (!target) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  await prisma.documentShare.deleteMany({
    where: { documentId: params.id, userId: target.id },
  })

  return NextResponse.json({ success: true })
}
