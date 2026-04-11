"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { PlaceSuggestion } from "@/app/api/places/autocomplete/route"

type Location = { lat: number; lng: number }

// input は外部（react-hook-form の Controller）から渡す
export const usePlacesAutocomplete = (input: string) => {
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isLocating, setIsLocating] = useState(false)
  const [location, setLocation] = useState<Location | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // input が変わるたびに 300ms デバウンスで候補を取得する
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
        const res = await fetch("/api/places/autocomplete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ input, ...(location ?? {}) }),
        })
        const data = await res.json()
        setSuggestions(data.suggestions ?? [])
        setIsOpen(true)
      } finally {
        setIsLoading(false)
      }
    }, 300)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [input, location])

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

  const closeSuggestions = useCallback(() => setIsOpen(false), [])

  return {
    suggestions,
    isLoading,
    isLocating,
    isLocationSet: !!location,
    isOpen,
    locateMe,
    closeSuggestions,
  }
}
