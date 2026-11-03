import { test } from "node:test"
import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import vm from "node:vm"
import ts from "typescript"
import { createHash } from "node:crypto"
import { createRequire } from "node:module"

import type { ApplicationStatus, CreateApplicationRequest } from "../src/features/applications/types/index.ts"

type RouteContext = { params: Promise<{ id: string }> }
type RouteHandler = (request: Request, context?: RouteContext) => Promise<Response>
type RouteExports = Record<string, RouteHandler>
type AuthResult = { success: true; userId: number } | { success: false; message: string }
type ApplicationRecord = {
  id: number
  userId: number | null
  guestName: string
  postId: number
  status: ApplicationStatus
  post: { id: number; userId: number; cafeName: string; date: Date; endDate: Date | null; status: string }
}
type CreatedApplication = {
  postId: number
  userId: number | null
  guestName: string | null
  guestTokenHash: string | null
  message: string | null
}
type TestNotification = { recipientUserId: number }

const loadModule = createRequire(import.meta.url)

// 外部DBへ接続せず、認可と状態遷移を確認する
function loadRoute(path: string, mocks: Record<string, unknown>): RouteExports {
  const source = ts.transpileModule(readFileSync(path, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText
  const exports: RouteExports = {}
  vm.runInNewContext(source, { exports, require: (id: string) => mocks[id] ?? loadModule(id), console })
  return exports
}
const token = 'a'.repeat(64)
const request = (value = token) => new Request('http://localhost/api/guest-applications', {
  headers: { Authorization: `Bearer ${value}` },
})
function setup(status: ApplicationStatus = 'APPROVED', ended = false) {
  const notifications: TestNotification[] = []
  let lookedUp = false
  const record: ApplicationRecord = { id: 1, userId: null, guestName: '応募者', postId: 2, status,
    post: { id: 2, userId: 3, cafeName: 'カフェ', date: new Date(), endDate: ended ? new Date(0) : null, status: 'OPEN' } }
  const prisma = { application: {
    findUnique: async ({ where }: { where: { guestTokenHash: string } }) => {
      lookedUp = true
      assert.equal(where.guestTokenHash, createHash('sha256').update(token).digest('hex'))
      return { ...record }
    },
    updateMany: async ({ where, data }: { where: { status: ApplicationStatus }; data: { status: ApplicationStatus } }) => {
      if (record.status !== where.status) return { count: 0 }
      record.status = data.status
      return { count: 1 }
    },
  } }
  const route = loadRoute('src/app/api/guest-applications/route.ts', {
    '@/lib/prisma': { prisma }, '@/lib/notify': { notify: async (n: TestNotification) => notifications.push(n) },
  })
  return { route, record, notifications, lookedUp: () => lookedUp }
}
test('不正なトークンはDBを参照せず拒否する', async () => {
  const s = setup()
  assert.equal((await s.route.GET(request('invalid'))).status, 404)
  assert.equal(s.lookedUp(), false)
})
test('専用URLで状況を取得し、秘密情報を返さない', async () => {
  const s = setup('PENDING')
  const res = await s.route.GET(request())
  assert.equal(res.headers.get('cache-control'), 'no-store')
  const { application } = await res.json()
  assert.equal(application.name, '応募者')
  assert.equal(application.status, 'PENDING')
  assert.equal(application.guestTokenHash, undefined)
  assert.equal(application.post.userId, undefined)
})
for (const status of ['PENDING', 'REJECTED', 'ATTENDING'] as const) {
  test(`${status}からは参加確定できない`, async () => {
    const s = setup(status)
    assert.equal((await s.route.PATCH(request())).status, 409)
    assert.equal(s.notifications.length, 0)
  })
}
test('承認済みの応募を確定し、重複の通知を送らない', async () => {
  const s = setup()
  assert.equal((await s.route.PATCH(request())).status, 200)
  assert.equal(s.record.status, 'ATTENDING')
  assert.equal(s.notifications[0].recipientUserId, 3)
  assert.equal((await s.route.PATCH(request())).status, 409)
  assert.equal(s.notifications.length, 1)
})
test('終了後は参加確定を拒否する', async () => {
  const s = setup('APPROVED', true)
  assert.equal((await s.route.PATCH(request())).status, 400)
})
test('登録者の応募をゲストURLで操作できない', async () => {
  const s = setup()
  s.record.userId = 5
  assert.equal((await s.route.GET(request())).status, 404)
  assert.equal((await s.route.PATCH(request())).status, 404)
})

function setupApply(auth: AuthResult = { success: false, message: '認証が必要です' }, full = false) {
  let created: CreatedApplication | undefined
  const prisma = {
    post: { findUnique: async () => ({ id: 2, status: 'OPEN', endDate: null, userId: 3, capacity: 1, _count: { applications: full ? 1 : 0 } }) },
    application: { create: async ({ data }: { data: CreatedApplication }) => { created = data; return { id: 1, status: 'PENDING' } } },
    user: { findUnique: async () => ({ name: '登録者' }) },
  }
  const route = loadRoute('src/app/api/posts/[id]/applications/route.ts', {
    '@/lib/prisma': { prisma }, '@/lib/supabase/auth': { authenticateRequest: async () => auth },
    '@/lib/notify': { notify: async () => {} },
  })
  const apply = (body: CreateApplicationRequest, bearer?: string) => route.POST(new Request('http://localhost/api/posts/2/applications', {
    method: 'POST', headers: { 'Content-Type': 'application/json', ...(bearer ? { Authorization: `Bearer ${bearer}` } : {}) },
    body: JSON.stringify(body),
  }), { params: Promise.resolve({ id: '2' }) })
  return { apply, created: () => created }
}
test('未ログインで名前を入力して応募し、ハッシュだけを保存する', async () => {
  const s = setupApply()
  const res = await s.apply({ name: ' ゲスト ', message: 'よろしく' })
  assert.equal(res.status, 201)
  const data = await res.json()
  assert.match(data.guestToken, /^[a-f0-9]{64}$/)
  assert.equal(s.created()?.userId, null)
  assert.equal(s.created()?.guestName, 'ゲスト')
  assert.equal(s.created()?.guestTokenHash, createHash('sha256').update(data.guestToken).digest('hex'))
})
test('名前なし・長すぎる名前のゲスト応募を拒否する', async () => {
  const s = setupApply()
  for (const name of ['', ' ', 'a'.repeat(51)]) assert.equal((await s.apply({ name })).status, 400)
  assert.equal(s.created(), undefined)
})
test('満員の場合はゲスト応募を拒否する', async () => {
  const s = setupApply(undefined, true)
  assert.equal((await s.apply({ name: 'ゲスト' })).status, 400)
  assert.equal(s.created(), undefined)
})
test('不正な認証情報をゲストとして受け付けない', async () => {
  const s = setupApply()
  assert.equal((await s.apply({ name: 'ゲスト' }, 'invalid')).status, 401)
})
test('登録ユーザーは既存アカウントで応募する', async () => {
  const s = setupApply({ success: true, userId: 8 })
  const res = await s.apply({ message: 'よろしく' }, 'valid')
  assert.equal(res.status, 201)
  assert.equal(s.created()?.userId, 8)
  assert.equal((await res.json()).guestToken, null)
})

test('主催者はゲスト応募を承認でき、ゲストのアカウント通知を作らない', async () => {
  let updated = false
  let notified = false
  const route = loadRoute('src/app/api/applications/[id]/route.ts', {
    '@/lib/supabase/auth': { authenticateRequest: async () => ({ success: true, userId: 3 }) },
    '@/lib/prisma': { prisma: { application: {
      findUnique: async () => ({ id: 1, status: 'PENDING', userId: null, user: null, guestName: 'ゲスト', post: { id: 2, userId: 3, cafeName: 'カフェ' } }),
      update: async () => { updated = true; return { id: 1, status: 'APPROVED' } },
    } } },
    '@/lib/notify': { notify: async () => { notified = true } },
  })
  const res = await route.PATCH(new Request('http://localhost/api/applications/1', {
    method: 'PATCH', body: JSON.stringify({ status: 'APPROVED' }),
  }), { params: Promise.resolve({ id: '1' }) })
  assert.equal(res.status, 200)
  assert.equal(updated, true)
  assert.equal(notified, false)
})
test('ゲストの募集投稿は従来どおり拒否する', async () => {
  const route = loadRoute('src/app/api/posts/route.ts', {
    '@/lib/prisma': { prisma: {} },
    '@/lib/supabase/auth': { authenticateRequest: async () => ({ success: false, message: '認証が必要です' }) },
    '@/features/posts/validations/postSchema': {},
  })
  const res = await route.POST(new Request('http://localhost/api/posts', { method: 'POST' }))
  assert.equal(res.status, 401)
})
