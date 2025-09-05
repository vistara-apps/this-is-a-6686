import { supabase } from './supabase'

// Reddit API configuration
const REDDIT_BASE_URL = 'https://www.reddit.com'
const USER_AGENT = 'RedditDigest/1.0.0'

// Reddit API client class
class RedditAPI {
  constructor() {
    this.accessToken = null
    this.tokenExpiry = null
  }

  // Get OAuth access token for Reddit API
  async getAccessToken() {
    if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      return this.accessToken
    }

    const clientId = import.meta.env.VITE_REDDIT_CLIENT_ID
    const clientSecret = import.meta.env.VITE_REDDIT_CLIENT_SECRET

    if (!clientId || !clientSecret) {
      console.warn('Reddit API credentials not configured, using fallback data')
      return null
    }

    try {
      const auth = btoa(`${clientId}:${clientSecret}`)
      const response = await fetch('https://www.reddit.com/api/v1/access_token', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': USER_AGENT
        },
        body: 'grant_type=client_credentials'
      })

      if (!response.ok) {
        throw new Error(`Reddit API auth failed: ${response.status}`)
      }

      const data = await response.json()
      this.accessToken = data.access_token
      this.tokenExpiry = Date.now() + (data.expires_in * 1000) - 60000 // 1 minute buffer
      
      return this.accessToken
    } catch (error) {
      console.error('Failed to get Reddit access token:', error)
      return null
    }
  }

  // Make authenticated request to Reddit API
  async makeRequest(endpoint) {
    const token = await this.getAccessToken()
    
    if (!token) {
      return null
    }

    try {
      const response = await fetch(`https://oauth.reddit.com${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'User-Agent': USER_AGENT
        }
      })

      if (!response.ok) {
        throw new Error(`Reddit API request failed: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Reddit API request failed:', error)
      return null
    }
  }

  // Fetch posts from a subreddit
  async fetchSubredditPosts(subreddit, timeframe = 'week', limit = 25) {
    const endpoint = `/r/${subreddit}/top.json?t=${timeframe}&limit=${limit}`
    const data = await this.makeRequest(endpoint)
    
    if (!data || !data.data || !data.data.children) {
      return []
    }

    return data.data.children.map(child => {
      const post = child.data
      return {
        id: post.id,
        redditId: post.id,
        title: post.title,
        url: `https://reddit.com${post.permalink}`,
        content: post.selftext || '',
        upvotes: post.ups,
        commentCount: post.num_comments,
        author: post.author,
        subreddit: post.subreddit,
        postedAt: new Date(post.created_utc * 1000).toISOString(),
        thumbnail: post.thumbnail !== 'self' ? post.thumbnail : null
      }
    })
  }
}

// Create singleton instance
const redditAPI = new RedditAPI()

