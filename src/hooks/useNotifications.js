import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import {
  getUserNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  getUserPreferences,
  updateUserPreferences
} from '../lib/notifications'

export function useNotifications() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [preferences, setPreferences] = useState(null)

  // Fetch notifications
  const fetchNotifications = async () => {
    if (!user) return

    setLoading(true)
    try {
      const [notificationsData, unreadCountData] = await Promise.all([
        getUserNotifications(user.id),
        getUnreadNotificationCount(user.id)
      ])

      setNotifications(notificationsData)
      setUnreadCount(unreadCountData)
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  // Fetch user preferences
  const fetchPreferences = async () => {
    if (!user) return

    try {
      const prefsData = await getUserPreferences(user.id)
      setPreferences(prefsData)
    } catch (error) {
      console.error('Error fetching preferences:', error)
    }
  }

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    if (!user) return

    try {
      const success = await markNotificationAsRead(notificationId, user.id)
      if (success) {
        setNotifications(prev =>
          prev.map(notification =>
            notification.id === notificationId
              ? { ...notification, is_read: true }
              : notification
          )
        )
        setUnreadCount(prev => Math.max(0, prev - 1))
      }
      return success
    } catch (error) {
      console.error('Error marking notification as read:', error)
      return false
    }
  }

  // Mark all notifications as read
  const markAllAsRead = async () => {
    if (!user) return

    try {
      const success = await markAllNotificationsAsRead(user.id)
      if (success) {
        setNotifications(prev =>
          prev.map(notification => ({ ...notification, is_read: true }))
        )
        setUnreadCount(0)
      }
      return success
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
      return false
    }
  }

  // Delete notification
  const deleteNotif = async (notificationId) => {
    if (!user) return

    try {
      const success = await deleteNotification(notificationId, user.id)
      if (success) {
        const notification = notifications.find(n => n.id === notificationId)
        setNotifications(prev => prev.filter(n => n.id !== notificationId))
        
        // Update unread count if the deleted notification was unread
        if (notification && !notification.is_read) {
          setUnreadCount(prev => Math.max(0, prev - 1))
        }
      }
      return success
    } catch (error) {
      console.error('Error deleting notification:', error)
      return false
    }
  }

  // Update user preferences
  const updatePreferences = async (newPreferences) => {
    if (!user) return

    try {
      const updatedPrefs = await updateUserPreferences(user.id, newPreferences)
      setPreferences(updatedPrefs)
      return updatedPrefs
    } catch (error) {
      console.error('Error updating preferences:', error)
      throw error
    }
  }

  // Subscribe to real-time notifications
  useEffect(() => {
    if (!user) return

    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          setNotifications(prev => [payload.new, ...prev])
          setUnreadCount(prev => prev + 1)
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          setNotifications(prev =>
            prev.map(notification =>
              notification.id === payload.new.id ? payload.new : notification
            )
          )
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          setNotifications(prev =>
            prev.filter(notification => notification.id !== payload.old.id)
          )
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user])

  // Initial data fetch
  useEffect(() => {
    if (user) {
      fetchNotifications()
      fetchPreferences()
    }
  }, [user])

  return {
    notifications,
    unreadCount,
    loading,
    preferences,
    markAsRead,
    markAllAsRead,
    deleteNotification: deleteNotif,
    updatePreferences,
    refetch: fetchNotifications
  }
}
