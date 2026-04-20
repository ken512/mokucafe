import { MetadataRoute } from "next"

// PWA マニフェスト（/manifest.webmanifest として自動公開される）
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "もくカフェ",
    short_name: "もくカフェ",
    description: "カフェで作業仲間を見つけよう",
    start_url: "/",
    display: "standalone",
    background_color: "#f5f5f4",
    theme_color: "#78350f",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  }
}
