import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function getUserEmail(req: NextRequest) {
  return req.headers.get('x-user-email')
}

export async function GET(req: NextRequest) {
  const email = getUserEmail(req)
  if (!email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const [owned, sharedEntries] = await Promise.all([
    prisma.document.findMany({
      where: { ownerId: user.id },
      orderBy: { updatedAt: 'desc' },
      select: { id: true, title: true, updatedAt: true, createdAt: true },
    }),
    prisma.documentShare.findMany({
      where: { userId: user.id },
      include: {
        document: {
          select: {
            id: true,
            title: true,
            updatedAt: true,
            createdAt: true,
            owner: { select: { name: true, email: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
  ])

  return NextResponse.json({
    owned,
    shared: sharedEntries.map((s) => ({
      id: s.document.id,
      title: s.document.title,
      updatedAt: s.document.updatedAt,
      createdAt: s.document.createdAt,
      sharedBy: s.document.owner.name,
      sharedByEmail: s.document.owner.email,
    })),
  })
}

export async function POST(req: NextRequest) {
  const email = getUserEmail(req)
  if (!email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const body = await req.json().catch(() => ({}))
  const doc = await prisma.document.create({
    data: {
      title: body.title || 'Untitled Document',
      content: body.content || '',
      ownerId: user.id,
    },
  })

  return NextResponse.json(doc, { status: 201 })
}
