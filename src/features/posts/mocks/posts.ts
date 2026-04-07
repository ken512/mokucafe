import { Post } from "../types"

// TODO: DBスキーマ確定後、削除してAPIルートからデータ取得に切り替える
export const MOCK_POSTS: Post[] = [
  {
    id: "1",
    cafeName: "Streamer's Coffee",
    cafeAddress: "渋谷区神南1-2-3",
    hostName: "田中 りな",
    // Unsplash: 明るいカフェ内装
    cafeImageUrl: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=600&q=80",
    description: "ポートフォリオ作成中です。同じく作業している方がいれば嬉しいです！気軽に話しかけてください☕",
    tags: ["デザイン", "もくもく歓迎", "初心者OK"],
    startTime: "14:00",
    endTime: "17:00",
    maxParticipants: 3,
    currentParticipants: 1,
    createdAt: "2026-04-07T05:00:00Z",
  },
  {
    id: "2",
    cafeName: "BEAR POND ESPRESSO",
    cafeAddress: "世田谷区三軒茶屋2-11-23",
    hostName: "山本 けんと",
    // Unsplash: エスプレッソバー
    cafeImageUrl: "https://images.unsplash.com/photo-1521017432531-fbd92d768814?auto=format&fit=crop&w=600&q=80",
    description: "副業でWebアプリ開発中。同じくエンジニアの方と話せたら嬉しいです。お互い集中したい方もOK。",
    tags: ["エンジニア", "副業", "React"],
    startTime: "10:00",
    endTime: "13:00",
    maxParticipants: 2,
    currentParticipants: 1,
    createdAt: "2026-04-07T01:00:00Z",
  },
  {
    id: "3",
    cafeName: "猿田彦珈琲 恵比寿店",
    cafeAddress: "渋谷区恵比寿南1-14-15",
    hostName: "佐藤 みく",
    // Unsplash: 落ち着いたカフェ
    cafeImageUrl: "https://images.unsplash.com/photo-1445116572660-236099ec97a0?auto=format&fit=crop&w=600&q=80",
    description: "資格の勉強をしています。一人だと集中力が続かないので、一緒に頑張れる方を募集！",
    tags: ["勉強", "もくもく", "静かめ希望"],
    startTime: "16:00",
    endTime: "20:00",
    maxParticipants: 4,
    currentParticipants: 2,
    createdAt: "2026-04-06T08:00:00Z",
  },
]
