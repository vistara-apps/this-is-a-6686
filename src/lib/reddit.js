// Mock Reddit API service for demo purposes
// In production, you would implement actual Reddit API calls

const mockRedditData = {
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

export const fetchRedditPosts = async (subreddit, timeframe = 'week') => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  return mockRedditData[subreddit] || []
}

export const fetchTrendingTopics = async () => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800))
  
  return [
    { id: 'programming', name: 'Programming', description: 'Software development tips and tutorials', postCount: 45 },
    { id: 'investing', name: 'Investing', description: 'Personal finance and investment strategies', postCount: 23 },
    { id: 'fitness', name: 'Fitness', description: 'Health, nutrition and workout advice', postCount: 34 },
    { id: 'cooking', name: 'Cooking', description: 'Recipes and culinary techniques', postCount: 28 },
    { id: 'productivity', name: 'Productivity', description: 'Life hacks and efficiency tips', postCount: 19 }
  ]
}