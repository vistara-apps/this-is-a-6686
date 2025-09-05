# Reddit Digest

> Your curated Reddit insights, distilled.

Reddit Digest is a web application that aggregates, summarizes, and allows users to extract actionable insights from Reddit discussions on educational topics. Built with React, Supabase, and AI-powered content analysis.

## 🚀 Features

### Core Features
- **Curated Topic Summaries**: AI-generated concise summaries of popular educational topics from Reddit
- **Actionable Insight Extraction**: Save and organize specific tips, advice, and key takeaways
- **New Discussion Alerts**: Get notified about trending, high-quality discussions in your areas of interest
- **Real-time Notifications**: Stay updated with live notifications for new content
- **Advanced Search**: Find discussions across all topics with powerful search functionality

### Subscription Tiers
- **Free**: Browse topics, view discussions, save up to 5 insights per month
- **Basic ($5/mo)**: AI summaries, unlimited insights, email notifications, up to 10 topics
- **Premium ($9/mo)**: Advanced features, weekly digests, unlimited topics, data export

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern React with hooks and functional components
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Beautiful icon library
- **React Router** - Client-side routing
- **React Hot Toast** - Elegant notifications
- **Date-fns** - Date utility library

### Backend & Database
- **Supabase** - Backend-as-a-Service with PostgreSQL
- **Row Level Security (RLS)** - Secure data access policies
- **Real-time subscriptions** - Live updates via WebSockets
- **Edge Functions** - Serverless functions for webhooks

### External APIs
- **Reddit API** - Fetch posts and discussions from subreddits
- **OpenAI API** (via OpenRouter) - AI-powered content summarization
- **Stripe** - Payment processing and subscription management

### Web3 Integration
- **RainbowKit** - Wallet connection interface
- **Wagmi** - React hooks for Ethereum
- **Viem** - TypeScript interface for Ethereum

## 📋 Prerequisites

Before running this project, make sure you have:

- Node.js 18+ installed
- A Supabase project set up
- Reddit API credentials (optional, falls back to mock data)
- OpenRouter API key for AI features
- Stripe account for payments (optional for development)

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/vistara-apps/reddit-digest.git
cd reddit-digest
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Copy the example environment file and fill in your credentials:

```bash
cp .env.example .env
```

Required environment variables:

```bash
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# OpenAI/OpenRouter
VITE_OPENAI_API_KEY=your-openrouter-api-key

# Reddit API (optional)
VITE_REDDIT_CLIENT_ID=your-reddit-client-id
VITE_REDDIT_CLIENT_SECRET=your-reddit-client-secret

# Stripe (optional)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
VITE_STRIPE_BASIC_PRICE_ID=price_...
VITE_STRIPE_PREMIUM_PRICE_ID=price_...
```

### 4. Database Setup

Run the database schema in your Supabase SQL editor:

```bash
# Copy the contents of database/schema.sql and run in Supabase
```

### 5. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## 📁 Project Structure

```
reddit-digest/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── Layout.jsx       # Main app layout
│   │   ├── SummaryCard.jsx  # Post summary display
│   │   ├── InsightItem.jsx  # Saved insight component
│   │   ├── TopicSelector.jsx # Topic selection interface
│   │   └── NotificationCenter.jsx # Notification dropdown
│   ├── pages/               # Page components
│   │   ├── Landing.jsx      # Landing page
│   │   ├── Dashboard.jsx    # Main dashboard
│   │   ├── TopicView.jsx    # Individual topic view
│   │   ├── Insights.jsx     # Saved insights page
│   │   └── Profile.jsx      # User profile and settings
│   ├── contexts/            # React contexts
│   │   ├── AuthContext.jsx  # Authentication state
│   │   └── SubscriptionContext.jsx # Subscription state
│   ├── hooks/               # Custom React hooks
│   │   ├── useInsights.js   # Insights management
│   │   ├── useNotifications.js # Notifications
│   │   └── usePaymentContext.js # Payment handling
│   ├── lib/                 # Utility libraries
│   │   ├── supabase.js      # Supabase client
│   │   ├── reddit.js        # Reddit API integration
│   │   ├── openai.js        # AI content processing
│   │   ├── notifications.js # Notification system
│   │   └── stripe.js        # Payment processing
│   ├── App.jsx              # Main app component
│   ├── main.jsx             # App entry point
│   └── index.css            # Global styles
├── database/
│   └── schema.sql           # Database schema
├── docs/
│   └── API.md               # API documentation
├── public/                  # Static assets
├── package.json             # Dependencies and scripts
├── tailwind.config.js       # Tailwind configuration
├── vite.config.js           # Vite configuration
└── README.md                # This file
```

