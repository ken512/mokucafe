"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { PlaceSuggestion } from "@/app/api/places/autocomplete/route"

type Location = { lat: number; lng: number }

// input は外部（react-hook-form の Controller）から渡す
export const usePlacesAutocomplete = (input: string) => {
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([])
  // 現在地取得後に Near by Search で取得した近くのカフェ一覧
  const [nearbySuggestions, setNearbySuggestions] = useState<PlaceSuggestion[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isLocating, setIsLocating] = useState(false)
  const [location, setLocation] = useState<Location | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // input が変わるたびに 300ms デバウンスで候補を取得する
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)

    // 2文字未満のとき: nearby があれば表示、なければ閉じる
    if (input.trim().length < 2) {
      setSuggestions([])
      if (nearbySuggestions.length === 0) setIsOpen(false)
      return
    }

    debounceRef.current = setTimeout(async () => {
      setIsLoading(true)
      try {
        const res = await fetch("/api/places/autocomplete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ input, ...(location ?? {}) }),
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
  }, [input, location, nearbySuggestions.length])

  // ブラウザの位置情報を取得し、取得後に Nearby Search でカフェを先読みする
  const locateMe = useCallback(() => {
    if (!navigator.geolocation) return
    setIsLocating(true)
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude }
        setLocation(loc)
        setIsLocating(false)

        // 現在地周辺のカフェを先読みして近く候補として保持する
        try {
          const res = await fetch("/api/places/nearby", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(loc),
          })
          const data = await res.json()
          setNearbySuggestions(data.suggestions ?? [])
        } catch {
          // nearby 取得失敗は無視（autocomplete は引き続き使える）
        }
      },
      () => {
        setIsLocating(false)
      }
    )
  }, [])

  // フォームフォーカス時：未入力かつ near by 候補があれば開く
  const openNearby = useCallback(() => {
    if (input.trim().length < 2 && nearbySuggestions.length > 0) {
      setIsOpen(true)
    }
  }, [input, nearbySuggestions.length])

  const closeSuggestions = useCallback(() => setIsOpen(false), [])

  // 表示する候補：入力中は autocomplete、未入力は nearby
  const displaySuggestions =
    input.trim().length >= 2 ? suggestions : nearbySuggestions

  return {
    suggestions: displaySuggestions,
    isNearby: input.trim().length < 2 && nearbySuggestions.length > 0,
    isLoading,
    isLocating,
    isLocationSet: !!location,
    isOpen,
    locateMe,
    openNearby,
    closeSuggestions,
  }
}
