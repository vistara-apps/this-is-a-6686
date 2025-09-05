import React, { useState, useEffect } from 'react'
import { TrendingUp, Clock, BookOpen } from 'lucide-react'
import SummaryCard from '../components/SummaryCard'
import TopicSelector from '../components/TopicSelector'
import { fetchTrendingTopics, fetchRedditPosts } from '../lib/reddit'
import { useSubscription } from '../contexts/SubscriptionContext'

function Dashboard() {
  const [topics, setTopics] = useState([])
  const [selectedTopics, setSelectedTopics] = useState(['programming'])
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(false)
  const { subscriptionTier, hasAccess } = useSubscription()

  useEffect(() => {
    loadTrendingTopics()
  }, [])

  useEffect(() => {
    if (selectedTopics.length > 0) {
      loadPosts()
    }
  }, [selectedTopics])

  const loadTrendingTopics = async () => {
    try {
      const trendingTopics = await fetchTrendingTopics()
      setTopics(trendingTopics)
    } catch (error) {
      console.error('Error loading topics:', error)
    }
  }

  const loadPosts = async () => {
    setLoading(true)
    try {
      const allPosts = []
      for (const topicId of selectedTopics) {
        const topicPosts = await fetchRedditPosts(topicId)
        allPosts.push(...topicPosts)
      }
      setPosts(allPosts)
    } catch (error) {
      console.error('Error loading posts:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">
          Discover and digest the most valuable discussions from Reddit
        </p>
      </div>

      {/* Subscription Status */}
      <div className="card p-4 mb-6 bg-gradient-to-r from-primary-50 to-accent-50">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">
              {subscriptionTier === 'free' ? 'Free Plan' : `${subscriptionTier.charAt(0).toUpperCase() + subscriptionTier.slice(1)} Plan`}
            </h3>
            <p className="text-sm text-gray-600">
              {subscriptionTier === 'free' 
                ? 'Upgrade to access AI summaries and insights'
                : 'Enjoying full access to Reddit Digest features'
              }
            </p>
          </div>
          {subscriptionTier === 'free' && (
            <button className="btn-primary">
              Upgrade Now
            </button>
          )}
        </div>
      </div>

      {/* Topic Selection */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Select Topics</h2>
        <TopicSelector
          topics={topics}
          selectedTopics={selectedTopics}
          onSelectionChange={setSelectedTopics}
          variant="multi-select"
        />
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="card p-4">
          <div className="flex items-center">
            <TrendingUp className="w-8 h-8 text-primary-500 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Active Topics</p>
              <p className="text-xl font-semibold">{selectedTopics.length}</p>
            </div>
          </div>
        </div>
        
        <div className="card p-4">
          <div className="flex items-center">
            <BookOpen className="w-8 h-8 text-accent-500 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Available Posts</p>
              <p className="text-xl font-semibold">{posts.length}</p>
            </div>
          </div>
        </div>
        
        <div className="card p-4">
          <div className="flex items-center">
            <Clock className="w-8 h-8 text-primary-500 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Last Updated</p>
              <p className="text-xl font-semibold">2m ago</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content Feed */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Latest Discussions</h2>
        
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
          </div>
        ) : posts.length === 0 ? (
          <div className="card p-8 text-center">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No posts found</h3>
            <p className="text-gray-600">
              Select some topics to see relevant Reddit discussions here.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {posts.map((post) => (
              <SummaryCard 
                key={post.id} 
                post={post} 
                variant="detailed"
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard