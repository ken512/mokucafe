import { test } from "node:test"
import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { createRequire } from "node:module"
import vm from "node:vm"
import ts from "typescript"
import { renderToStaticMarkup } from "react-dom/server"

import type { ReactNode } from "react"

type RenderOptions = {
  browser?: boolean
  hydrated?: boolean
  ua?: string
  permission?: NotificationPermission
  storageBlocked?: boolean
}

const loadModule = createRequire(import.meta.url)
const source = ts.transpileModule(readFileSync('src/components/ui/NotificationSetupBanner.tsx', 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2022 },
}).outputText

// 初回Hydrationとマウント後のスナップショットを分けて検証する
function render({ browser = false, hydrated = false, ua = 'Chrome', permission = 'default', storageBlocked = false }: RenderOptions = {}) {
  const exports: { default?: () => ReactNode } = {}
  const context = {
    exports,
    require: (id: string) => {
      if (id === 'react') return {
        useState: <T,>(initial: T | (() => T)) => [typeof initial === 'function' ? (initial as () => T)() : initial, () => {}],
        useSyncExternalStore: <T,>(_subscribe: unknown, getSnapshot: () => T, getServerSnapshot: () => T) => hydrated ? getSnapshot() : getServerSnapshot(),
      }
      if (id === '@/lib/supabase/client') return {}
      return loadModule(id)
    },
  }
  if (browser) Object.assign(context, {
    window: { Notification: { permission }, matchMedia: () => ({ matches: false }) },
    Notification: { permission },
    navigator: { userAgent: ua },
    localStorage: { getItem: () => { if (storageBlocked) throw new Error('利用不可'); return null } },
  })
  vm.runInNewContext(source, context)
  assert.ok(exports.default)
  return renderToStaticMarkup(exports.default())
}

for (const ua of ['iPhone Safari', 'Android Chrome', 'Chrome']) {
  test(`${ua}: SSRと初回HydrationのHTMLが一致する`, () => {
    assert.equal(render({ browser: true, ua }), render())
    assert.equal(render({ browser: true, ua }), '')
    assert.match(render({ browser: true, hydrated: true, ua }), /通知を受け取ろう/)
  })
}
test('通知許可済みの場合はバナーを表示しない', () => {
  assert.equal(render({ browser: true, hydrated: true, permission: 'granted' }), '')
})
test('ストレージが利用できなくても描画できる', () => {
  assert.match(render({ browser: true, hydrated: true, storageBlocked: true }), /通知を受け取ろう/)
})
