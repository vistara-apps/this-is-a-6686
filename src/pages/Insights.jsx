import React, { useState } from 'react'
import { Search, Filter, Plus } from 'lucide-react'
import InsightItem from '../components/InsightItem'
import { useInsights } from '../hooks/useInsights'

function Insights() {
  const { insights, loading, deleteInsight } = useInsights()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTag, setSelectedTag] = useState('')

  // Get all unique tags
  const allTags = [...new Set(
    insights.flatMap(insight => insight.tags || [])
  )]

  // Filter insights
  const filteredInsights = insights.filter(insight => {
    const matchesSearch = insight.content.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesTag = !selectedTag || (insight.tags && insight.tags.includes(selectedTag))
    return matchesSearch && matchesTag
  })

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Insights</h1>
        <p className="text-gray-600">
          Your saved insights and key takeaways from Reddit discussions
        </p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search insights..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <Filter size={16} className="text-gray-500" />
          <select
            value={selectedTag}
            onChange={(e) => setSelectedTag(e.target.value)}
            className="border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All tags</option>
            {allTags.map(tag => (
              <option key={tag} value={tag}>{tag}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="card p-4">
          <div className="text-2xl font-bold text-primary-600">{insights.length}</div>
          <div className="text-sm text-gray-600">Total Insights</div>
        </div>
        <div className="card p-4">
          <div className="text-2xl font-bold text-accent-600">{allTags.length}</div>
          <div className="text-sm text-gray-600">Unique Tags</div>
        </div>
        <div className="card p-4">
          <div className="text-2xl font-bold text-primary-600">{filteredInsights.length}</div>
          <div className="text-sm text-gray-600">Filtered Results</div>
        </div>
      </div>

      {/* Insights List */}
      {filteredInsights.length === 0 ? (
        <div className="card p-8 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Plus size={24} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {insights.length === 0 ? 'No insights yet' : 'No matching insights'}
          </h3>
          <p className="text-gray-600 mb-4">
            {insights.length === 0 
              ? 'Start saving insights from Reddit discussions to build your knowledge base.'
              : 'Try adjusting your search or filter criteria.'
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredInsights.map((insight) => (
            <InsightItem
              key={insight.id}
              insight={insight}
              variant="editable"
              onDelete={deleteInsight}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default Insights