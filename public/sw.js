// Service Worker — キャッシュ戦略 + Web Push 受信 & 通知表示

const CACHE_VERSION = "v1"
const STATIC_CACHE = `static-${CACHE_VERSION}`
const PAGE_CACHE = `pages-${CACHE_VERSION}`

// キャッシュ対象の静的アセットパターン
const isStaticAsset = (url) => {
  const { pathname } = new URL(url)
  return (
    pathname.startsWith("/_next/static/") ||
    pathname.startsWith("/icons/") ||
    pathname === "/manifest.webmanifest"
  )
}

// HTML ページかどうか（fetch キャッシュの対象）
const isNavigationRequest = (request) =>
  request.mode === "navigate"

// --- インストール：事前キャッシュ ---
self.addEventListener("install", (event) => {
  // 即座にアクティベートしてキャッシュを有効にする
  self.skipWaiting()
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) =>
      cache.addAll(["/icons/icon-192.png", "/icons/icon-512.png"])
    )
  )
})

// --- アクティベート：古いキャッシュを削除 ---
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== STATIC_CACHE && k !== PAGE_CACHE)
          .map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  )
})

// --- フェッチ：キャッシュ戦略 ---
self.addEventListener("fetch", (event) => {
  const { request } = event
  // GET 以外はスルー
  if (request.method !== "GET") return

  const url = new URL(request.url)
  // 別オリジン（Supabase API 等）はスルー
  if (url.origin !== self.location.origin) return

  if (isStaticAsset(request.url)) {
    // Cache First：Next.js ビルドハッシュ付き静的ファイルは永久キャッシュ
    event.respondWith(
      caches.open(STATIC_CACHE).then(async (cache) => {
        const cached = await cache.match(request)
        if (cached) return cached
        const response = await fetch(request)
        if (response.ok) cache.put(request, response.clone())
        return response
      })
    )
    return
  }

  if (isNavigationRequest(request)) {
    // Network First with cache fallback：ページは常に最新を優先
    event.respondWith(
      caches.open(PAGE_CACHE).then(async (cache) => {
        try {
          const response = await fetch(request)
          if (response.ok) cache.put(request, response.clone())
          return response
        } catch {
          const cached = await cache.match(request)
          return cached ?? Response.error()
        }
      })
    )
  }
})

// --- Web Push 受信 ---
self.addEventListener("push", (event) => {
  const data = event.data?.json() ?? {}
  event.waitUntil(
    self.registration.showNotification(data.title ?? "もくカフェ", {
      body: data.body ?? "",
      icon: "/icons/icon-192.png",
      badge: "/icons/icon-192.png",
      data: { url: data.url ?? "/" },
    })
  )
})

self.addEventListener("notificationclick", (event) => {
  event.notification.close()
  const url = event.notification.data?.url ?? "/"
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      // 既に開いているタブがあればフォーカスする
      for (const client of clientList) {
        if ("focus" in client) return client.focus()
      }
      // なければ新規タブで開く
      if (clients.openWindow) return clients.openWindow(url)
    })
  )
})
