import React, { useState } from 'react'
import { User, CreditCard, Bell, Settings } from 'lucide-react'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useAuth } from '../contexts/AuthContext'
import { useSubscription } from '../contexts/SubscriptionContext'
import { usePaymentContext } from '../hooks/usePaymentContext'
import toast from 'react-hot-toast'

function Profile() {
  const { user, signOut } = useAuth()
  const { subscriptionTier, setSubscriptionTier } = useSubscription()
  const { createSession } = usePaymentContext()
  const [loading, setLoading] = useState(false)

  const handleUpgrade = async (plan) => {
    setLoading(true)
    try {
      await createSession(plan)
      setSubscriptionTier(plan)
      toast.success(`Upgraded to ${plan} plan!`)
    } catch (error) {
      toast.error('Upgrade failed. Please try again.')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile & Settings</h1>
        <p className="text-gray-600">
          Manage your account, subscription, and preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Account */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <User size={20} className="mr-2" />
              Account Information
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full p-3 border rounded-md bg-gray-50 text-gray-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Member Since
                </label>
                <input
                  type="text"
                  value={new Date(user?.created_at || Date.now()).toLocaleDateString()}
                  disabled
                  className="w-full p-3 border rounded-md bg-gray-50 text-gray-500"
                />
              </div>
            </div>
          </div>

          {/* Subscription */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <CreditCard size={20} className="mr-2" />
              Subscription
            </h2>
            
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Current Plan</span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  subscriptionTier === 'premium' 
                    ? 'bg-primary-100 text-primary-700'
                    : subscriptionTier === 'basic'
                    ? 'bg-accent-100 text-accent-700'
                    : 'bg-gray-100 text-gray-700'
                }`}>
                  {subscriptionTier.charAt(0).toUpperCase() + subscriptionTier.slice(1)}
                </span>
              </div>
              
              {subscriptionTier === 'free' && (
                <p className="text-sm text-gray-600 mb-4">
                  Upgrade to unlock AI summaries and advanced features
                </p>
              )}
            </div>

            {subscriptionTier !== 'premium' && (
              <div className="space-y-2">
                {subscriptionTier === 'free' && (
                  <button
                    onClick={() => handleUpgrade('basic')}
                    disabled={loading}
                    className="w-full btn-secondary py-3"
                  >
                    {loading ? 'Processing...' : 'Upgrade to Basic ($5/mo)'}
                  </button>
                )}
                
                <button
                  onClick={() => handleUpgrade('premium')}
                  disabled={loading}
                  className="w-full btn-primary py-3"
                >
                  {loading ? 'Processing...' : 'Upgrade to Premium ($9/mo)'}
                </button>
              </div>
            )}
          </div>

          {/* Wallet Connection */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <CreditCard size={20} className="mr-2" />
              Wallet Connection
            </h2>
            
            <p className="text-sm text-gray-600 mb-4">
              Connect your wallet to enable seamless subscription payments
            </p>
            
            <ConnectButton />
          </div>

          {/* Preferences */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Bell size={20} className="mr-2" />
              Notifications
            </h2>
            
            <div className="space-y-4">
              <label className="flex items-center">
                <input type="checkbox" className="mr-3" defaultChecked />
                <span className="text-sm">Email notifications for new trending discussions</span>
              </label>
              
              <label className="flex items-center">
                <input type="checkbox" className="mr-3" defaultChecked />
                <span className="text-sm">Weekly digest emails</span>
              </label>
              
              <label className="flex items-center">
                <input type="checkbox" className="mr-3" />
                <span className="text-sm">Push notifications</span>
              </label>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="card p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Your Activity</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Insights Saved</span>
                <span className="font-medium">23</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Summaries Generated</span>
                <span className="font-medium">156</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Topics Followed</span>
                <span className="font-medium">8</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="card p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Account Actions</h3>
            <div className="space-y-2">
              <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md">
                Export Data
              </button>
              <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md">
                Privacy Settings
              </button>
              <button
                onClick={signOut}
                className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile