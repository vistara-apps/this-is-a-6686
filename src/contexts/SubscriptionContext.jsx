import React, { createContext, useContext, useState } from 'react'
import { useAuth } from './AuthContext'

const SubscriptionContext = createContext({})

export const useSubscription = () => {
  const context = useContext(SubscriptionContext)
  if (!context) {
    throw new Error('useSubscription must be used within a SubscriptionProvider')
  }
  return context
}

export function SubscriptionProvider({ children }) {
  const { user } = useAuth()
  const [subscriptionTier, setSubscriptionTier] = useState('free') // free, basic, premium

  const hasAccess = (feature) => {
    if (!user) return false
    
    switch (feature) {
      case 'basic_summaries':
        return subscriptionTier === 'basic' || subscriptionTier === 'premium'
      case 'advanced_insights':
        return subscriptionTier === 'premium'
      case 'save_insights':
        return subscriptionTier === 'basic' || subscriptionTier === 'premium'
      case 'unlimited_summaries':
        return subscriptionTier === 'premium'
      default:
        return false
    }
  }

  const value = {
    subscriptionTier,
    setSubscriptionTier,
    hasAccess
  }

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  )
}