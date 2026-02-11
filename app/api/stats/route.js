// Server-side API route — fetches GitHub + npm data and caches for 5 minutes
// This avoids hitting rate limits from client-side requests

const GITHUB_REPO = "openclaw/openclaw";
const GITHUB_SKILLS_REPO = "openclaw/skills";
const NPM_PACKAGE = "openclaw";

// In-memory cache (persists across requests within same serverless invocation)
let cache = { data: null, ts: 0 };
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

async function ghFetch(path) {
  const headers = { Accept: "application/vnd.github.v3+json", "User-Agent": "openclaw-dashboard" };
  // If you add a GITHUB_TOKEN env var in Vercel, you get 5000 req/hr instead of 60
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }
  const res = await fetch(`https://api.github.com${path}`, { headers, next: { revalidate: 300 } });
  if (!res.ok) return null;
  return res.json();
}

async function npmFetch(path) {
  const res = await fetch(`https://api.npmjs.org${path}`, { next: { revalidate: 300 } });
  if (!res.ok) return null;
  return res.json();
}

export async function GET() {
  // Return cached data if fresh
  if (cache.data && Date.now() - cache.ts < CACHE_TTL) {
    return Response.json(cache.data, {
      headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" },
    });
  }

  try {
    // Fire all requests in parallel
    const [
      repo,
      commits,
      releases,
      contributors,
      npmMonth,
      npmWeek,
      skillsRepo,
    ] = await Promise.allSettled([
      ghFetch(`/repos/${GITHUB_REPO}`),
      ghFetch(`/repos/${GITHUB_REPO}/commits?per_page=20`),
      ghFetch(`/repos/${GITHUB_REPO}/releases?per_page=8`),
      ghFetch(`/repos/${GITHUB_REPO}/contributors?per_page=12`),
      npmFetch(`/downloads/range/last-month/${NPM_PACKAGE}`),
      npmFetch(`/downloads/point/last-week/${NPM_PACKAGE}`),
      ghFetch(`/repos/${GITHUB_SKILLS_REPO}`),
    ]);

    // Process commits into activity feed
    const commitsData = commits.status === "fulfilled" ? commits.value : [];
    const activityFeed = (commitsData || []).map((c) => ({
      message: c.commit?.message?.split("\n")[0]?.slice(0, 120) || "Commit",
      date: c.commit?.author?.date || null,
      sha: c.sha?.slice(0, 7),
      author: c.author?.login || c.commit?.author?.name || "unknown",
      avatar: c.author?.avatar_url || null,
    }));

    // Process commits into daily counts for chart
    const dailyCounts = {};
    (commitsData || []).forEach((c) => {
      const d = c.commit?.author?.date?.slice(0, 10);
      if (d) dailyCounts[d] = (dailyCounts[d] || 0) + 1;
    });
    const commitChart = Object.entries(dailyCounts)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, count]) => ({ date, count }));

    // Process npm downloads into weekly buckets for chart
    const npmData = npmMonth.status === "fulfilled" ? npmMonth.value : null;
    const npmChart = [];
    if (npmData?.downloads) {
      for (let i = 0; i < npmData.downloads.length; i += 7) {
        const chunk = npmData.downloads.slice(i, i + 7);
        const total = chunk.reduce((s, d) => s + d.downloads, 0);
        npmChart.push({ date: chunk[0].day, downloads: total });
      }
    }
    const npmTotal = npmData?.downloads?.reduce((s, d) => s + d.downloads, 0) || 0;
    const npmWeekTotal = npmWeek.status === "fulfilled" ? npmWeek.value?.downloads || 0 : 0;

    // Process contributors
    const contribData = contributors.status === "fulfilled" ? contributors.value : [];
    const topContributors = (contribData || []).map((c) => ({
      login: c.login,
      avatar: c.avatar_url,
      contributions: c.contributions,
      url: c.html_url,
    }));

    // Process releases
    const releasesData = releases.status === "fulfilled" ? releases.value : [];
    const recentReleases = (releasesData || []).map((r) => ({
      tag: r.tag_name,
      name: r.name,
      date: r.published_at,
      url: r.html_url,
    }));

    // Repo stats
    const repoData = repo.status === "fulfilled" ? repo.value : null;
    const skillsData = skillsRepo.status === "fulfilled" ? skillsRepo.value : null;

    const result = {
      // Core GitHub stats
      stars: repoData?.stargazers_count ?? null,
      forks: repoData?.forks_count ?? null,
      openIssues: repoData?.open_issues_count ?? null,
      watchers: repoData?.subscribers_count ?? null,
      repoSize: repoData?.size ?? null,
      language: repoData?.language ?? "TypeScript",
      createdAt: repoData?.created_at ?? null,
      updatedAt: repoData?.updated_at ?? null,
      defaultBranch: repoData?.default_branch ?? "main",
      description: repoData?.description ?? null,

      // Skills repo
      skillsStars: skillsData?.stargazers_count ?? null,
      skillsForks: skillsData?.forks_count ?? null,

      // npm
      npmDownloadsMonth: npmTotal,
      npmDownloadsWeek: npmWeekTotal,
      npmChart,

      // Activity
      commitChart,
      activityFeed: activityFeed.slice(0, 12),
      recentReleases,
      topContributors,

      // Meta
      fetchedAt: new Date().toISOString(),
    };

    // Update cache
    cache = { data: result, ts: Date.now() };

    return Response.json(result, {
      headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" },
    });
  } catch (err) {
    // If we have stale cache, return it
    if (cache.data) {
      return Response.json({ ...cache.data, stale: true }, {
        headers: { "Cache-Control": "public, s-maxage=60" },
      });
    }
    return Response.json({ error: err.message }, { status: 500 });
  }
}
