# Signal Briefing — Enterprise AI Intel

Daily signal briefing tool that pulls from five curated enterprise AI sources and filters through a ServiceNow governance and consulting lens.

**Live at:** [your-vercel-url.vercel.app]

## Stack
- `index.html` — React (CDN), rss2json for feed fetching
- `api/briefing.js` — Vercel serverless function, Gemini 2.0 Flash (free tier)
- Zero npm dependencies

## Deploy to Vercel

### 1. Get a free Gemini API key
- Go to https://aistudio.google.com/app/apikey
- Create a new API key (free, no credit card needed)
- Copy the key

### 2. Push to GitHub
```bash
cd signal-briefing
git init
git add .
git commit -m "Initial deploy"
gh repo create tpanigrahy207/signal-briefing --public --push
```

### 3. Deploy on Vercel
```bash
npx vercel --prod
```
Or connect the GitHub repo at vercel.com/new.

### 4. Add the environment variable
In Vercel dashboard → Settings → Environment Variables:
- Name: `GEMINI_API_KEY`
- Value: your key from step 1

Redeploy after adding the env var.

## Add or swap feeds
Edit the `FEEDS` array in `index.html`. Any RSS URL works.

## Free tier limits
- rss2json.com: 10,000 requests/day
- Gemini 2.0 Flash: 1,500 requests/day, 1M tokens/minute
