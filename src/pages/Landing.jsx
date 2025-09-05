import React, { useState } from 'react'
import { ArrowRight, Check, Zap, BookOpen, Target } from 'lucide-react'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { usePaymentContext } from '../hooks/usePaymentContext'
import { useSubscription } from '../contexts/SubscriptionContext'
import toast from 'react-hot-toast'

function Landing() {
  const { user, signIn, signUp } = useAuth()
  const navigate = useNavigate()
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { createSession } = usePaymentContext()
  const { setSubscriptionTier } = useSubscription()

  const handleAuth = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      if (isLogin) {
        await signIn(email, password)
      } else {
        await signUp(email, password)
      }
      navigate('/app')
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSubscribe = async (plan) => {
    try {
      await createSession(plan)
      setSubscriptionTier(plan)
      toast.success(`Subscribed to ${plan} plan!`)
      if (user) navigate('/app')
    } catch (error) {
      toast.error('Payment failed. Please try again.')
      console.error(error)
    }
  }

  if (user) {
    navigate('/app')
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-accent-50">
      {/* Header */}
      <header className="bg-surface/80 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
              <BookOpen size={20} className="text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">Reddit Digest</h1>
          </div>
          <ConnectButton />
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          Your curated Reddit insights,
          <span className="text-primary-600"> distilled</span>
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Stop drowning in Reddit threads. Get AI-powered summaries and actionable insights 
          from the discussions that matter most to your learning journey.
        </p>
        
        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mb-12 max-w-4xl mx-auto">
          <div className="card p-6 text-center">
            <Zap className="w-12 h-12 text-primary-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Instant Summaries</h3>
            <p className="text-gray-600 text-sm">Get the key points from lengthy Reddit discussions in seconds</p>
          </div>
          
          <div className="card p-6 text-center">
            <Target className="w-12 h-12 text-accent-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Actionable Insights</h3>
            <p className="text-gray-600 text-sm">Extract and save practical tips you can actually use</p>
          </div>
          
          <div className="card p-6 text-center">
            <BookOpen className="w-12 h-12 text-primary-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Curated Topics</h3>
            <p className="text-gray-600 text-sm">Focus on educational content that advances your knowledge</p>
          </div>
        </div>

        {/* Auth Form */}
        <div className="max-w-md mx-auto mb-12">
          <div className="card p-6">
            <form onSubmit={handleAuth} className="space-y-4">
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary py-3 flex items-center justify-center"
              >
                {loading ? 'Loading...' : (isLogin ? 'Sign In' : 'Sign Up')}
                <ArrowRight size={16} className="ml-2" />
              </button>
            </form>
            
            <p className="text-center text-sm text-gray-600 mt-4">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                {isLogin ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          </div>
        </div>

        {/* Pricing */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Choose Your Plan</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {/* Basic Plan */}
            <div className="card p-8 relative">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Basic</h3>
              <div className="text-3xl font-bold text-primary-600 mb-4">
                $5<span className="text-lg text-gray-600">/month</span>
              </div>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center text-sm">
                  <Check size={16} className="text-accent-500 mr-2" />
                  AI-powered summaries
                </li>
                <li className="flex items-center text-sm">
                  <Check size={16} className="text-accent-500 mr-2" />
                  Save insights
                </li>
                <li className="flex items-center text-sm">
                  <Check size={16} className="text-accent-500 mr-2" />
                  Topic subscriptions
                </li>
              </ul>
              <button
                onClick={() => handleSubscribe('basic')}
                className="w-full btn-secondary py-3"
              >
                Subscribe to Basic
              </button>
            </div>

            {/* Premium Plan */}
            <div className="card p-8 relative border-primary-500 border-2">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-primary-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                  Recommended
                </span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Premium</h3>
              <div className="text-3xl font-bold text-primary-600 mb-4">
                $9<span className="text-lg text-gray-600">/month</span>
              </div>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center text-sm">
                  <Check size={16} className="text-accent-500 mr-2" />
                  Everything in Basic
                </li>
                <li className="flex items-center text-sm">
                  <Check size={16} className="text-accent-500 mr-2" />
                  Advanced insight extraction
                </li>
                <li className="flex items-center text-sm">
                  <Check size={16} className="text-accent-500 mr-2" />
                  Unlimited summaries
                </li>
                <li className="flex items-center text-sm">
                  <Check size={16} className="text-accent-500 mr-2" />
                  Priority support
                </li>
              </ul>
              <button
                onClick={() => handleSubscribe('premium')}
                className="w-full btn-primary py-3"
              >
                Subscribe to Premium
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Landing