// Fallback data for when Reddit API is not available
const fallbackData = {
  'programming': [
    {
      id: 'prog1',
      title: 'Best practices for learning programming in 2024',
      url: 'https://reddit.com/r/programming/comments/example1',
      upvotes: 2845,
      commentCount: 234,
      author: 'techguru2024',
      content: `I've been programming for 15 years and wanted to share what I wish I knew when starting out...

Key points:
1. Focus on fundamentals before frameworks
2. Build projects, don't just follow tutorials
3. Learn to read documentation effectively
4. Practice debugging systematically
5. Join communities and contribute to open source

The biggest mistake new programmers make is jumping into complex frameworks without understanding the underlying concepts. Take time to really understand how variables, functions, and data structures work before moving to React or Django.

Another crucial point: build things! Tutorials are great for learning syntax, but real learning happens when you're stuck debugging your own code. Start with simple projects like a calculator or todo app, then gradually increase complexity.

Documentation reading is a skill that needs practice. Start with official docs rather than random blog posts. MDN for web development, official Python docs for Python, etc.

Finally, the programming community is generally very helpful. Don't be afraid to ask questions on Stack Overflow or join Discord servers. Contributing to open source projects is also a great way to learn from experienced developers.`
    },
    {
      id: 'prog2',
      title: 'How to prepare for technical interviews',
      url: 'https://reddit.com/r/programming/comments/example2',
      upvotes: 1567,
      commentCount: 156,
      author: 'careercoach',
      content: `Technical interview prep strategy that got me offers at FAANG companies...

1. Data structures and algorithms are still crucial
2. Practice system design for senior roles
3. Prepare behavioral questions with STAR method
4. Build a portfolio of real projects
5. Mock interviews are incredibly valuable

For algorithms, LeetCode is popular but don't just grind problems. Understand patterns: two pointers, sliding window, dynamic programming, etc. Quality over quantity.

System design: Start with basics like load balancers, databases, caching. Draw diagrams and think about trade-offs. Books like "Designing Data-Intensive Applications" are gold.

Behavioral questions matter more than you think. Use STAR (Situation, Task, Action, Result) format. Have stories ready about challenges, leadership, and failures.

Your portfolio should show real problem-solving, not just tutorial follow-alongs. Deploy your projects and be ready to discuss technical decisions.

Mock interviews with friends or platforms like Pramp are incredibly valuable. They help with nerves and timing.`
    }
  ],
  'investing': [
    {
      id: 'inv1',
      title: 'Dollar cost averaging vs lump sum investing',
      url: 'https://reddit.com/r/investing/comments/example1',
      upvotes: 3421,
      commentCount: 445,
      author: 'financialwisdom',
      content: `Analysis of when to use DCA vs lump sum based on market conditions and personal situation...

Mathematical advantage usually goes to lump sum because markets trend upward over time. However, DCA has psychological benefits that shouldn't be ignored.

Lump sum is better when:
- You have a large amount ready to invest
- You can handle volatility without panic selling
- You're investing for very long term (20+ years)

DCA is better when:
- You're just starting to invest
- Large market volatility makes you nervous
- You get regular income to invest monthly

The key is that time in market beats timing the market. Both strategies work if you stick with them consistently.

Don't try to time market peaks and valleys. Even professionals can't do this reliably. Focus on asset allocation appropriate for your age and risk tolerance.

Emergency fund first, then invest. Never invest money you might need in the next 5 years.`
    }
  ]
}

// Store posts in database and return them
async function storePostsInDatabase(posts, topicId) {
  try {
    const postsToInsert = posts.map(post => ({
      reddit_id: post.redditId,
      title: post.title,
      url: post.url,
      content: post.content,
      upvotes: post.upvotes,
      comment_count: post.commentCount,
      author: post.author,
      topic_id: topicId,
      subreddit: post.subreddit,
      posted_at: post.postedAt
    }))

    const { data, error } = await supabase
      .from('reddit_threads')
      .upsert(postsToInsert, { 
        onConflict: 'reddit_id',
        ignoreDuplicates: false 
      })
      .select()

    if (error) {
      console.error('Error storing posts:', error)
      return posts // Return original posts if storage fails
    }

    return data || posts
  } catch (error) {
    console.error('Error in storePostsInDatabase:', error)
    return posts
  }
}

// Get topic ID by subreddit name
async function getTopicBySubreddit(subreddit) {
  try {
    const { data, error } = await supabase
      .from('topics')
      .select('id')
      .eq('subreddit', subreddit)
      .single()

    if (error) {
      console.error('Error fetching topic:', error)
      return null
    }

    return data?.id
  } catch (error) {
    console.error('Error in getTopicBySubreddit:', error)
    return null
  }
}

// Main function to fetch Reddit posts
export const fetchRedditPosts = async (subreddit, timeframe = 'week') => {
  try {
    // First try to get fresh data from Reddit API
    const redditPosts = await redditAPI.fetchSubredditPosts(subreddit, timeframe)
    
    if (redditPosts && redditPosts.length > 0) {
      // Get topic ID and store posts in database
      const topicId = await getTopicBySubreddit(subreddit)
      if (topicId) {
        await storePostsInDatabase(redditPosts, topicId)
      }
      return redditPosts
    }

    // Fallback to database if Reddit API fails
    const { data: dbPosts, error } = await supabase
      .from('reddit_threads')
      .select(`
        *,
        topics!inner(subreddit)
      `)
      .eq('topics.subreddit', subreddit)
      .order('upvotes', { ascending: false })
      .limit(25)

    if (!error && dbPosts && dbPosts.length > 0) {
      return dbPosts.map(post => ({
        id: post.reddit_id,
        title: post.title,
        url: post.url,
        content: post.content,
        upvotes: post.upvotes,
        commentCount: post.comment_count,
        author: post.author,
        subreddit: post.subreddit,
        postedAt: post.posted_at
      }))
    }

    // Final fallback to static data
    return fallbackData[subreddit] || []
    
  } catch (error) {
    console.error('Error fetching Reddit posts:', error)
    return fallbackData[subreddit] || []
  }
}

