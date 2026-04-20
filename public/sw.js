// Service Worker — Web Push 受信 & 通知表示

self.addEventListener("push", (event) => {
  const data = event.data?.json() ?? {}
  event.waitUntil(
    self.registration.showNotification(data.title ?? "もくカフェ", {
      body: data.body ?? "",
      icon: "/icons/icon-192.png",
      badge: "/icons/icon-72.png",
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
