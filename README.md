# 🦞 OpenClaw Ecosystem Dashboard

Live, auto-updating dashboard for the OpenClaw ecosystem.

## Deploy in 3 Steps (No Coding Required)

### Step 1: Create a GitHub repo
1. Go to **[github.com/new](https://github.com/new)**
2. Name it `openclaw-dashboard`
3. Check **"Add a README file"**
4. Click **Create repository**

### Step 2: Add the files
In your new repo, you need to create **6 files**. For each one:
1. Click **"Add file" → "Create new file"**
2. Type the **exact filename** shown below (including any `/` slashes — GitHub creates folders automatically!)
3. Paste the contents
4. Click **"Commit changes"**

The 6 files to create:

| Type this as the filename | What it does |
|---|---|
| `package.json` | Tells Vercel what to install |
| `next.config.js` | Next.js settings |
| `jsconfig.json` | Path settings |
| `vercel.json` | Vercel settings |
| `app/layout.js` | Page wrapper + fonts |
| `app/api/stats/route.js` | Fetches live data from GitHub + npm |
| `app/page.js` | The dashboard itself |

> **Tip:** When you type `app/layout.js` as the filename, GitHub will automatically create the `app` folder for you. Same for `app/api/stats/route.js` — it creates all the folders.

### Step 3: Deploy on Vercel
1. Go to **[vercel.com](https://vercel.com)** and sign in with GitHub
2. Click **"Add New → Project"**
3. Find and import `openclaw-dashboard`
4. Click **Deploy**
5. Wait ~60 seconds
6. Your dashboard is live! 🎉

---

## Optional: Avoid Rate Limits

The dashboard works immediately, but GitHub limits anonymous requests. To fix:

1. Go to [github.com/settings/tokens](https://github.com/settings/tokens)
2. Click **"Generate new token (classic)"**
3. Give it any name, no special permissions needed
4. Copy the token
5. In Vercel: **Settings → Environment Variables**
6. Add `GITHUB_TOKEN` with your token as the value
7. Redeploy

---

## What It Shows

- ⭐ GitHub stars, forks, watchers, issues (live)
- 📦 npm downloads — weekly + monthly with chart (live)
- 📈 Commit activity chart (live)
- 🏷️ Recent releases timeline (live)
- 🔄 Latest commits feed with authors (live)
- 👥 Top contributors with avatars (live)
- 🧩 ClawHub skills count
- 🤖 Moltbook agent count
- 📡 Supported messaging channels

Everything refreshes automatically every 5 minutes.
