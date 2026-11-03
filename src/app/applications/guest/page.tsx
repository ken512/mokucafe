import GuestApplicationPage from "@/features/applications/components/GuestApplicationPage"

export const metadata = {
  title: "応募状況の確認",
  robots: { index: false, follow: false },
  referrer: "no-referrer" as const,
}

export default function Page() {
  return <div className="mx-auto max-w-lg px-4 py-8"><GuestApplicationPage /></div>
}
