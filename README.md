# 3D Progress Bar Animator

A Next.js application with a 3D progress bar animation, audio feedback, and video export functionality.

## 🚀 Deploy to Vercel

### Prerequisites
- GitHub account
- Vercel account
- This repository cloned to your GitHub

### Step 1: Push to GitHub
```bash
git add .
git commit -m "Ready for Vercel deployment"
git push origin main
```

### Step 2: Deploy to Vercel

#### Method 1: Using Vercel Dashboard (Recommended)
1. Go to [vercel.com](https://vercel.com) and sign up
2. Click "New Project"
3. Import your GitHub repository
4. Configure the project:
   - **Framework Preset**: Next.js
   - **Build Command**: `npm run build:vercel`
   - **Output Directory**: `.next`
   - **Install Command**: `npm install`
5. Add Environment Variables:
   - `DATABASE_URL`: `file:./tmp/custom.db`
6. Click "Deploy"

#### Method 2: Using Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Follow the prompts to configure your project
```

### Step 3: Configure Environment Variables
After deployment, add the environment variable:
1. Go to your Vercel project dashboard
2. Click "Settings" → "Environment Variables"
3. Add:
   - **Key**: `DATABASE_URL`
   - **Value**: `file:./tmp/custom.db`
   - **Environments**: Production, Preview, Development

### Step 4: Redeploy
After adding environment variables, redeploy:
1. Go to the "Deployments" tab
2. Click the three dots next to your latest deployment
3. Select "Redeploy"

## 📋 Vercel Configuration Files

### vercel.json
```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/next"
    }
  ],
  "routes": [
    {
      "src": "/api/socketio/(.*)",
      "dest": "/api/socketio/$1"
    }
  ],
  "env": {
    "DATABASE_URL": "@database_url"
  }
}
```

### next.config.js
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  eslint: {
    ignoreDuringBuilds: true,
  },
  output: 'standalone',
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      Object.assign(config.resolve.alias, {
        'react/jsx-runtime.js': 'react/jsx-runtime.js',
        'react/jsx-dev-runtime.js': 'react/jsx-dev-runtime.js',
      })
    }
    return config
  },
};

module.exports = nextConfig;
```

## 🔧 Vercel-Specific Considerations

### Database
- Vercel uses ephemeral filesystem, so database files are stored in `/tmp`
- The database will reset on each deployment
- For production use, consider using a external database service

### WebSocket Support
- Socket.IO is supported on Vercel
- WebSockets work on all deployment types (Preview, Production)

### Audio
- Web Audio API works on Vercel
- User interaction is required to initialize audio context

### Video Export
- MediaRecorder API works on Vercel
- Exported videos are handled client-side

## 🎯 Features

### Core Features
- ✅ 2D Progress Bar with white border
- ✅ Smooth animations with easing
- ✅ Click sound effects on number changes
- ✅ Video export functionality (WebM)
- ✅ 3-2-1 countdown timer
- ✅ UI hiding during animation

### Technical Features
- ✅ Next.js 15 with TypeScript
- ✅ Tailwind CSS styling
- ✅ Socket.IO integration
- ✅ Prisma database support
- ✅ Web Audio API
- ✅ MediaRecorder API

## 🐛 Troubleshooting Vercel Deployment

### Build Issues
```bash
# Clear local build cache
rm -rf .next node_modules
npm install
npm run build:vercel
```

### Database Issues
- Ensure `DATABASE_URL` environment variable is set
- Use `file:./tmp/custom.db` for Vercel
- Database resets on each deployment (expected behavior)

### WebSocket Issues
- Socket.IO path must be `/api/socketio`
- CORS is configured for all origins
- Check Vercel logs for connection errors

### Audio Issues
- Audio requires user interaction to initialize
- Check browser console for Web Audio API errors
- Ensure user clicks Preview/Export first

### Video Export Issues
- MediaRecorder API requires HTTPS
- Check browser compatibility
- Ensure sufficient permissions

## 📱 Accessing Your Deployed App

After successful deployment:
- **Main App**: Your Vercel URL (e.g., `https://your-app.vercel.app`)
- **Socket.IO**: `wss://your-app.vercel.app/api/socketio`

## 💡 Tips for Vercel Deployment

1. **Use Preview Deployments**: Test changes in preview URLs before merging to production
2. **Monitor Logs**: Check Vercel function logs for debugging
3. **Environment Variables**: Keep development and production variables separate
4. **Performance**: Vercel automatically optimizes and caches your application
5. **Custom Domain**: Add a custom domain in Vercel dashboard

## 🚀 Production Considerations

### Database
For production use, consider:
- External database services (Supabase, PlanetScale, etc.)
- Serverless database solutions
- Persistent storage solutions

### Scaling
- Vercel automatically scales your application
- No additional configuration needed
- Handles traffic spikes automatically

### Monitoring
- Vercel Analytics for performance monitoring
- Vercel Logs for debugging
- Error tracking integrations available

---

**Note**: This application is ready for Vercel deployment with all necessary configuration files included.