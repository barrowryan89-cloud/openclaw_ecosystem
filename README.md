# 🦞 OpenClaw Ecosystem Dashboard

A real-time public dashboard showing what's happening in the OpenClaw (formerly Clawdbot/Moltbot) ecosystem.

**Live data pulled automatically from:**
- GitHub API — stars, forks, issues, commits, releases, contributors
- npm API — download counts (weekly + monthly)
- Ecosystem stats — ClawHub skills, Moltbook agents, supported channels

Auto-refreshes every 5 minutes. No database needed. No config needed.

---

## 🚀 Deploy to Vercel (One Click)

### Option A: The easiest way
1. Push this entire folder to a new GitHub repo
2. Go to [vercel.com/new](https://vercel.com/new)
3. Import your repo
4. Click **Deploy**
5. Done! Your dashboard is live.

### Option B: From your terminal
```bash
# Install Vercel CLI (one time)
npm install -g vercel

# From inside this folder:
vercel
```

That's it. Follow the prompts and your dashboard will be live at a URL like `openclaw-dashboard.vercel.app`.

---

## ⚡ Optional: Increase GitHub API Limits

By default, the dashboard works without any configuration. But GitHub limits anonymous API requests to 60/hour. If you get rate-limited:

1. Go to [github.com/settings/tokens](https://github.com/settings/tokens)
2. Create a new **Fine-grained token** (no special permissions needed — public repo access is enough)
3. In your Vercel dashboard, go to **Settings → Environment Variables**
4. Add: `GITHUB_TOKEN` = your token
5. Redeploy

This gives you 5,000 requests/hour instead of 60.

---

## 🧑‍💻 Run Locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## What's on the Dashboard

| Section | Source | Updates |
|---------|--------|---------|
| ⭐ Stars / Forks / Issues / Watchers | GitHub API | Every 5 min |
| 📦 npm Downloads (7d + 30d) | npm API | Every 5 min |
| 📊 Weekly download chart | npm API | Every 5 min |
| 📈 Commit activity chart | GitHub API | Every 5 min |
| 🏷️ Recent releases | GitHub API | Every 5 min |
| 🔄 Latest commits feed | GitHub API | Every 5 min |
| 👥 Top contributors | GitHub API | Every 5 min |
| 🧩 ClawHub skills | Static (updated periodically) | Manual |
| 🤖 Moltbook agents | Static (updated periodically) | Manual |

---

Built with Next.js + Recharts. MIT License.