// Fetch trending topics from database
export const fetchTrendingTopics = async () => {
  try {
    // Try to get topics with post counts from database
    const { data, error } = await supabase
      .rpc('get_trending_topics', { limit_count: 10 })

    if (!error && data && data.length > 0) {
      return data.map(topic => ({
        id: topic.id,
        name: topic.name,
        description: topic.description,
        subreddit: topic.subreddit,
        postCount: parseInt(topic.post_count) || 0
      }))
    }

    // Fallback to basic topics query
    const { data: basicTopics, error: basicError } = await supabase
      .from('topics')
      .select('*')
      .eq('is_active', true)
      .order('name')
      .limit(10)

    if (!basicError && basicTopics) {
      return basicTopics.map(topic => ({
        id: topic.id,
        name: topic.name,
        description: topic.description,
        subreddit: topic.subreddit,
        postCount: 0
      }))
    }

    // Final fallback to static data
    return [
      { id: 'programming', name: 'Programming', description: 'Software development tips and tutorials', postCount: 45 },
      { id: 'investing', name: 'Investing', description: 'Personal finance and investment strategies', postCount: 23 },
      { id: 'fitness', name: 'Fitness', description: 'Health, nutrition and workout advice', postCount: 34 },
      { id: 'cooking', name: 'Cooking', description: 'Recipes and culinary techniques', postCount: 28 },
      { id: 'productivity', name: 'Productivity', description: 'Life hacks and efficiency tips', postCount: 19 }
    ]
  } catch (error) {
    console.error('Error fetching trending topics:', error)
    return [
      { id: 'programming', name: 'Programming', description: 'Software development tips and tutorials', postCount: 45 },
      { id: 'investing', name: 'Investing', description: 'Personal finance and investment strategies', postCount: 23 },
      { id: 'fitness', name: 'Fitness', description: 'Health, nutrition and workout advice', postCount: 34 },
      { id: 'cooking', name: 'Cooking', description: 'Recipes and culinary techniques', postCount: 28 },
      { id: 'productivity', name: 'Productivity', description: 'Life hacks and efficiency tips', postCount: 19 }
    ]
  }
}

// Function to fetch posts by topic ID (for database-stored topics)
export const fetchPostsByTopicId = async (topicId, limit = 25) => {
  try {
    const { data, error } = await supabase
      .from('reddit_threads')
      .select('*')
      .eq('topic_id', topicId)
      .order('upvotes', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching posts by topic ID:', error)
      return []
    }

    return data.map(post => ({
      id: post.reddit_id,
      title: post.title,
      url: post.url,
      content: post.content,
      upvotes: post.upvotes,
      commentCount: post.comment_count,
      author: post.author,
      subreddit: post.subreddit,
      postedAt: post.posted_at
    }))
  } catch (error) {
    console.error('Error in fetchPostsByTopicId:', error)
    return []
  }
}

// Function to search posts across all topics
export const searchPosts = async (query, limit = 25) => {
  try {
    const { data, error } = await supabase
      .from('reddit_threads')
      .select(`
        *,
        topics(name, description)
      `)
      .or(`title.ilike.%${query}%, content.ilike.%${query}%`)
      .order('upvotes', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error searching posts:', error)
      return []
    }

    return data.map(post => ({
      id: post.reddit_id,
      title: post.title,
      url: post.url,
      content: post.content,
      upvotes: post.upvotes,
      commentCount: post.comment_count,
      author: post.author,
      subreddit: post.subreddit,
      postedAt: post.posted_at,
      topic: post.topics
    }))
  } catch (error) {
    console.error('Error in searchPosts:', error)
    return []
  }
}
