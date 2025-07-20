# Deployment Guide - Munchies Food Delivery

## GitHub Repository Setup

### 1. Repository Configuration
- **Repository Name**: `munchies-food-delivery`
- **Owner**: `alpdogancelik`
- **Visibility**: Public/Private (as needed)
- **URL**: `https://github.com/alpdogancelik/munchies-food-delivery`

### 2. Required Environment Variables

For production deployment, configure these environment variables:

```env
# Database Configuration
DATABASE_URL=postgresql://username:password@host:port/database

# Session Security
SESSION_SECRET=your-secure-random-session-secret

# Email Service (SendGrid)
SENDGRID_API_KEY=SG.your-sendgrid-api-key

# Google Maps Integration
GOOGLE_MAPS_API_KEY=AIza...your-google-maps-api-key

# Optional: Payment Integration
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLIC_KEY=pk_live_...
```

## Deployment Options

### Option 1: Replit Deployment (Recommended)

1. **Import from GitHub**:
   - Go to Replit and create new Repl
   - Choose "Import from GitHub"
   - Enter repository URL: `https://github.com/alpdogancelik/munchies-food-delivery`

2. **Configure Secrets**:
   - Go to Replit Secrets tab
   - Add all required environment variables
   - These will be automatically available to your application

3. **Database Setup**:
   - Replit provides PostgreSQL database automatically
   - Run database migrations: `npm run db:push`

4. **Deploy**:
   - Click "Deploy" button in Replit
   - Your app will be available at `https://your-repl-name.your-username.repl.co`

### Option 2: Vercel Deployment

1. **Connect Repository**:
   ```bash
   npm i -g vercel
   vercel --prod
   ```

2. **Configure Environment Variables**:
   - Go to Vercel Dashboard → Project Settings → Environment Variables
   - Add all required environment variables

3. **Build Settings**:
   - Build Command: `npm run build`
   - Output Directory: `dist/public`
   - Install Command: `npm install`

### Option 3: Railway Deployment

1. **Connect GitHub**:
   - Go to Railway dashboard
   - Click "New Project" → "Deploy from GitHub"
   - Select your repository

2. **Environment Setup**:
   - Add environment variables in Railway dashboard
   - Configure PostgreSQL addon

3. **Deploy**:
   - Railway automatically builds and deploys
   - Custom domain available with Railway Pro

### Option 4: DigitalOcean App Platform

1. **Create App**:
   - Connect GitHub repository
   - Configure build settings:
     - Build Command: `npm run build`
     - Run Command: `npm start`

2. **Database**:
   - Create PostgreSQL database cluster
   - Add DATABASE_URL to environment variables

3. **Environment Variables**:
   - Configure all required environment variables
   - Enable automatic deploys on git push

## Database Migration

After deployment, run database migrations:

```bash
# Push schema changes to database
npm run db:push

# Or if using migrations (future enhancement)
npm run db:migrate
```

## Production Checklist

### Security
- [ ] All environment variables configured securely
- [ ] SESSION_SECRET is cryptographically random
- [ ] Database credentials are secure
- [ ] CORS is properly configured for your domain
- [ ] HTTPS is enabled

### Performance
- [ ] Static assets are properly cached
- [ ] Database connection pooling is configured
- [ ] API rate limiting is implemented
- [ ] Image uploads are optimized

### Monitoring
- [ ] Error logging is configured
- [ ] Performance monitoring is set up
- [ ] Database performance is monitored
- [ ] Uptime monitoring is active

## Custom Domain Setup

### For Replit:
1. Go to your Repl → Webview
2. Click on the domain settings
3. Configure custom domain (requires Replit Core/Teams)

### For Vercel:
1. Go to Project Settings → Domains
2. Add your custom domain
3. Configure DNS records as instructed

### For Railway:
1. Go to project settings
2. Add custom domain under "Networking"
3. Update DNS CNAME record

## Troubleshooting

### Common Issues

**Database Connection Issues**:
- Verify DATABASE_URL format
- Check firewall settings
- Ensure database is accessible from deployment platform

**Environment Variable Issues**:
- Verify all required variables are set
- Check for typos in variable names
- Ensure values don't contain spaces or special characters

**Build Failures**:
- Check Node.js version compatibility (18+)
- Verify all dependencies are listed in package.json
- Review build logs for specific error messages

### Support Contacts

- **Developer**: Alpcan Çelik
- **Email**: alpdogan.celik1@gmail.com
- **GitHub**: @alpdogancelik

## Maintenance

### Regular Tasks
- Monitor application performance
- Update dependencies regularly
- Review and rotate API keys
- Backup database regularly
- Monitor disk space usage

### Updates
- Use GitHub Actions for CI/CD (optional)
- Test changes in staging environment
- Monitor deployment logs
- Rollback capabilities if needed

---

**Happy Deploying!** 🚀

*Munchies - From Kalkanlı with love*