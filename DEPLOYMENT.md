# GeoPlan - Deployment Guide

## 🚀 Deploy to Vercel

### Prerequisites
1. GitHub account
2. Vercel account (sign up at https://vercel.com)
3. Mapbox API token (get from https://mapbox.com)

### Quick Deploy

#### Option 1: Deploy via Vercel Dashboard (Easiest)

1. **Push to GitHub** (already done!)
   ```bash
   # Your repo is at: https://github.com/arturdu/geoplan2
   ```

2. **Import to Vercel**
   - Go to https://vercel.com/new
   - Click "Import Git Repository"
   - Select your GitHub account
   - Choose the `geoplan2` repository
   - Click "Import"

3. **Configure Environment Variables**
   - In the import screen, add environment variables:
     - `VITE_MAPBOX_ACCESS_TOKEN` = your Mapbox token
   - Click "Deploy"

4. **Done!** 🎉
   - Your app will be live at: `https://geoplan2.vercel.app` (or custom domain)
   - Deployments happen automatically on every git push

#### Option 2: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   # First deployment (will ask configuration questions)
   vercel

   # Follow prompts:
   # - Project name: geoplan2
   # - Framework: Vite
   # - Build command: npm run build
   # - Output directory: dist
   ```

4. **Add Environment Variables**
   ```bash
   vercel env add VITE_MAPBOX_ACCESS_TOKEN
   # Paste your Mapbox token when prompted
   # Select: Production, Preview, Development (all three)
   ```

5. **Deploy to Production**
   ```bash
   vercel --prod
   ```

### Environment Variables

Required environment variables in Vercel dashboard:

| Variable | Value | Description |
|----------|-------|-------------|
| `VITE_MAPBOX_ACCESS_TOKEN` | `pk.eyJ1...` | Your Mapbox public token |

**How to add in Vercel Dashboard:**
1. Go to your project on Vercel
2. Click "Settings" → "Environment Variables"
3. Add the variable above
4. Click "Save"
5. Redeploy: "Deployments" → "..." → "Redeploy"

### Build Configuration

The `vercel.json` file is already configured with:
- ✅ Vue SPA routing (all routes redirect to index.html)
- ✅ Asset caching (1 year for static assets)
- ✅ Security headers
- ✅ Optimized for Frankfurt region (closest to Poland)
- ✅ 4GB memory for build

### Custom Domain

1. **Add Domain in Vercel:**
   - Go to Project Settings → Domains
   - Add your domain (e.g., `geoplan.pl`)

2. **Configure DNS:**
   - Add CNAME record: `www` → `cname.vercel-dns.com`
   - Add A record: `@` → `76.76.21.21`

3. **SSL Certificate:**
   - Automatically provisioned by Vercel
   - Takes 1-2 minutes

### Troubleshooting

#### Build Fails with Memory Error
- Already handled in `vercel.json` with `NODE_OPTIONS: "--max-old-space-size=4096"`
- If still fails, contact Vercel support to increase Pro plan limits

#### Environment Variables Not Working
- Make sure variable names start with `VITE_` prefix
- Redeploy after adding variables
- Check spelling: `VITE_MAPBOX_ACCESS_TOKEN` (exact case)

#### Routes Show 404
- `vercel.json` already configured with rewrites
- If custom domain, ensure DNS is propagated (takes up to 48h)
- Clear browser cache

#### Map Not Loading
- Check Mapbox token is set correctly in environment variables
- Check Mapbox account has sufficient quota
- Open browser console for errors

### Performance Tips

1. **Enable Vercel Analytics** (Optional, $10/month)
   - Real-time visitor analytics
   - Web Vitals monitoring

2. **Edge Functions** (Already optimized)
   - Static files served from CDN edge locations
   - Poland users get assets from Frankfurt edge

3. **Compression**
   - Gzip/Brotli automatically enabled
   - Assets compressed: ~406KB main CSS, ~390KB Mapbox

### Monitoring

**Check Deployment Status:**
```bash
vercel ls
```

**View Logs:**
```bash
vercel logs [deployment-url]
```

**Check Build Logs:**
- Vercel Dashboard → Deployments → Click deployment → Build Logs

### Costs

**Vercel Free Tier (Hobby):**
- ✅ 100GB bandwidth/month
- ✅ Unlimited projects
- ✅ SSL certificates
- ✅ Global CDN
- ✅ Good for 1-2 small companies

**If exceeding limits:**
- Pro Plan: $20/month
- 1TB bandwidth
- Better build performance

**Note:** Mapbox API costs separate (~$5-50/month depending on usage)

---

## Alternative Deployment Options

### Option 1: VPS (Own Server)

**Pros:**
- Full control
- No bandwidth limits
- One-time cost

**Recommended VPS (Poland):**
- OVH.pl: 30-50 PLN/month
- home.pl: 40-80 PLN/month
- Azure/DigitalOcean: $10-20/month

**Setup:**
```bash
# On VPS (Ubuntu/Debian)
sudo apt update
sudo apt install nginx nodejs npm

# Clone repo
git clone https://github.com/arturdu/geoplan2.git
cd geoplan2

# Install & build
npm install
npm run build

# Configure Nginx
sudo nano /etc/nginx/sites-available/geoplan
# (copy nginx config from below)

sudo ln -s /etc/nginx/sites-available/geoplan /etc/nginx/sites-enabled/
sudo systemctl restart nginx
```

**Nginx Config:**
```nginx
server {
    listen 80;
    server_name geoplan.pl www.geoplan.pl;

    root /var/www/geoplan2/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### Option 2: Netlify

Similar to Vercel, also free tier available.

```bash
npm install -g netlify-cli
netlify login
netlify init
netlify deploy --prod
```

---

## 🎯 Recommended: Vercel

**Best for GeoPlan because:**
- ✅ Zero configuration needed
- ✅ Auto-deploys on git push
- ✅ Free SSL certificates
- ✅ Global CDN (fast in Poland)
- ✅ Easy environment variable management
- ✅ Preview deployments for testing
- ✅ Free tier sufficient for small-medium usage

**Total Cost: FREE** (Hobby tier) or **$20/month** (Pro tier for larger usage)

---

## Support

For deployment issues:
- Vercel Docs: https://vercel.com/docs
- Vite Docs: https://vitejs.dev
- GitHub Issues: https://github.com/arturdu/geoplan2/issues
