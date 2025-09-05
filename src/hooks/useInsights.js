import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

export function useInsights() {
  const { user } = useAuth()
  const [insights, setInsights] = useState([])
  const [loading, setLoading] = useState(false)

  const fetchInsights = async () => {
    if (!user) return
    
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('insights')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setInsights(data || [])
    } catch (error) {
      console.error('Error fetching insights:', error)
    } finally {
      setLoading(false)
    }
  }

  const saveInsight = async (insight) => {
    if (!user) throw new Error('User not authenticated')
    
    try {
      const { data, error } = await supabase
        .from('insights')
        .insert([
          {
            user_id: user.id,
            content: insight.content,
            source_thread_id: insight.sourceThreadId,
            tags: insight.tags || [],
            created_at: new Date().toISOString()
          }
        ])
        .select()

      if (error) throw error
      
      setInsights(prev => [data[0], ...prev])
      return data[0]
    } catch (error) {
      console.error('Error saving insight:', error)
      throw error
    }
  }

  const deleteInsight = async (insightId) => {
    try {
      const { error } = await supabase
        .from('insights')
        .delete()
        .eq('id', insightId)
        .eq('user_id', user.id)

      if (error) throw error
      
      setInsights(prev => prev.filter(insight => insight.id !== insightId))
    } catch (error) {
      console.error('Error deleting insight:', error)
      throw error
    }
  }

  useEffect(() => {
    fetchInsights()
  }, [user])

  return {
    insights,
    loading,
    saveInsight,
    deleteInsight,
    refetch: fetchInsights
  }
}