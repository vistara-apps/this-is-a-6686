# Reddit Digest API Documentation

This document outlines the API endpoints and integrations used in the Reddit Digest application.

## Table of Contents

1. [Authentication](#authentication)
2. [Reddit API Integration](#reddit-api-integration)
3. [OpenAI API Integration](#openai-api-integration)
4. [Supabase Database API](#supabase-database-api)
5. [Stripe Payment API](#stripe-payment-api)
6. [Notification System](#notification-system)
7. [Error Handling](#error-handling)

## Authentication

Reddit Digest uses Supabase Auth for user authentication and authorization.

### Endpoints

- **Sign Up**: `POST /auth/v1/signup`
- **Sign In**: `POST /auth/v1/token?grant_type=password`
- **Sign Out**: `POST /auth/v1/logout`
- **Refresh Token**: `POST /auth/v1/token?grant_type=refresh_token`

### Headers Required

```
Authorization: Bearer <jwt_token>
apikey: <supabase_anon_key>
```

## Reddit API Integration

### Base URL
`https://oauth.reddit.com`

### Authentication
Uses OAuth 2.0 client credentials flow.

### Endpoints Used

#### Get Subreddit Posts
```
GET /r/{subreddit}/top.json?t={timeframe}&limit={limit}
```

**Parameters:**
- `subreddit`: The subreddit name (e.g., "programming")
- `timeframe`: Time period ("hour", "day", "week", "month", "year", "all")
- `limit`: Number of posts to retrieve (1-100)

**Response:**
```json
{
  "data": {
    "children": [
      {
        "data": {
          "id": "post_id",
          "title": "Post title",
          "selftext": "Post content",
          "ups": 1234,
          "num_comments": 56,
          "author": "username",
          "permalink": "/r/subreddit/comments/...",
          "created_utc": 1234567890
        }
      }
    ]
  }
}
```

### Rate Limits
- 60 requests per minute per OAuth client
- 600 requests per 10 minutes per OAuth client

## OpenAI API Integration

### Base URL
`https://openrouter.ai/api/v1` (using OpenRouter as proxy)

### Model Used
`google/gemini-2.0-flash-001`

### Endpoints Used

#### Generate Summary
```javascript
POST /chat/completions
```

**Request Body:**
```json
{
  "model": "google/gemini-2.0-flash-001",
  "messages": [
    {
      "role": "system",
      "content": "You are an expert content summarizer..."
    },
    {
      "role": "user",
      "content": "Please summarize this Reddit discussion..."
    }
  ],
  "max_tokens": 500,
  "temperature": 0.3
}
```

#### Extract Insights
```javascript
POST /chat/completions
```

**Request Body:**
```json
{
  "model": "google/gemini-2.0-flash-001",
  "messages": [
    {
      "role": "system",
      "content": "Extract 3-5 key actionable insights..."
    },
    {
      "role": "user",
      "content": "Content to analyze..."
    }
  ],
  "max_tokens": 300,
  "temperature": 0.2
}
```

## Supabase Database API

### Base URL
`https://<project-id>.supabase.co/rest/v1`

### Tables and Operations

#### Users Table
```sql
-- Get user profile
GET /users?id=eq.<user_id>

-- Update subscription tier
PATCH /users?id=eq.<user_id>
Content-Type: application/json
{
  "subscription_tier": "premium"
}
```

#### Topics Table
```sql
-- Get all active topics
GET /topics?is_active=eq.true&order=name

-- Get trending topics with post counts
POST /rpc/get_trending_topics
Content-Type: application/json
{
  "limit_count": 10
}
```

#### Reddit Threads Table
```sql
-- Get posts by topic
GET /reddit_threads?topic_id=eq.<topic_id>&order=upvotes.desc&limit=25

-- Search posts
GET /reddit_threads?or=(title.ilike.*query*,content.ilike.*query*)&order=upvotes.desc
```

#### Insights Table
```sql
-- Get user insights
GET /insights?user_id=eq.<user_id>&order=created_at.desc

-- Create new insight
POST /insights
Content-Type: application/json
{
  "user_id": "uuid",
  "content": "Insight content",
  "source_thread_id": "uuid",
  "tags": ["tag1", "tag2"]
}

-- Update insight
PATCH /insights?id=eq.<insight_id>&user_id=eq.<user_id>
Content-Type: application/json
{
  "content": "Updated content",
  "tags": ["new_tag"]
}

-- Delete insight
DELETE /insights?id=eq.<insight_id>&user_id=eq.<user_id>
```

#### Notifications Table
```sql
-- Get user notifications
GET /notifications?user_id=eq.<user_id>&order=created_at.desc&limit=50

-- Mark notification as read
PATCH /notifications?id=eq.<notification_id>&user_id=eq.<user_id>
Content-Type: application/json
{
  "is_read": true
}

-- Delete notification
DELETE /notifications?id=eq.<notification_id>&user_id=eq.<user_id>
```

### Row Level Security (RLS)

All tables have RLS enabled with policies ensuring users can only access their own data:

```sql
-- Example policy for insights table
CREATE POLICY "Users can view own insights" ON insights 
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own insights" ON insights 
FOR INSERT WITH CHECK (auth.uid() = user_id);
```

## Stripe Payment API

### Base URL
`https://api.stripe.com/v1`

### Endpoints Used (via Supabase Edge Functions)

#### Create Checkout Session
```javascript
POST /functions/v1/create-checkout-session
Authorization: Bearer <supabase_anon_key>
Content-Type: application/json

{
  "priceId": "price_1234567890",
  "userId": "user_uuid",
  "userEmail": "user@example.com",
  "planId": "basic"
}
```

#### Create Customer Portal Session
```javascript
POST /functions/v1/create-portal-session
Authorization: Bearer <supabase_anon_key>
Content-Type: application/json

{
  "userId": "user_uuid"
}
```

#### Cancel Subscription
```javascript
POST /functions/v1/cancel-subscription
Authorization: Bearer <supabase_anon_key>
Content-Type: application/json

{
  "userId": "user_uuid"
}
```

### Webhooks

Stripe webhooks are handled by Supabase Edge Functions:

```javascript
POST /functions/v1/stripe-webhook
```

**Events Handled:**
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_succeeded`
- `invoice.payment_failed`

## Notification System

### Real-time Notifications

Uses Supabase Realtime for live notifications:

```javascript
const channel = supabase
  .channel('notifications')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'notifications',
    filter: `user_id=eq.${userId}`
  }, (payload) => {
    // Handle new notification
  })
  .subscribe()
```

### Background Jobs

Notifications are generated by background jobs:

#### Check for New Discussions
```javascript
// Runs every hour
checkForNewDiscussions()
```

#### Generate Weekly Digests
```javascript
// Runs every Sunday
generateWeeklyDigest(userId)
```

## Error Handling

### Standard Error Response Format

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": "Additional error details"
  }
}
```

### Common Error Codes

#### Authentication Errors
- `AUTH_REQUIRED`: User must be authenticated
- `AUTH_INVALID`: Invalid or expired token
- `AUTH_FORBIDDEN`: User lacks required permissions

#### Validation Errors
- `VALIDATION_ERROR`: Request data validation failed
- `MISSING_REQUIRED_FIELD`: Required field is missing
- `INVALID_FORMAT`: Field format is invalid

#### Rate Limiting
- `RATE_LIMIT_EXCEEDED`: Too many requests
- `QUOTA_EXCEEDED`: Usage quota exceeded

#### External API Errors
- `REDDIT_API_ERROR`: Reddit API request failed
- `OPENAI_API_ERROR`: OpenAI API request failed
- `STRIPE_API_ERROR`: Stripe API request failed

### Error Handling Best Practices

1. **Graceful Degradation**: Fall back to cached data when external APIs fail
2. **User-Friendly Messages**: Show helpful error messages to users
3. **Retry Logic**: Implement exponential backoff for transient failures
4. **Logging**: Log all errors for debugging and monitoring

### Example Error Handling

```javascript
try {
  const posts = await fetchRedditPosts(subreddit)
  return posts
} catch (error) {
  console.error('Reddit API error:', error)
  
  // Fall back to cached data
  const cachedPosts = await getCachedPosts(subreddit)
  if (cachedPosts.length > 0) {
    return cachedPosts
  }
  
  // Final fallback to static data
  return getFallbackData(subreddit)
}
```

## Environment Variables

### Required Environment Variables

```bash
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# OpenAI/OpenRouter
VITE_OPENAI_API_KEY=your-openrouter-api-key

# Reddit API (optional)
VITE_REDDIT_CLIENT_ID=your-reddit-client-id
VITE_REDDIT_CLIENT_SECRET=your-reddit-client-secret

# Stripe
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
VITE_STRIPE_BASIC_PRICE_ID=price_...
VITE_STRIPE_PREMIUM_PRICE_ID=price_...
```

### Server-side Environment Variables (for Edge Functions)

```bash
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

## Testing

### API Testing

Use tools like Postman or curl to test API endpoints:

```bash
# Test getting trending topics
curl -X GET "https://your-project.supabase.co/rest/v1/rpc/get_trending_topics" \
  -H "apikey: your-anon-key" \
  -H "Authorization: Bearer your-jwt-token" \
  -H "Content-Type: application/json" \
  -d '{"limit_count": 5}'
```

### Integration Testing

Test the complete flow from Reddit API to database storage:

```javascript
// Test Reddit API integration
const posts = await fetchRedditPosts('programming')
expect(posts).toHaveLength(25)
expect(posts[0]).toHaveProperty('title')
expect(posts[0]).toHaveProperty('upvotes')
```

## Rate Limits and Quotas

### Reddit API
- 60 requests per minute
- 600 requests per 10 minutes

### OpenAI API (via OpenRouter)
- Varies by model and plan
- Monitor usage in OpenRouter dashboard

### Supabase
- Database: 500 MB included, then $0.125/GB
- Auth: 50,000 MAUs included
- Realtime: 200 concurrent connections included

### Stripe
- No rate limits for standard operations
- Webhook delivery retries for up to 3 days

## Security Considerations

1. **API Keys**: Never expose secret keys in client-side code
2. **Row Level Security**: Ensure RLS policies are properly configured
3. **Input Validation**: Validate all user inputs on both client and server
4. **HTTPS**: Always use HTTPS for API communications
5. **CORS**: Configure CORS properly for your domain
6. **Webhook Verification**: Verify Stripe webhook signatures

## Monitoring and Logging

### Recommended Monitoring

1. **API Response Times**: Monitor external API performance
2. **Error Rates**: Track error rates for each API endpoint
3. **Usage Metrics**: Monitor user engagement and feature usage
4. **Subscription Metrics**: Track subscription conversions and churn

### Logging Best Practices

1. **Structured Logging**: Use JSON format for logs
2. **Log Levels**: Use appropriate log levels (error, warn, info, debug)
3. **Sensitive Data**: Never log sensitive information like API keys
4. **Request IDs**: Include request IDs for tracing

This documentation should be updated as the API evolves and new endpoints are added.
