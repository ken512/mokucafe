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
    closeSuggestions,
  } = usePlacesAutocomplete(value)

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
      <div className="flex items-center justify-between">
        <label htmlFor="cafeName" className="text-sm font-medium text-stone-700">
          カフェ名
        </label>
        {/* 現在地ボタン */}
        <button
          type="button"
          onClick={locateMe}
          disabled={isLocating}
          className={[
            "flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-xl border transition-colors disabled:opacity-50",
            isLocationSet
              ? "bg-amber-900 text-white border-amber-900"
              : "text-stone-600 border-stone-200 hover:bg-stone-50",
          ].join(" ")}
        >
          <span>📍</span>
          <span>
            {isLocating
              ? "取得中..."
              : isLocationSet
                ? "現在地設定済み"
                : "現在地から探す"}
          </span>
        </button>
      </div>

      {/* カフェ名入力欄（react-hook-form の value/onChange と接続済み） */}
      <div className="relative">
        <input
          id="cafeName"
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="例：スターバックス 渋谷店"
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
