import { supabase } from './supabase'

// Stripe configuration
const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
const STRIPE_SECRET_KEY = import.meta.env.VITE_STRIPE_SECRET_KEY

// Subscription plans configuration
export const SUBSCRIPTION_PLANS = {
  free: {
    id: 'free',
    name: 'Free',
    price: 0,
    priceId: null,
    features: [
      'Browse trending topics',
      'View Reddit discussions',
      'Basic search functionality',
      'Limited to 5 insights per month'
    ],
    limits: {
      insights: 5,
      summaries: 0,
      topics: 3
    }
  },
  basic: {
    id: 'basic',
    name: 'Basic',
    price: 5,
    priceId: import.meta.env.VITE_STRIPE_BASIC_PRICE_ID,
    features: [
      'Everything in Free',
      'AI-powered summaries',
      'Save unlimited insights',
      'Email notifications',
      'Up to 10 subscribed topics'
    ],
    limits: {
      insights: -1, // unlimited
      summaries: -1, // unlimited
      topics: 10
    }
  },
  premium: {
    id: 'premium',
    name: 'Premium',
    price: 9,
    priceId: import.meta.env.VITE_STRIPE_PREMIUM_PRICE_ID,
    features: [
      'Everything in Basic',
      'Advanced insight extraction',
      'Weekly digest emails',
      'Priority support',
      'Unlimited subscribed topics',
      'Export data functionality'
    ],
    limits: {
      insights: -1, // unlimited
      summaries: -1, // unlimited
      topics: -1 // unlimited
    }
  }
}

// Create Stripe checkout session
export const createCheckoutSession = async (userId, planId) => {
  try {
    const plan = SUBSCRIPTION_PLANS[planId]
    if (!plan || !plan.priceId) {
      throw new Error('Invalid plan selected')
    }

    // Get user email
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('email')
      .eq('id', userId)
      .single()

    if (userError) throw userError

    // Create checkout session via Supabase Edge Function
    const { data, error } = await supabase.functions.invoke('create-checkout-session', {
      body: {
        priceId: plan.priceId,
        userId,
        userEmail: user.email,
        planId
      }
    })

    if (error) throw error

    return data.url
  } catch (error) {
    console.error('Error creating checkout session:', error)
    throw error
  }
}

// Create customer portal session
export const createPortalSession = async (userId) => {
  try {
    const { data, error } = await supabase.functions.invoke('create-portal-session', {
      body: { userId }
    })

    if (error) throw error

    return data.url
  } catch (error) {
    console.error('Error creating portal session:', error)
    throw error
  }
}

// Get user's current subscription
export const getCurrentSubscription = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('subscription_history')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (error && error.code !== 'PGRST116') {
      throw error
    }

    return data || null
  } catch (error) {
    console.error('Error getting current subscription:', error)
    return null
  }
}

// Update user subscription in database
export const updateUserSubscription = async (userId, subscriptionData) => {
  try {
    // Update user's subscription tier
    const { error: userError } = await supabase
      .from('users')
      .update({ subscription_tier: subscriptionData.plan })
      .eq('id', userId)

    if (userError) throw userError

    // Add subscription history record
    const { error: historyError } = await supabase
      .from('subscription_history')
      .insert([{
        user_id: userId,
        plan: subscriptionData.plan,
        status: subscriptionData.status,
        stripe_subscription_id: subscriptionData.stripeSubscriptionId,
        amount_paid: subscriptionData.amountPaid,
        expires_at: subscriptionData.expiresAt
      }])

    if (historyError) throw historyError

    return true
  } catch (error) {
    console.error('Error updating user subscription:', error)
    throw error
  }
}

// Cancel subscription
export const cancelSubscription = async (userId) => {
  try {
    const { data, error } = await supabase.functions.invoke('cancel-subscription', {
      body: { userId }
    })

    if (error) throw error

    return data
  } catch (error) {
    console.error('Error canceling subscription:', error)
    throw error
  }
}

// Check if user has access to a feature
export const hasFeatureAccess = (subscriptionTier, feature) => {
  const plan = SUBSCRIPTION_PLANS[subscriptionTier] || SUBSCRIPTION_PLANS.free
  
  switch (feature) {
    case 'summaries':
      return subscriptionTier !== 'free'
    case 'unlimited_insights':
      return plan.limits.insights === -1
    case 'email_notifications':
      return subscriptionTier !== 'free'
    case 'weekly_digest':
      return subscriptionTier === 'premium'
    case 'export_data':
      return subscriptionTier === 'premium'
    case 'priority_support':
      return subscriptionTier === 'premium'
    default:
      return true
  }
}

// Check if user is within usage limits
export const checkUsageLimit = async (userId, feature) => {
  try {
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('subscription_tier')
      .eq('id', userId)
      .single()

    if (userError) throw userError

    const plan = SUBSCRIPTION_PLANS[user.subscription_tier] || SUBSCRIPTION_PLANS.free
    const limit = plan.limits[feature]

    // If unlimited (-1), always return true
    if (limit === -1) return { allowed: true, remaining: -1 }

    // Get current usage
    let currentUsage = 0
    const currentMonth = new Date()
    currentMonth.setDate(1)
    currentMonth.setHours(0, 0, 0, 0)

    switch (feature) {
      case 'insights':
        const { count: insightCount } = await supabase
          .from('insights')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId)
          .gte('created_at', currentMonth.toISOString())
        
        currentUsage = insightCount || 0
        break

      case 'topics':
        const { count: topicCount } = await supabase
          .from('user_topics')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId)
        
        currentUsage = topicCount || 0
        break

      default:
        return { allowed: true, remaining: -1 }
    }

    const remaining = Math.max(0, limit - currentUsage)
    return {
      allowed: currentUsage < limit,
      remaining,
      used: currentUsage,
      limit
    }
  } catch (error) {
    console.error('Error checking usage limit:', error)
    return { allowed: false, remaining: 0 }
  }
}

// Get subscription analytics for admin
export const getSubscriptionAnalytics = async () => {
  try {
    const { data, error } = await supabase
      .from('subscription_history')
      .select(`
        plan,
        status,
        amount_paid,
        created_at,
        users(email)
      `)
      .eq('status', 'active')

    if (error) throw error

    // Calculate metrics
    const analytics = {
      totalActiveSubscriptions: data.length,
      monthlyRevenue: data.reduce((sum, sub) => sum + (sub.amount_paid || 0), 0),
      planDistribution: {},
      recentSubscriptions: data
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 10)
    }

    // Calculate plan distribution
    data.forEach(sub => {
      analytics.planDistribution[sub.plan] = (analytics.planDistribution[sub.plan] || 0) + 1
    })

    return analytics
  } catch (error) {
    console.error('Error getting subscription analytics:', error)
    throw error
  }
}
