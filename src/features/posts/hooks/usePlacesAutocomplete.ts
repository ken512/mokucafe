"use client"

import { useState, useEffect, useRef } from "react"
import { PlaceSuggestion } from "@/app/api/places/autocomplete/route"

type Location = { lat: number; lng: number }

export const usePlacesAutocomplete = () => {
  const [input, setInput] = useState("")
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isLocating, setIsLocating] = useState(false)
  const [location, setLocation] = useState<Location | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // 入力が変わるたびに300msデバウンスで候補を取得する
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
  const locateMe = () => {
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
  }

  const closeSuggestions = () => setIsOpen(false)

  return {
    input,
    setInput,
    suggestions,
    isLoading,
    isLocating,
    isLocationSet: !!location,
    isOpen,
    locateMe,
    closeSuggestions,
  }
}
