"use client"

import { useEffect, useRef } from "react"
import { PlaceSuggestion } from "@/app/api/places/autocomplete/route"
import { usePlacesAutocomplete } from "../hooks/usePlacesAutocomplete"

type Props = {
  onSelect: (suggestion: PlaceSuggestion) => void
}

// カフェ名入力 + Places Autocomplete ドロップダウン
const CafeAutocompleteInput = ({ onSelect }: Props) => {
  const {
    input,
    setInput,
    suggestions,
    isLoading,
    isLocating,
    isLocationSet,
    isOpen,
    locateMe,
    closeSuggestions,
  } = usePlacesAutocomplete()

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

  const handleSelect = (suggestion: PlaceSuggestion) => {
    setInput(suggestion.name)
    onSelect(suggestion)
    closeSuggestions()
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
          className="flex items-center gap-1 text-xs text-amber-900 hover:text-amber-700 disabled:opacity-50 transition-colors"
        >
          {isLocating ? (
            "取得中..."
          ) : (
            <>
              <span>📍</span>
              <span>{isLocationSet ? "現在地設定済み" : "現在地から探す"}</span>
            </>
          )}
        </button>
      </div>

      {/* 入力欄 */}
      <div className="relative">
        <input
          id="cafeName"
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="例：スターバックス 渋谷店"
          autoComplete="off"
          className="border border-stone-200 rounded-xl px-4 py-3 text-sm text-stone-800 placeholder:text-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-900/30 focus:border-amber-900 transition-colors w-full"
        />
        {isLoading && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-400">
            検索中...
          </span>
        )}

        {/* 候補ドロップダウン */}
        {isOpen && suggestions.length > 0 && (
          <ul className="absolute z-10 w-full mt-1 bg-white border border-stone-200 rounded-xl shadow-md overflow-hidden">
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
