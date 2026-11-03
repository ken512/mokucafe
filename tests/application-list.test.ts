import { test } from "node:test"
import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { createRequire } from "node:module"
import vm from "node:vm"
import ts from "typescript"
import { createElement, type ReactNode } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import type { Application } from "../src/features/applications/types/index.ts"

type ComponentExports = { default?: (props: { postId: number }) => ReactNode }
const loadModule = createRequire(import.meta.url)
const source = ts.transpileModule(readFileSync('src/features/applications/components/ApplicationList.tsx', 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2022 },
}).outputText

// APIからuserがnullで届く場合も、応募一覧全体がクラッシュしないことを確認する
function render(application: Application): string {
  const exports: ComponentExports = {}
  vm.runInNewContext(source, { exports, require: (id: string) => {
    if (id === 'react') return {
      useState: (initial: unknown) => [Array.isArray(initial) ? [application] : initial === true ? false : initial, () => {}],
      useEffect: () => {},
      useMemo: (compute: () => unknown) => compute(),
      useCallback: (callback: unknown) => callback,
    }
    if (id === '@/lib/supabase/client') return {}
    if (id === '@/components/ui/Avatar') return { default: ({ name }: { name: string }) => createElement('span', null, name) }
    return loadModule(id)
  } })
  assert.ok(exports.default)
  return renderToStaticMarkup(createElement(exports.default, { postId: 1 }))
}
const application: Application = { id: 1, message: null, status: 'PENDING', createdAt: '2026-11-03T00:00:00Z', user: null }

test('ゲスト応募はゲスト名で表示できる', () => {
  assert.match(render({ ...application, guestName: 'ゲスト応募者' }), /ゲスト応募者/)
})
test('ゲスト名が含まれないレスポンスでもクラッシュしない', () => {
  assert.match(render(application), /ゲスト/)
})
test('登録者の応募は登録名で表示できる', () => {
  assert.match(render({ ...application, user: { id: 2, name: '登録者', avatarUrl: null } }), /登録者/)
})
