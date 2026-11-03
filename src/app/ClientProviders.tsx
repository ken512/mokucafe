"use client"

import PushSubscriptionManager from "@/components/ui/PushSubscriptionManager"
import NotificationSetupBanner from "@/components/ui/NotificationSetupBanner"
import PwaOnboardingModal from "@/components/ui/PwaOnboardingModal"

export const ClientProviders = ({ isLoggedIn }: { isLoggedIn: boolean }) => {
  if (!isLoggedIn) return null

  return (
    <>
      <PushSubscriptionManager />
      <NotificationSetupBanner />
      <PwaOnboardingModal />
    </>
  )
}
