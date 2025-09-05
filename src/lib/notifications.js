import { supabase } from './supabase'

// Notification types
export const NOTIFICATION_TYPES = {
  NEW_DISCUSSION: 'new_discussion',
  WEEKLY_DIGEST: 'weekly_digest',
  SYSTEM: 'system'
}

// Create a new notification
export const createNotification = async (userId, type, title, message, threadId = null) => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .insert([{
        user_id: userId,
        type,
        title,
        message,
        thread_id: threadId
      }])
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error creating notification:', error)
    throw error
  }
}

// Get user notifications
export const getUserNotifications = async (userId, limit = 50) => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select(`
        *,
        reddit_threads(title, url, subreddit)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching notifications:', error)
    return []
  }
}

// Mark notification as read
export const markNotificationAsRead = async (notificationId, userId) => {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId)
      .eq('user_id', userId)

    if (error) throw error
    return true
  } catch (error) {
    console.error('Error marking notification as read:', error)
    return false
  }
}

// Mark all notifications as read
export const markAllNotificationsAsRead = async (userId) => {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false)

    if (error) throw error
    return true
  } catch (error) {
    console.error('Error marking all notifications as read:', error)
    return false
  }
}

// Get unread notification count
export const getUnreadNotificationCount = async (userId) => {
  try {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_read', false)

    if (error) throw error
    return count || 0
  } catch (error) {
    console.error('Error getting unread notification count:', error)
    return 0
  }
}

// Delete notification
export const deleteNotification = async (notificationId, userId) => {
  try {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId)
      .eq('user_id', userId)

    if (error) throw error
    return true
  } catch (error) {
    console.error('Error deleting notification:', error)
    return false
  }
}

// Check for new discussions and notify subscribed users
export const checkForNewDiscussions = async () => {
  try {
    // Get all users with their subscribed topics
    const { data: userTopics, error: userTopicsError } = await supabase
      .from('user_topics')
      .select(`
        user_id,
        topics(id, name, subreddit),
        users!inner(email)
      `)

    if (userTopicsError) throw userTopicsError

    // Get recent high-upvote threads (last 24 hours)
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)

    const { data: recentThreads, error: threadsError } = await supabase
      .from('reddit_threads')
      .select('*')
      .gte('posted_at', yesterday.toISOString())
      .gte('upvotes', 100) // Only notify for popular posts
      .order('upvotes', { ascending: false })

    if (threadsError) throw threadsError

    // Create notifications for users subscribed to topics with new popular discussions
    const notifications = []
    
    for (const userTopic of userTopics) {
      const relevantThreads = recentThreads.filter(
        thread => thread.topic_id === userTopic.topics.id
      )

      for (const thread of relevantThreads) {
        // Check if we already notified this user about this thread
        const { data: existingNotification } = await supabase
          .from('notifications')
          .select('id')
          .eq('user_id', userTopic.user_id)
          .eq('thread_id', thread.id)
          .eq('type', NOTIFICATION_TYPES.NEW_DISCUSSION)
          .single()

        if (!existingNotification) {
          notifications.push({
            user_id: userTopic.user_id,
            type: NOTIFICATION_TYPES.NEW_DISCUSSION,
            title: `New trending discussion in ${userTopic.topics.name}`,
            message: `"${thread.title}" has ${thread.upvotes} upvotes and ${thread.comment_count} comments`,
            thread_id: thread.id
          })
        }
      }
    }

    if (notifications.length > 0) {
      const { error: insertError } = await supabase
        .from('notifications')
        .insert(notifications)

      if (insertError) throw insertError
    }

    return notifications.length
  } catch (error) {
    console.error('Error checking for new discussions:', error)
    return 0
  }
}

// Get user preferences for notifications
export const getUserPreferences = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error) {
      // If no preferences exist, create default ones
      if (error.code === 'PGRST116') {
        const { data: newPrefs, error: createError } = await supabase
          .from('user_preferences')
          .insert([{ user_id: userId }])
          .select()
          .single()

        if (createError) throw createError
        return newPrefs
      }
      throw error
    }

    return data
  } catch (error) {
    console.error('Error getting user preferences:', error)
    return null
  }
}

// Update user notification preferences
export const updateUserPreferences = async (userId, preferences) => {
  try {
    const { data, error } = await supabase
      .from('user_preferences')
      .update(preferences)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error updating user preferences:', error)
    throw error
  }
}

// Send email notification (placeholder - would integrate with email service)
export const sendEmailNotification = async (email, subject, content) => {
  // This would integrate with an email service like SendGrid, Mailgun, etc.
  console.log('Email notification would be sent:', { email, subject, content })
  
  // For now, just log the notification
  // In production, you would implement actual email sending here
  return true
}

// Generate weekly digest for a user
export const generateWeeklyDigest = async (userId) => {
  try {
    // Get user's subscribed topics
    const { data: userTopics, error: topicsError } = await supabase
      .from('user_topics')
      .select(`
        topics(id, name, subreddit)
      `)
      .eq('user_id', userId)

    if (topicsError) throw topicsError

    // Get top posts from the last week for user's topics
    const lastWeek = new Date()
    lastWeek.setDate(lastWeek.getDate() - 7)

    const topicIds = userTopics.map(ut => ut.topics.id)
    
    const { data: weeklyPosts, error: postsError } = await supabase
      .from('reddit_threads')
      .select(`
        *,
        topics(name)
      `)
      .in('topic_id', topicIds)
      .gte('posted_at', lastWeek.toISOString())
      .gte('upvotes', 50)
      .order('upvotes', { ascending: false })
      .limit(20)

    if (postsError) throw postsError

    // Group posts by topic
    const postsByTopic = {}
    weeklyPosts.forEach(post => {
      const topicName = post.topics.name
      if (!postsByTopic[topicName]) {
        postsByTopic[topicName] = []
      }
      postsByTopic[topicName].push(post)
    })

    // Generate digest content
    let digestContent = 'Here are the top discussions from your subscribed topics this week:\n\n'
    
    Object.entries(postsByTopic).forEach(([topicName, posts]) => {
      digestContent += `## ${topicName}\n\n`
      posts.slice(0, 5).forEach(post => {
        digestContent += `- **${post.title}** (${post.upvotes} upvotes)\n`
        digestContent += `  ${post.url}\n\n`
      })
    })

    // Create notification
    await createNotification(
      userId,
      NOTIFICATION_TYPES.WEEKLY_DIGEST,
      'Your Weekly Reddit Digest',
      digestContent
    )

    return digestContent
  } catch (error) {
    console.error('Error generating weekly digest:', error)
    return null
  }
}
