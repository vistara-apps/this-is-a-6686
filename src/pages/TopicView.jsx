import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { ArrowLeft, Filter } from 'lucide-react'
import { Link } from 'react-router-dom'
import SummaryCard from '../components/SummaryCard'
import { fetchRedditPosts } from '../lib/reddit'

function TopicView() {
  const { topicId } = useParams()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [timeframe, setTimeframe] = useState('week')
  const [sortBy, setSortBy] = useState('hot')

  useEffect(() => {
    loadPosts()
  }, [topicId, timeframe, sortBy])

  const loadPosts = async () => {
    setLoading(true)
    try {
      const posts = await fetchRedditPosts(topicId, timeframe)
      setPosts(posts)
    } catch (error) {
      console.error('Error loading posts:', error)
    } finally {
      setLoading(false)
    }
  }

  const topicName = topicId?.charAt(0).toUpperCase() + topicId?.slice(1)

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link 
          to="/app" 
          className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-4"
        >
          <ArrowLeft size={16} className="mr-1" />
          Back to Dashboard
        </Link>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {topicName} Discussions
        </h1>
        <p className="text-gray-600">
          Latest educational content and discussions about {topicName.toLowerCase()}
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex items-center space-x-2">
          <Filter size={16} className="text-gray-500" />
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="day">Past 24 hours</option>
            <option value="week">Past week</option>
            <option value="month">Past month</option>
            <option value="year">Past year</option>
          </select>
        </div>
        
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="hot">Hot</option>
          <option value="top">Top</option>
          <option value="new">New</option>
        </select>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        </div>
      ) : posts.length === 0 ? (
        <div className="card p-8 text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No posts found</h3>
          <p className="text-gray-600">
            Try adjusting your filters or check back later for new discussions.
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
  )
}

export default TopicView