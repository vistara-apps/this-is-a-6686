import React, { useState } from 'react'
import { ExternalLink, Bookmark, BookmarkCheck, Lightbulb, TrendingUp } from 'lucide-react'
import { generateSummary, extractInsights } from '../lib/openai'
import { useInsights } from '../hooks/useInsights'
import { useSubscription } from '../contexts/SubscriptionContext'
import toast from 'react-hot-toast'

function SummaryCard({ post, variant = 'default' }) {
  const [summary, setSummary] = useState('')
  const [insights, setInsights] = useState('')
  const [loading, setLoading] = useState(false)
  const [insightLoading, setInsightLoading] = useState(false)
  const [summaryGenerated, setSummaryGenerated] = useState(false)
  const { saveInsight } = useInsights()
  const { hasAccess } = useSubscription()

  const handleGenerateSummary = async () => {
    if (!hasAccess('basic_summaries')) {
      toast.error('Please upgrade to access summaries')
      return
    }

    setLoading(true)
    try {
      const generatedSummary = await generateSummary(post.content, post.title)
      setSummary(generatedSummary)
      setSummaryGenerated(true)
      toast.success('Summary generated!')
    } catch (error) {
      toast.error('Failed to generate summary')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleExtractInsights = async () => {
    if (!hasAccess('advanced_insights')) {
      toast.error('Please upgrade to premium for insight extraction')
      return
    }

    setInsightLoading(true)
    try {
      const contentToAnalyze = summary || post.content
      const extractedInsights = await extractInsights(contentToAnalyze)
      setInsights(extractedInsights)
      toast.success('Insights extracted!')
    } catch (error) {
      toast.error('Failed to extract insights')
      console.error(error)
    } finally {
      setInsightLoading(false)
    }
  }

  const handleSaveInsight = async (insightText) => {
    if (!hasAccess('save_insights')) {
      toast.error('Please upgrade to save insights')
      return
    }

    try {
      await saveInsight({
        content: insightText,
        sourceThreadId: post.id,
        tags: ['reddit', 'saved']
      })
      toast.success('Insight saved!')
    } catch (error) {
      toast.error('Failed to save insight')
      console.error(error)
    }
  }

  const cardClass = variant === 'compact' 
    ? 'card p-4 mb-4' 
    : 'card p-6 mb-6'

  return (
    <div className={cardClass}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 leading-tight">
            {post.title}
          </h3>
          <div className="flex items-center text-sm text-gray-500 space-x-4">
            <span className="flex items-center">
              <TrendingUp size={14} className="mr-1" />
              {post.upvotes} upvotes
            </span>
            <span>{post.commentCount} comments</span>
            <span>by u/{post.author}</span>
          </div>
        </div>
        <a
          href={post.url}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
        >
          <ExternalLink size={18} />
        </a>
      </div>

      {/* Content Preview */}
      {variant !== 'compact' && (
        <div className="mb-4">
          <p className="text-gray-700 text-sm leading-relaxed line-clamp-3">
            {post.content.slice(0, 200)}...
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={handleGenerateSummary}
          disabled={loading || summaryGenerated}
          className={`btn-primary text-sm ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {loading ? 'Generating...' : summaryGenerated ? 'Summary Generated' : 'Generate Summary'}
        </button>
        
        {summaryGenerated && (
          <button
            onClick={handleExtractInsights}
            disabled={insightLoading}
            className={`btn-secondary text-sm flex items-center ${insightLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <Lightbulb size={14} className="mr-1" />
            {insightLoading ? 'Extracting...' : 'Extract Insights'}
          </button>
        )}
      </div>

      {/* Summary */}
      {summary && (
        <div className="summary-block mb-4">
          <h4 className="font-medium text-gray-900 mb-2">Summary</h4>
          <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
            {summary}
          </p>
          <button
            onClick={() => handleSaveInsight(summary)}
            className="mt-2 text-sm text-primary-600 hover:text-primary-700 flex items-center"
          >
            <Bookmark size={14} className="mr-1" />
            Save Summary
          </button>
        </div>
      )}

      {/* Insights */}
      {insights && (
        <div className="summary-block">
          <h4 className="font-medium text-gray-900 mb-2">Key Insights</h4>
          <div className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
            {insights}
          </div>
          <button
            onClick={() => handleSaveInsight(insights)}
            className="mt-2 text-sm text-primary-600 hover:text-primary-700 flex items-center"
          >
            <Bookmark size={14} className="mr-1" />
            Save Insights
          </button>
        </div>
      )}
    </div>
  )
}

export default SummaryCard