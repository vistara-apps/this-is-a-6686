-- Reddit Digest Database Schema
-- This file contains the complete database schema for the Reddit Digest application
-- Run this in your Supabase SQL editor to set up the database

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'basic', 'premium')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Topics table
CREATE TABLE public.topics (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  subreddit TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reddit threads table
CREATE TABLE public.reddit_threads (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  reddit_id TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  content TEXT,
  upvotes INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  author TEXT,
  topic_id UUID REFERENCES public.topics(id) ON DELETE CASCADE,
  subreddit TEXT NOT NULL,
  posted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Summaries table (for AI-generated summaries)
CREATE TABLE public.summaries (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  thread_id UUID REFERENCES public.reddit_threads(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  key_insights TEXT[],
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  model_used TEXT DEFAULT 'google/gemini-2.0-flash-001'
);

-- User insights table
CREATE TABLE public.insights (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  source_thread_id UUID REFERENCES public.reddit_threads(id) ON DELETE SET NULL,
  tags TEXT[] DEFAULT '{}',
  is_favorite BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User subscribed topics table
CREATE TABLE public.user_topics (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  topic_id UUID REFERENCES public.topics(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, topic_id)
);

-- Notifications table
CREATE TABLE public.notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('new_discussion', 'weekly_digest', 'system')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  thread_id UUID REFERENCES public.reddit_threads(id) ON DELETE SET NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User preferences table
CREATE TABLE public.user_preferences (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE UNIQUE,
  email_notifications BOOLEAN DEFAULT true,
  weekly_digest BOOLEAN DEFAULT true,
  push_notifications BOOLEAN DEFAULT false,
  notification_frequency TEXT DEFAULT 'daily' CHECK (notification_frequency IN ('immediate', 'daily', 'weekly')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Subscription history table
CREATE TABLE public.subscription_history (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  plan TEXT NOT NULL CHECK (plan IN ('free', 'basic', 'premium')),
  status TEXT NOT NULL CHECK (status IN ('active', 'cancelled', 'expired')),
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  stripe_subscription_id TEXT,
  amount_paid DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_reddit_threads_topic_id ON public.reddit_threads(topic_id);
CREATE INDEX idx_reddit_threads_posted_at ON public.reddit_threads(posted_at DESC);
CREATE INDEX idx_reddit_threads_upvotes ON public.reddit_threads(upvotes DESC);
CREATE INDEX idx_insights_user_id ON public.insights(user_id);
CREATE INDEX idx_insights_created_at ON public.insights(created_at DESC);
CREATE INDEX idx_insights_tags ON public.insights USING GIN(tags);
CREATE INDEX idx_user_topics_user_id ON public.user_topics(user_id);
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_created_at ON public.notifications(created_at DESC);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_topics_updated_at BEFORE UPDATE ON public.topics FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reddit_threads_updated_at BEFORE UPDATE ON public.reddit_threads FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_insights_updated_at BEFORE UPDATE ON public.insights FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON public.user_preferences FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_history ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
CREATE POLICY "Users can view own profile" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);

-- Insights policies
CREATE POLICY "Users can view own insights" ON public.insights FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own insights" ON public.insights FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own insights" ON public.insights FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own insights" ON public.insights FOR DELETE USING (auth.uid() = user_id);

-- User topics policies
CREATE POLICY "Users can view own topics" ON public.user_topics FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own topics" ON public.user_topics FOR ALL USING (auth.uid() = user_id);

-- Notifications policies
CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

-- User preferences policies
CREATE POLICY "Users can view own preferences" ON public.user_preferences FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own preferences" ON public.user_preferences FOR ALL USING (auth.uid() = user_id);

-- Subscription history policies
CREATE POLICY "Users can view own subscription history" ON public.subscription_history FOR SELECT USING (auth.uid() = user_id);

-- Public read access for topics and reddit_threads (needed for browsing)
ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reddit_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.summaries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view topics" ON public.topics FOR SELECT USING (true);
CREATE POLICY "Anyone can view reddit threads" ON public.reddit_threads FOR SELECT USING (true);
CREATE POLICY "Anyone can view summaries" ON public.summaries FOR SELECT USING (true);

-- Insert default topics
INSERT INTO public.topics (name, description, subreddit) VALUES
('Programming', 'Software development tips and tutorials', 'programming'),
('Investing', 'Personal finance and investment strategies', 'investing'),
('Fitness', 'Health, nutrition and workout advice', 'fitness'),
('Cooking', 'Recipes and culinary techniques', 'cooking'),
('Productivity', 'Life hacks and efficiency tips', 'productivity'),
('Technology', 'Latest tech news and discussions', 'technology'),
('Science', 'Scientific discoveries and discussions', 'science'),
('Books', 'Book recommendations and discussions', 'books'),
('Career', 'Career advice and professional development', 'careeradvice'),
('Entrepreneurship', 'Startup and business discussions', 'entrepreneur');

-- Function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email)
  VALUES (NEW.id, NEW.email);
  
  INSERT INTO public.user_preferences (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to get trending topics with post counts
CREATE OR REPLACE FUNCTION get_trending_topics(limit_count INTEGER DEFAULT 10)
RETURNS TABLE (
  id UUID,
  name TEXT,
  description TEXT,
  subreddit TEXT,
  post_count BIGINT,
  latest_post_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.id,
    t.name,
    t.description,
    t.subreddit,
    COUNT(rt.id) as post_count,
    MAX(rt.posted_at) as latest_post_at
  FROM public.topics t
  LEFT JOIN public.reddit_threads rt ON t.id = rt.topic_id
  WHERE t.is_active = true
  GROUP BY t.id, t.name, t.description, t.subreddit
  ORDER BY post_count DESC, latest_post_at DESC NULLS LAST
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;
