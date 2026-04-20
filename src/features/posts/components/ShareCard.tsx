import { forwardRef } from "react"
import { Post } from "../types"

type Props = {
  post: Post
}

// html2canvas でキャプチャするシェアカード（縦固定）
// 外部フォント・外部画像は CORS 問題を避けるため使用しない
const ShareCard = forwardRef<HTMLDivElement, Props>(({ post }, ref) => {
  // 日時フォーマット
  const formatDate = (iso: string) => {
    const d = new Date(iso)
    return `${d.getMonth() + 1}/${d.getDate()}（${["日","月","火","水","木","金","土"][d.getDay()]}） ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`
  }

  const dateStr = formatDate(post.date)
  const endStr = post.endDate ? `〜${String(new Date(post.endDate).getHours()).padStart(2, "0")}:${String(new Date(post.endDate).getMinutes()).padStart(2, "0")}` : ""

  return (
    <div
      ref={ref}
      style={{
        width: 360,
        height: 480,
        backgroundColor: "#fafaf9",
        borderRadius: 20,
        padding: 32,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        fontFamily: "sans-serif",
        position: "relative",
        overflow: "hidden",
        border: "1px solid #e7e5e4",
        boxSizing: "border-box",
      }}
    >
      {/* 背景装飾 */}
      <div style={{
        position: "absolute",
        top: -40,
        right: -40,
        width: 200,
        height: 200,
        borderRadius: "50%",
        background: "rgba(120,53,15,0.06)",
      }} />
      <div style={{
        position: "absolute",
        bottom: -60,
        left: -40,
        width: 240,
        height: 240,
        borderRadius: "50%",
        background: "rgba(120,53,15,0.04)",
      }} />

      {/* メインコンテンツ */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12, flex: 1 }}>
        {/* アプリ名 */}
        <p style={{ fontSize: 13, color: "#92400e", fontWeight: 700, margin: 0 }}>
          ☕ もくカフェ
        </p>

        {/* カフェ名 */}
        <p style={{
          fontSize: 22,
          fontWeight: 800,
          color: "#1c1917",
          margin: 0,
          lineHeight: 1.3,
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}>
          {post.cafeName}
        </p>

        {/* 日時 */}
        <p style={{ fontSize: 14, color: "#57534e", margin: 0, fontWeight: 600 }}>
          📅 {dateStr}{endStr}
        </p>

        {/* 住所 */}
        {post.cafeAddress && (
          <p style={{
            fontSize: 11,
            color: "#78716c",
            margin: 0,
            display: "-webkit-box",
            WebkitLineClamp: 1,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}>
            📍 {post.cafeAddress}
          </p>
        )}

        {/* タグ */}
        {post.tags.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {post.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                style={{
                  fontSize: 11,
                  color: "#92400e",
                  backgroundColor: "#fef3c7",
                  border: "1px solid #fde68a",
                  borderRadius: 20,
                  padding: "3px 10px",
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* 残枠 */}
        <p style={{ fontSize: 13, color: "#57534e", margin: 0 }}>
          👥 残り{Math.max(0, post.capacity - post.applicantCount)}枠 / {post.capacity}人
        </p>
      </div>

      {/* ホスト */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 12 }}>
        {post.host.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.host.avatarUrl}
            alt={post.host.name ?? ""}
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              objectFit: "cover",
              flexShrink: 0,
            }}
          />
        ) : (
          <div style={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            backgroundColor: "#78350f",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontWeight: 700,
            fontSize: 13,
            flexShrink: 0,
          }}>
            {post.host.name?.charAt(0) ?? "?"}
          </div>
        )}
        <p style={{ fontSize: 13, color: "#1c1917", margin: 0, fontWeight: 600 }}>
          {post.host.name}
        </p>
      </div>
    </div>
  )
})

ShareCard.displayName = "ShareCard"
export default ShareCard
