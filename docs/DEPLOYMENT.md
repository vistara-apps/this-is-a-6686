# Deployment Guide

This guide covers how to deploy the Reddit Digest application to production.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Database Setup](#database-setup)
4. [Supabase Edge Functions](#supabase-edge-functions)
5. [Frontend Deployment](#frontend-deployment)
6. [Domain Configuration](#domain-configuration)
7. [Monitoring and Maintenance](#monitoring-and-maintenance)

## Prerequisites

Before deploying, ensure you have:

- A Supabase project (production)
- Reddit API credentials (optional)
- OpenRouter API key
- Stripe account with products configured
- Domain name (optional)
- GitHub repository

## Environment Setup

### 1. Supabase Project Setup

1. Create a new Supabase project for production
2. Note down your project URL and anon key
3. Configure authentication providers if needed
4. Set up custom SMTP for email notifications (optional)

### 2. External API Keys

#### Reddit API (Optional)
1. Go to https://www.reddit.com/prefs/apps
2. Create a new application (script type)
3. Note the client ID and secret

#### OpenRouter API
1. Sign up at https://openrouter.ai
2. Create an API key
3. Add credits to your account

#### Stripe Setup
1. Create products and prices in Stripe Dashboard
2. Set up webhooks endpoint (will be configured later)
3. Note down publishable key and price IDs

### 3. Environment Variables

Create production environment variables:

```bash
# Supabase (Production)
VITE_SUPABASE_URL=https://your-prod-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-production-anon-key

# OpenRouter
VITE_OPENAI_API_KEY=your-openrouter-api-key

# Reddit API (Optional)
VITE_REDDIT_CLIENT_ID=your-reddit-client-id
VITE_REDDIT_CLIENT_SECRET=your-reddit-client-secret

# Stripe (Production)
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_your-live-publishable-key
VITE_STRIPE_BASIC_PRICE_ID=price_your-basic-plan-price-id
VITE_STRIPE_PREMIUM_PRICE_ID=price_your-premium-plan-price-id

# RainbowKit
VITE_WALLETCONNECT_PROJECT_ID=your-walletconnect-project-id
```

## Database Setup

### 1. Run Database Schema

1. Open your Supabase project dashboard
2. Go to SQL Editor
3. Copy and paste the contents of `database/schema.sql`
4. Execute the SQL script

### 2. Verify Tables and Policies

Ensure all tables are created with proper RLS policies:

```sql
-- Check if all tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';

-- Verify RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
```

### 3. Test Database Functions

Test the custom functions:

```sql
-- Test trending topics function
SELECT * FROM get_trending_topics(5);
```

## Supabase Edge Functions

### 1. Install Supabase CLI

```bash
npm install -g supabase
```

### 2. Login and Link Project

```bash
supabase login
supabase link --project-ref your-project-ref
```

### 3. Create Edge Functions

Create the following edge functions:

#### Stripe Webhook Handler

```bash
supabase functions new stripe-webhook
```

Create `supabase/functions/stripe-webhook/index.ts`:

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const signature = req.headers.get('stripe-signature')
    const body = await req.text()
    
    // Verify webhook signature
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
      apiVersion: '2023-10-16',
    })
    
    const event = stripe.webhooks.constructEvent(
      body,
      signature!,
      Deno.env.get('STRIPE_WEBHOOK_SECRET')!
    )

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Handle different event types
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        // Update user subscription
        break
      case 'customer.subscription.deleted':
        // Cancel user subscription
        break
      case 'invoice.payment_succeeded':
        // Handle successful payment
        break
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
```

#### Create Checkout Session

```bash
supabase functions new create-checkout-session
```

#### Email Notifications

```bash
supabase functions new send-email
```

### 4. Deploy Edge Functions

```bash
supabase functions deploy stripe-webhook
supabase functions deploy create-checkout-session
supabase functions deploy send-email
```

### 5. Set Environment Variables

```bash
supabase secrets set STRIPE_SECRET_KEY=sk_live_your-secret-key
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret
supabase secrets set OPENAI_API_KEY=your-openrouter-api-key
```

## Frontend Deployment

### Option 1: Vercel (Recommended)

1. **Connect Repository**
   - Go to Vercel dashboard
   - Import your GitHub repository
   - Select the project

2. **Configure Build Settings**
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`

3. **Set Environment Variables**
   - Add all production environment variables
   - Ensure they start with `VITE_`

4. **Deploy**
   - Vercel will automatically deploy on push to main branch
   - Custom domains can be configured in project settings

### Option 2: Netlify

1. **Build and Deploy**
   ```bash
   npm run build
   ```

2. **Upload to Netlify**
   - Drag and drop the `dist` folder to Netlify
   - Or connect GitHub repository for continuous deployment

3. **Configure Environment Variables**
   - Go to Site Settings > Environment Variables
   - Add all production environment variables

4. **Configure Redirects**
   Create `public/_redirects`:
   ```
   /*    /index.html   200
   ```

### Option 3: Custom Server

1. **Build the Application**
   ```bash
   npm run build
   ```

2. **Serve Static Files**
   ```bash
   # Using nginx
   sudo cp -r dist/* /var/www/html/
   
   # Or using a simple HTTP server
   npx serve dist -p 3000
   ```

3. **Configure Reverse Proxy**
   Example nginx configuration:
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com;
       
       location / {
           root /var/www/html;
           try_files $uri $uri/ /index.html;
       }
   }
   ```

## Domain Configuration

### 1. Custom Domain Setup

#### For Vercel:
1. Go to Project Settings > Domains
2. Add your custom domain
3. Configure DNS records as instructed

#### For Netlify:
1. Go to Site Settings > Domain Management
2. Add custom domain
3. Update DNS records

### 2. SSL Certificate

Both Vercel and Netlify provide automatic SSL certificates. For custom servers:

```bash
# Using Let's Encrypt with Certbot
sudo certbot --nginx -d yourdomain.com
```

### 3. DNS Configuration

Point your domain to the deployment platform:

```
# For Vercel
CNAME    www    cname.vercel-dns.com

# For Netlify  
CNAME    www    your-site-name.netlify.app
```

## Stripe Webhook Configuration

1. **Get Webhook URL**
   - Supabase: `https://your-project.supabase.co/functions/v1/stripe-webhook`

2. **Configure in Stripe Dashboard**
   - Go to Developers > Webhooks
   - Add endpoint with your webhook URL
   - Select events to listen for:
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`

3. **Update Webhook Secret**
   ```bash
   supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret
   ```

## Monitoring and Maintenance

### 1. Application Monitoring

#### Supabase Dashboard
- Monitor database performance
- Check API usage and limits
- Review authentication metrics

#### Vercel/Netlify Analytics
- Track page views and performance
- Monitor build and deployment status
- Review error logs

### 2. Error Tracking

Consider integrating error tracking services:

```bash
npm install @sentry/react @sentry/vite-plugin
```

### 3. Performance Monitoring

#### Core Web Vitals
- Monitor loading performance
- Track user interactions
- Optimize based on real user data

#### Database Performance
- Monitor query performance in Supabase
- Set up alerts for slow queries
- Optimize indexes as needed

### 4. Backup Strategy

#### Database Backups
- Supabase provides automatic backups
- Consider additional backup strategies for critical data

#### Code Backups
- Ensure code is backed up in version control
- Tag releases for easy rollback

### 5. Security Monitoring

#### Regular Security Checks
- Monitor for security vulnerabilities
- Keep dependencies updated
- Review access logs regularly

#### API Key Rotation
- Rotate API keys periodically
- Monitor for unauthorized usage
- Set up usage alerts

## Troubleshooting

### Common Deployment Issues

#### Build Failures
```bash
# Clear cache and reinstall dependencies
rm -rf node_modules package-lock.json
npm install
npm run build
```

#### Environment Variable Issues
- Ensure all variables start with `VITE_`
- Check for typos in variable names
- Verify values are correctly set

#### Database Connection Issues
- Verify Supabase URL and key
- Check RLS policies
- Ensure database schema is applied

#### API Integration Issues
- Test external API connections
- Verify API keys and quotas
- Check CORS configuration

### Performance Issues

#### Slow Loading
- Optimize images and assets
- Implement code splitting
- Use CDN for static assets

#### Database Performance
- Add indexes for frequently queried columns
- Optimize complex queries
- Consider caching strategies

## Rollback Procedures

### 1. Frontend Rollback

#### Vercel
- Go to Deployments tab
- Click on previous successful deployment
- Click "Promote to Production"

#### Netlify
- Go to Deploys tab
- Find previous deployment
- Click "Publish deploy"

### 2. Database Rollback

```sql
-- Create backup before changes
pg_dump your_database > backup.sql

-- Restore from backup if needed
psql your_database < backup.sql
```

### 3. Environment Variables

Keep a secure backup of all environment variables for quick restoration.

## Post-Deployment Checklist

- [ ] All pages load correctly
- [ ] User authentication works
- [ ] Database operations function properly
- [ ] External API integrations work
- [ ] Payment processing is functional
- [ ] Email notifications are sent
- [ ] Mobile responsiveness is maintained
- [ ] SSL certificate is active
- [ ] Custom domain resolves correctly
- [ ] Monitoring and alerts are configured
- [ ] Backup procedures are in place

## Maintenance Schedule

### Daily
- Monitor error logs
- Check application performance
- Review user feedback

### Weekly
- Review security alerts
- Check dependency updates
- Monitor usage metrics

### Monthly
- Update dependencies
- Review and rotate API keys
- Analyze performance metrics
- Plan feature updates

This deployment guide should be updated as the application evolves and new deployment requirements emerge.
