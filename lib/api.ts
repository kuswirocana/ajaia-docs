export const USERS = [
  { email: 'alice@ajaia.dev', name: 'Alice Chen' },
  { email: 'bob@ajaia.dev', name: 'Bob Smith' },
]

export function getCurrentUserEmail(): string {
  if (typeof window === 'undefined') return USERS[0].email
  return localStorage.getItem('userEmail') ?? USERS[0].email
}

export function setCurrentUserEmail(email: string) {
  localStorage.setItem('userEmail', email)
}

function authHeaders(): HeadersInit {
  return {
    'Content-Type': 'application/json',
    'x-user-email': getCurrentUserEmail(),
  }
}

export async function apiFetch(path: string, options?: RequestInit) {
  const res = await fetch(path, {
    ...options,
    headers: {
      ...authHeaders(),
      ...(options?.headers ?? {}),
    },
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }))
    throw new Error(err.error ?? 'Request failed')
  }
  return res.json()
}
