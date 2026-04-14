"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { PlaceSuggestion } from "@/app/api/places/autocomplete/route"

type Location = { lat: number; lng: number }

// input・area は外部から渡す（area はエリア絞り込み用の任意テキスト）
export const usePlacesAutocomplete = (input: string, area: string) => {
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isLocating, setIsLocating] = useState(false)
  const [location, setLocation] = useState<Location | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // input または area が変わるたびに 300ms デバウンスで候補を取得する
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)

    if (input.trim().length < 2) {
      setSuggestions([])
      setIsOpen(false)
      return
    }

    debounceRef.current = setTimeout(async () => {
      setIsLoading(true)
      try {
        // エリアが指定されていればクエリに付加して検索精度を上げる
        // エリアが指定されている場合は現在地バイアスを使わない（エリア優先）
        const effectiveInput = area.trim() ? `${input} ${area.trim()}` : input
        const locationParams = area.trim() ? {} : (location ?? {})

        const res = await fetch("/api/places/autocomplete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ input: effectiveInput, ...locationParams }),
        })
        const data = await res.json()
        if (data.error) {
          console.error("[usePlacesAutocomplete]", data.error)
        }
        setSuggestions(data.suggestions ?? [])
        setIsOpen(true)
      } finally {
        setIsLoading(false)
      }
    }, 300)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [input, area, location])

  // ブラウザの位置情報を取得する
  const locateMe = useCallback(() => {
    if (!navigator.geolocation) return
    setIsLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setIsLocating(false)
      },
      () => {
        setIsLocating(false)
      }
    )
  }, [])

  // 位置情報をリセットする（エリア指定モードへ切り替える際に使う）
  const clearLocation = useCallback(() => setLocation(null), [])

  const closeSuggestions = useCallback(() => setIsOpen(false), [])

  return {
    suggestions,
    isLoading,
    isLocating,
    isLocationSet: !!location,
    isOpen,
    locateMe,
    clearLocation,
    closeSuggestions,
  }
}