## 🎨 Design System

The application uses a consistent design system built with Tailwind CSS:

### Colors
- **Primary**: `hsl(210, 70%, 50%)` - Blue theme
- **Accent**: `hsl(130, 70%, 50%)` - Green accents
- **Background**: `hsl(210, 36%, 96%)` - Light gray background
- **Surface**: `hsl(210, 36%, 100%)` - White surfaces

### Components
- **Card**: Elevated surface with shadow
- **Button Primary**: Blue background with hover states
- **Button Secondary**: Outlined button with hover effects

### Typography
- **Display**: Large headings (text-5xl font-bold)
- **Headline**: Section headings (text-3xl font-semibold)
- **Body**: Regular text (text-base leading-7)

## 🔧 Development

### Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Code Style

The project follows these conventions:
- Functional components with hooks
- Descriptive component and variable names
- Consistent file organization
- Error boundaries for robust error handling
- Loading states for better UX

### Adding New Features

1. **Components**: Add reusable UI components to `src/components/`
2. **Pages**: Add new pages to `src/pages/` and update routing in `App.jsx`
3. **API Integration**: Add new API functions to appropriate files in `src/lib/`
4. **Database**: Update schema in `database/schema.sql` and run migrations
5. **Styling**: Use Tailwind classes and extend the design system as needed

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

### Deploy to Vercel

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Deploy to Netlify

1. Build the project: `npm run build`
2. Upload the `dist` folder to Netlify
3. Configure environment variables
4. Set up continuous deployment

### Environment Variables for Production

Make sure to set all required environment variables in your deployment platform:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_OPENAI_API_KEY`
- `VITE_REDDIT_CLIENT_ID` (optional)
- `VITE_REDDIT_CLIENT_SECRET` (optional)
- `VITE_STRIPE_PUBLISHABLE_KEY` (optional)

## 📊 Database Schema

The application uses the following main tables:

- **users** - User profiles and subscription tiers
- **topics** - Available discussion topics
- **reddit_threads** - Cached Reddit posts
- **summaries** - AI-generated summaries
- **insights** - User-saved insights
- **notifications** - User notifications
- **user_preferences** - Notification preferences
- **subscription_history** - Payment and subscription records

See `database/schema.sql` for the complete schema with relationships and indexes.

## 🔐 Security

### Authentication
- Supabase Auth with JWT tokens
- Row Level Security (RLS) policies
- Secure API key management

### Data Protection
- User data isolation via RLS
- Input validation and sanitization
- HTTPS-only communication

### API Security
- Rate limiting on external APIs
- Webhook signature verification
- Environment variable protection

## 🧪 Testing

### Manual Testing Checklist

- [ ] User registration and login
- [ ] Topic selection and browsing
- [ ] AI summary generation
- [ ] Insight saving and management
- [ ] Notification system
- [ ] Subscription upgrade flow
- [ ] Payment processing
- [ ] Mobile responsiveness

### API Testing

Use the provided API documentation in `docs/API.md` to test endpoints with tools like Postman or curl.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Guidelines

- Follow the existing code style and conventions
- Add comments for complex logic
- Update documentation for new features
- Test your changes thoroughly
- Keep commits focused and descriptive

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Common Issues

**Q: Reddit API not working?**
A: The app falls back to mock data if Reddit API credentials aren't configured. This is normal for development.

**Q: AI summaries not generating?**
A: Make sure you have a valid OpenRouter API key set in your environment variables.

**Q: Database connection issues?**
A: Verify your Supabase URL and anon key are correct and the database schema has been applied.

### Getting Help

- Check the [API Documentation](docs/API.md)
- Review the database schema in `database/schema.sql`
- Look at existing components for implementation patterns
- Open an issue for bugs or feature requests

## 🎯 Roadmap

### Upcoming Features
- [ ] Mobile app (React Native)
- [ ] Advanced analytics dashboard
- [ ] Custom topic creation
- [ ] Social sharing features
- [ ] Integration with more platforms (Twitter, HackerNews)
- [ ] Advanced AI features (sentiment analysis, trend prediction)

### Performance Improvements
- [ ] Implement caching strategies
- [ ] Optimize database queries
- [ ] Add service worker for offline support
- [ ] Implement lazy loading for better performance

---

Built with ❤️ by the Reddit Digest team
