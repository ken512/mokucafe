"use client"

import { useEffect, useRef, useState } from "react"
import { PlaceSuggestion } from "@/app/api/places/autocomplete/route"
import { usePlacesAutocomplete } from "../hooks/usePlacesAutocomplete"

type Props = {
  // react-hook-form の Controller から渡される
  value: string
  onChange: (value: string) => void
  onSelect: (suggestion: PlaceSuggestion) => void
  error?: boolean
}

type SearchMode = "location" | "area" | null

// placeId から建物名・郵便番号を含む完全な住所を取得する
const fetchFormattedAddress = async (placeId: string): Promise<string | null> => {
  try {
    const res = await fetch(`/api/places/details?placeId=${encodeURIComponent(placeId)}`)
    const data = await res.json()
    return data.formattedAddress ?? null
  } catch {
    return null
  }
}

// カフェ名入力 + Places Autocomplete ドロップダウン
const CafeAutocompleteInput = ({ value, onChange, onSelect, error }: Props) => {
  const [searchMode, setSearchMode] = useState<SearchMode>(null)
  const [area, setArea] = useState("")
  const [isFetchingAddress, setIsFetchingAddress] = useState(false)

  const {
    suggestions,
    isNearby,
    isLoading,
    isLocating,
    isLocationSet,
    isOpen,
    locateMe,
    openNearby,
    clearLocation,
    closeSuggestions,
  } = usePlacesAutocomplete(value, area)

  const containerRef = useRef<HTMLDivElement>(null)

  // コンテナ外クリックでドロップダウンを閉じる
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        closeSuggestions()
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [closeSuggestions])

  // 「現在地から探す」を選択したとき
  const handleLocationMode = () => {
    setSearchMode("location")
    setArea("")
    locateMe()
  }

  // 「エリアを指定する」を選択したとき
  const handleAreaMode = () => {
    setSearchMode("area")
    clearLocation()
  }

  // 候補を選択したとき：カフェ名を即時反映し、Place Details で完全な住所を取得する
  const handleSelect = async (suggestion: PlaceSuggestion) => {
    onChange(suggestion.name)
    closeSuggestions()
    setIsFetchingAddress(true)

    // Place Details API で建物名・郵便番号込みの完全な住所を取得する
    const formattedAddress = await fetchFormattedAddress(suggestion.placeId)
    setIsFetchingAddress(false)

    // 取得できれば完全な住所、失敗時は Autocomplete の住所にフォールバック
    onSelect({
      ...suggestion,
      address: formattedAddress ?? suggestion.address,
    })
  }

  return (
    <div className="flex flex-col gap-1.5" ref={containerRef}>
      <label htmlFor="cafeName" className="text-sm font-medium text-stone-700">
        カフェ名
      </label>

      {/* 検索エリアの設定トグル */}
      <div className="flex rounded-xl border border-stone-200 overflow-hidden text-sm">
        <button
          type="button"
          onClick={handleLocationMode}
          disabled={isLocating}
          className={[
            "flex-1 flex items-center justify-center gap-1.5 py-2.5 transition-colors",
            searchMode === "location"
              ? "bg-amber-900 text-white"
              : "text-stone-600 hover:bg-stone-50",
          ].join(" ")}
        >
          <span>📍</span>
          <span>
            {isLocating
              ? "取得中..."
              : isLocationSet && searchMode === "location"
                ? "現在地設定済み"
                : "現在地から探す"}
          </span>
        </button>
        <button
          type="button"
          onClick={handleAreaMode}
          className={[
            "flex-1 flex items-center justify-center gap-1.5 py-2.5 border-l border-stone-200 transition-colors",
            searchMode === "area"
              ? "bg-amber-900 text-white"
              : "text-stone-600 hover:bg-stone-50",
          ].join(" ")}
        >
          <span>🗺️</span>
          <span>エリアを指定する</span>
        </button>
      </div>

      {/* エリア入力欄（「エリアを指定する」選択時のみ表示） */}
      {searchMode === "area" && (
        <input
          type="text"
          value={area}
          onChange={(e) => setArea(e.target.value)}
          placeholder="例：渋谷、大阪 梅田、新宿"
          autoFocus
          className="border border-amber-200 bg-amber-50 rounded-xl px-4 py-2.5 text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-900/30 focus:border-amber-900 transition-colors w-full"
        />
      )}

      {/* カフェ名入力欄（react-hook-form の value/onChange と接続済み） */}
      <div className="relative">
        <input
          id="cafeName"
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={
            searchMode === "area" && area
              ? `例：スターバックス（${area}周辺を検索中）`
              : "例：スターバックス 渋谷店"
          }
          autoComplete="off"
          onFocus={openNearby}
          className={[
            "border rounded-xl px-4 py-3 text-sm text-stone-800 placeholder:text-stone-300",
            "focus:outline-none focus:ring-2 focus:ring-amber-900/30 focus:border-amber-900",
            "transition-colors w-full",
            error ? "border-red-300 focus:ring-red-300/30 focus:border-red-400" : "border-stone-200",
          ].join(" ")}
        />
        {(isLoading || isFetchingAddress) && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-400">
            {isFetchingAddress ? "住所を取得中..." : "検索中..."}
          </span>
        )}

        {/* 候補ドロップダウン */}
        {isOpen && suggestions.length > 0 && (
          <ul className="absolute z-10 w-full mt-1 bg-white border border-stone-200 rounded-xl shadow-md overflow-hidden">
            {/* Near by モード時のラベル */}
            {isNearby && (
              <li className="px-4 py-2 text-xs text-amber-800 font-medium bg-amber-50 border-b border-amber-100">
                📍 現在地周辺のカフェ
              </li>
            )}
            {suggestions.map((s) => (
              <li key={s.placeId}>
                <button
                  type="button"
                  onClick={() => handleSelect(s)}
                  className="w-full text-left px-4 py-3 hover:bg-amber-50 transition-colors border-b border-stone-100 last:border-0"
                >
                  <p className="text-sm font-medium text-stone-800">{s.name}</p>
                  <p className="text-xs text-stone-500 mt-0.5">{s.address}</p>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

export default CafeAutocompleteInput
