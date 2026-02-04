# Deployment Guide - Netlify

This guide will help you deploy the School Health Information System (SHIS) to Netlify.

## Prerequisites

1. A Netlify account (sign up at https://netlify.com)
2. Your code pushed to a Git repository (GitHub, GitLab, or Bitbucket)

## Deployment Methods

### Method 1: Deploy via Netlify UI (Recommended for first-time deployment)

1. **Push your code to Git**
   ```bash
   git add .
   git commit -m "Prepare for Netlify deployment"
   git push origin main
   ```

2. **Connect to Netlify**
   - Go to https://app.netlify.com
   - Click "Add new site" → "Import an existing project"
   - Connect your Git provider (GitHub/GitLab/Bitbucket)
   - Select your repository

3. **Configure Build Settings**
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
   - Netlify should auto-detect these from `netlify.toml`

4. **Set Environment Variables** (if needed)
   - Go to Site settings → Environment variables
   - Add any required variables:
     ```
     VITE_BLOOD_BANK_API_URL=https://api.nationalbloodbank.gov.in/v1
     VITE_BLOOD_BANK_API_KEY=your_api_key_here
     VITE_USE_MOCK_API=true
     ```

5. **Deploy**
   - Click "Deploy site"
   - Wait for the build to complete
   - Your site will be live at `https://your-site-name.netlify.app`

### Method 2: Deploy via Netlify CLI

1. **Install Netlify CLI**
   ```bash
   npm install -g netlify-cli
   ```

2. **Login to Netlify**
   ```bash
   netlify login
   ```

3. **Initialize Netlify in your project**
   ```bash
   cd school-health-hub
   netlify init
   ```
   - Follow the prompts to link your site
   - Choose "Create & configure a new site"

4. **Deploy**
   ```bash
   netlify deploy --prod
   ```

   For preview deployments:
   ```bash
   netlify deploy
   ```

### Method 3: Drag & Drop Deployment

1. **Build your project locally**
   ```bash
   npm run build
   ```

2. **Deploy**
   - Go to https://app.netlify.com/drop
   - Drag and drop the `dist` folder
   - Your site will be deployed instantly

## Environment Variables

If you're using the real Blood Bank API, set these in Netlify:

1. Go to **Site settings** → **Environment variables**
2. Add the following variables:

   ```
   VITE_BLOOD_BANK_API_URL=https://api.nationalbloodbank.gov.in/v1
   VITE_BLOOD_BANK_API_KEY=your_api_key_here
   VITE_USE_MOCK_API=false
   ```

   Or to use mock API (default):
   ```
   VITE_USE_MOCK_API=true
   ```

## Custom Domain

1. Go to **Site settings** → **Domain management**
2. Click **Add custom domain**
3. Follow the instructions to configure your domain

## Continuous Deployment

Netlify automatically deploys when you push to your connected Git branch:
- **Production**: Deploys from `main` or `master` branch
- **Branch deploys**: Other branches create preview deployments

## Build Configuration

The build is configured in `netlify.toml`:
- **Build command**: `npm run build`
- **Publish directory**: `dist`
- **Node version**: 18

## Troubleshooting

### Build Fails

1. Check build logs in Netlify dashboard
2. Ensure Node version is 18 or higher
3. Verify all dependencies are in `package.json`

### Routing Issues (404 errors)

- The `_redirects` file and `netlify.toml` should handle SPA routing
- If issues persist, verify the redirect rules are correct

### Environment Variables Not Working

- Ensure variables start with `VITE_` prefix
- Rebuild after adding new variables
- Check variable names match exactly in code

## Post-Deployment

1. Test all routes work correctly
2. Verify API integrations (if using real APIs)
3. Check mobile responsiveness
4. Test authentication flows
5. Verify PDF generation works in production

## Support

For Netlify-specific issues, check:
- [Netlify Documentation](https://docs.netlify.com)
- [Netlify Community](https://answers.netlify.com)


