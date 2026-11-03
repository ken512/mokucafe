"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import type { GuestApplication } from "../types"

type Props = { postId?: number; isClosed?: boolean }
type StatusDisplay = { title: string; description: string; className: string }

const statusDisplay: Record<GuestApplication["status"], StatusDisplay> = {
  PENDING: { title: "主催者の承認待ちです", description: "まだ参加は確定していません。時間をおいて、この画面の「最新の状況を確認する」を押してください。", className: "border-amber-200 bg-amber-50 text-amber-950" },
  APPROVED: { title: "主催者に承認されました", description: "参加できる場合は、下の「参加を確定する」を押してください。この操作で参加が確定します。", className: "border-green-200 bg-green-50 text-green-900" },
  ATTENDING: { title: "参加が確定しました", description: "募集の詳細で日時・場所を確認し、当日カフェへお越しください。", className: "border-green-200 bg-green-50 text-green-900" },
  REJECTED: { title: "今回は参加が見送られました", description: "別の募集を探して、参加申請できます。", className: "border-stone-200 bg-stone-50 text-stone-700" },
}

// URLのフラグメントはサーバーや参照元ヘッダーへ送信されない
export default function GuestApplicationPage({ postId, isClosed }: Props) {
  const [name, setName] = useState("")
  const [message, setMessage] = useState("")
  const [url, setUrl] = useState("")
  const [application, setApplication] = useState<GuestApplication | null>(null)
  const [busy, setBusy] = useState(!postId)
  const [error, setError] = useState("")
  const [copied, setCopied] = useState(false)
  const [updatedAt, setUpdatedAt] = useState("")

  const load = useCallback(async (confirm = false) => {
    setBusy(true)
    setError("")
    try {
      const res = await fetch("/api/guest-applications", {
        method: confirm ? "PATCH" : "GET",
        headers: { Authorization: `Bearer ${window.location.hash.slice(1)}` },
        cache: "no-store",
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setApplication(data.application)
      setUpdatedAt(new Intl.DateTimeFormat("ja-JP", { timeZone: "Asia/Tokyo", hour: "2-digit", minute: "2-digit", second: "2-digit" }).format(new Date()))
    } catch (e) { setError(e instanceof Error ? e.message : "取得に失敗しました") }
    finally { setBusy(false) }
  }, [])

  useEffect(() => {
    if (!postId) {
      setUrl(window.location.href)
      void load()
      return
    }
    try { setUrl(localStorage.getItem(`guest-application-${postId}`) ?? "") } catch { /* 保存できない環境でも応募可能 */ }
  }, [postId, load])

  const apply = async () => {
    setBusy(true)
    setError("")
    try {
      const res = await fetch(`/api/posts/${postId}/applications`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, message }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      const nextUrl = `${window.location.origin}/applications/guest#${data.guestToken}`
      setUrl(nextUrl)
      try { localStorage.setItem(`guest-application-${postId}`, nextUrl) } catch { /* URLを手動で保存可能 */ }
    } catch (e) { setError(e instanceof Error ? e.message : "応募に失敗しました") }
    finally { setBusy(false) }
  }

  const copyUrl = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
    } catch {
      setError("下の確認URLを長押し、または選択してコピーし、メモなどに保存してください。")
    }
  }

  const button = "w-full rounded-xl bg-amber-900 px-4 py-3 text-sm font-bold text-white hover:bg-amber-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-900 disabled:opacity-50"
  const secondaryButton = "w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm font-medium text-stone-800 hover:bg-stone-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-900 disabled:opacity-50"
  const input = "mt-2 block w-full rounded-lg border border-stone-300 bg-white p-3 text-base text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-900/40"
  const savedLink = <section className="flex flex-col gap-3 border-t border-stone-200 pt-4" aria-label="確認URLの保存">
    <h3 className="font-bold text-stone-900">この確認URLを保存してください</h3>
    <p className="text-sm leading-relaxed text-stone-700">コピーしてスマホのメモに貼り付けるか、確認画面をブックマークしてください。Safari・Chromeなど別のブラウザでも、同じURLで確認できます。</p>
    <button type="button" className={secondaryButton} onClick={() => void copyUrl()}>確認URLをコピーする</button>
    {copied && <p role="status" className="text-sm font-medium text-green-800">コピーしました。メモなどに貼り付けて保存してください。</p>}
    <label className="text-xs font-medium text-stone-600">本人専用の確認URL
      <input aria-label="本人専用の確認URL" readOnly value={url} onFocus={(e) => e.target.select()} className={`${input} text-sm`} />
    </label>
    <p className="text-xs leading-relaxed text-stone-600">このURLで参加の操作ができます。他の人には共有しないでください。URLを紛失した場合、再発行はできません。</p>
  </section>

  return <div className="flex flex-col gap-5 rounded-2xl bg-white p-5 text-stone-800 shadow-sm sm:p-6" aria-busy={busy}>
    {postId ? <h2 className="text-lg font-bold">{url ? "参加申請を受け付けました" : "登録せずに参加申請"}</h2> : <h1 className="text-lg font-bold">応募状況の確認</h1>}
    {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</p>}
    {postId ? url ? <>
      <div className="border-l-4 border-amber-700 bg-amber-50 p-4">
        <p className="font-bold text-amber-950">最新の応募状況は確認画面で</p>
        <p className="mt-2 text-sm leading-relaxed text-amber-950">承認状況や参加が確定しているかを確認できます。承認されたら「参加を確定する」を押してください。</p>
      </div>
      <a href={url} className={`${button} text-center`}>応募状況を確認する</a>
      <p className="text-sm leading-relaxed">メール・プッシュ通知は届きません。保存したURLを後で開いて、承認・却下をご自身で確認してください。</p>
      {savedLink}
    </> : isClosed ? <p>受付終了</p> : <>
      <div className="border-l-4 border-amber-700 bg-amber-50 p-4">
        <h3 className="text-sm font-bold text-amber-950">参加までの流れ</h3>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-amber-950">
          <li>名前を入力して参加申請する</li>
          <li>応募後の確認URLを保存し、後で開いて承認状況を確認する</li>
          <li>承認されたら「参加を確定する」を押す</li>
        </ol>
        <p className="mt-3 text-sm font-medium text-amber-950">メール・プッシュ通知は届きません。申請だけでは参加確定になりません。</p>
      </div>
      <form className="flex flex-col gap-4" onSubmit={(e) => { e.preventDefault(); void apply() }}>
        <label className="text-sm font-medium">名前（必須）<input required maxLength={50} value={name} onChange={(e) => setName(e.target.value)} className={input} autoComplete="name" placeholder="主催者に表示する名前" /></label>
        <label className="text-sm font-medium">メッセージ（任意・500文字以内）<textarea maxLength={500} value={message} onChange={(e) => setMessage(e.target.value)} className={input} rows={3} /></label>
        <button disabled={busy || !name.trim()} className={button}>{busy ? "送信中..." : "参加申請する"}</button>
      </form>
    </> : <>
      {application && <>
        <div><p className="font-bold">{application.post.cafeName}</p><p className="mt-1 text-sm text-stone-600">{application.name}さんの応募状況</p></div>
        <div role="status" className={`rounded-xl border p-4 ${statusDisplay[application.status].className}`}>
          <h2 className="font-bold">{statusDisplay[application.status].title}</h2>
          <p className="mt-2 text-sm leading-relaxed">{statusDisplay[application.status].description}</p>
        </div>
        {application.status === "APPROVED" && <button disabled={busy} onClick={() => void load(true)} className={button}>{busy ? "処理中..." : "参加を確定する"}</button>}
        {application.status === "REJECTED" && <Link href="/posts" className="text-sm text-amber-900 underline underline-offset-4">別の募集を探す</Link>}
      </>}
      <div className="flex flex-col gap-2">
        <button disabled={busy} onClick={() => void load()} className={secondaryButton}>{busy ? "確認中..." : "最新の状況を確認する"}</button>
        {updatedAt && <p className="text-right text-xs text-stone-500">最終確認 {updatedAt}（日本時間）</p>}
        <p className="text-sm leading-relaxed text-stone-600">メール・プッシュ通知や自動更新はありません。この画面を開き、「最新の状況を確認する」を押してください。</p>
      </div>
      {application && <Link href={`/posts/${application.post.id}`} className="text-sm text-amber-900 underline underline-offset-4">募集の日時・場所を確認する</Link>}
      {url && savedLink}
    </>}
  </div>
}
