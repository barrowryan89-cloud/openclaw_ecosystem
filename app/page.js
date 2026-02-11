"use client";

import { useState, useEffect, useCallback } from "react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Cell,
} from "recharts";

/* ═══════════════════════════════════════════
   THEME — deep ocean + lobster red
   ═══════════════════════════════════════════ */
const T = {
  bg:         "#06070b",
  surface:    "#0d0f16",
  card:       "#111420",
  cardHover:  "#161a27",
  border:     "#1a1f30",
  glow:       "#ff4d2a18",

  red:        "#ff4d2a",
  orange:     "#ff8a3a",
  gold:       "#ffb347",
  teal:       "#00d4aa",
  blue:       "#3b8bff",
  purple:     "#a78bfa",

  text:       "#e4e8f1",
  textSec:    "#7c8498",
  textMut:    "#454d62",

  font:       "'Outfit', -apple-system, sans-serif",
  mono:       "'DM Mono', 'SF Mono', 'Consolas', monospace",
};

/* ═══════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════ */
function fmt(n) {
  if (n == null) return "—";
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return n.toLocaleString();
}

function shortDate(d) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function timeAgo(d) {
  if (!d) return "";
  const s = Math.floor((Date.now() - new Date(d).getTime()) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return Math.floor(s / 60) + "m ago";
  if (s < 86400) return Math.floor(s / 3600) + "h ago";
  const days = Math.floor(s / 86400);
  if (days < 30) return days + "d ago";
  return Math.floor(days / 30) + "mo ago";
}

/* ═══════════════════════════════════════════
   ANIMATED NUMBER
   ═══════════════════════════════════════════ */
function AnimNum({ value }) {
  const [disp, setDisp] = useState(0);
  useEffect(() => {
    if (value == null) return;
    const n = typeof value === "number" ? value : parseInt(value, 10);
    if (isNaN(n)) return;
    const t0 = Date.now();
    const dur = 900;
    const tick = () => {
      const p = Math.min((Date.now() - t0) / dur, 1);
      const e = 1 - Math.pow(1 - p, 3);
      setDisp(Math.floor(e * n));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [value]);
  return <>{fmt(disp || value)}</>;
}

/* ═══════════════════════════════════════════
   TOOLTIP STYLE (shared)
   ═══════════════════════════════════════════ */
const tooltipStyle = {
  contentStyle: {
    background: T.card, border: `1px solid ${T.border}`,
    borderRadius: 10, fontSize: 12, fontFamily: T.font,
    boxShadow: "0 8px 32px rgba(0,0,0,.5)",
  },
  labelStyle: { color: T.textSec, marginBottom: 4 },
  cursor: { stroke: T.textMut, strokeWidth: 1, strokeDasharray: "4 4" },
};

/* ═══════════════════════════════════════════
   STAT CARD
   ═══════════════════════════════════════════ */
function Stat({ label, value, sub, icon, color = T.red, delay = 0, loading }) {
  return (
    <div style={{
      background: T.card, border: `1px solid ${T.border}`, borderRadius: 14,
      padding: "22px 24px", position: "relative", overflow: "hidden",
      animation: `fadeUp .5s ease ${delay}ms both`,
    }}>
      {/* top accent bar */}
      <div style={{ position: "absolute", top: 0, left: 0, width: "40%", height: 2, background: `linear-gradient(90deg, ${color}, transparent)` }} />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: T.textSec, textTransform: "uppercase", letterSpacing: ".1em", fontFamily: T.font }}>{label}</span>
        <span style={{ fontSize: 16, opacity: .45 }}>{icon}</span>
      </div>

      <div style={{ fontSize: 34, fontWeight: 700, color: T.text, fontFamily: T.mono, letterSpacing: "-.03em", lineHeight: 1.1 }}>
        {loading ? <span style={{ opacity: .2 }}>•••</span> : <AnimNum value={value} />}
      </div>

      {sub && <p style={{ fontSize: 11, color: T.textMut, margin: "8px 0 0", lineHeight: 1.3, fontFamily: T.font }}>{sub}</p>}
    </div>
  );
}

/* ═══════════════════════════════════════════
   SECTION HEADER
   ═══════════════════════════════════════════ */
function Section({ title, icon, children, delay = 0 }) {
  return (
    <section style={{ marginBottom: 32, animation: `fadeUp .5s ease ${delay}ms both` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <span style={{ fontSize: 18 }}>{icon}</span>
        <h2 style={{ fontSize: 14, fontWeight: 600, color: T.text, margin: 0, fontFamily: T.font, textTransform: "uppercase", letterSpacing: ".08em" }}>{title}</h2>
        <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg, ${T.border}, transparent)` }} />
      </div>
      {children}
    </section>
  );
}

/* ═══════════════════════════════════════════
   CHART CARD wrapper
   ═══════════════════════════════════════════ */
function ChartCard({ title, subtitle, height = 160, children }) {
  return (
    <div style={{
      background: T.card, border: `1px solid ${T.border}`, borderRadius: 14,
      padding: "18px 20px", overflow: "hidden",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: T.textSec, textTransform: "uppercase", letterSpacing: ".08em", fontFamily: T.font }}>{title}</span>
        {subtitle && <span style={{ fontSize: 11, color: T.textMut }}>{subtitle}</span>}
      </div>
      <div style={{ width: "100%", height }}>{children}</div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   ECOSYSTEM CARD
   ═══════════════════════════════════════════ */
function EcoCard({ title, value, sub, icon, color, link, delay = 0 }) {
  const inner = (
    <div style={{
      background: T.card, border: `1px solid ${T.border}`, borderRadius: 14,
      padding: "18px 20px", cursor: link ? "pointer" : "default",
      transition: "border-color .2s, transform .2s",
      animation: `fadeUp .5s ease ${delay}ms both`,
    }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = color + "50"; e.currentTarget.style.transform = "translateY(-2px)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.transform = "translateY(0)"; }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <span style={{ fontSize: 22 }}>{icon}</span>
        {link && <span style={{ fontSize: 11, color: T.textMut }}>↗</span>}
      </div>
      <div style={{ fontSize: 24, fontWeight: 700, color, fontFamily: T.mono, lineHeight: 1.1 }}>{value}</div>
      <div style={{ fontSize: 13, fontWeight: 500, color: T.text, marginTop: 6, fontFamily: T.font }}>{title}</div>
      <div style={{ fontSize: 11, color: T.textMut, marginTop: 2, fontFamily: T.font }}>{sub}</div>
    </div>
  );
  if (link) return <a href={link} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", display: "block" }}>{inner}</a>;
  return inner;
}

/* ═══════════════════════════════════════════
   MAIN DASHBOARD
   ═══════════════════════════════════════════ */
export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/stats");
      if (!res.ok) throw new Error("API error");
      setData(await res.json());
      setErr(null);
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const iv = setInterval(load, 5 * 60 * 1000);
    return () => clearInterval(iv);
  }, [load]);

  const d = data || {};

  return (
    <div style={{ minHeight: "100vh", background: T.bg, color: T.text, fontFamily: T.font }}>

      {/* Ambient background glow */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none",
        background: `radial-gradient(ellipse 60% 40% at 20% 10%, ${T.red}08 0%, transparent 70%),
                     radial-gradient(ellipse 50% 50% at 80% 80%, ${T.blue}06 0%, transparent 70%)`,
      }} />

      <div style={{ position: "relative", zIndex: 1, maxWidth: 1140, margin: "0 auto", padding: "32px 20px 80px" }}>

        {/* ── HEADER ── */}
        <header style={{ marginBottom: 36, animation: "fadeUp .5s ease both" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ fontSize: 40, lineHeight: 1, filter: `drop-shadow(0 0 20px ${T.red}50)` }}>🦞</div>
              <div>
                <h1 style={{
                  fontSize: 26, fontWeight: 800, margin: 0, letterSpacing: "-.03em",
                  background: `linear-gradient(135deg, ${T.red}, ${T.orange} 60%, ${T.gold})`,
                  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                }}>OpenClaw Ecosystem</h1>
                <p style={{ fontSize: 12, color: T.textMut, margin: "3px 0 0", letterSpacing: ".02em" }}>
                  Live dashboard · Auto-refreshes every 5 min · Formerly Clawdbot / Moltbot
                </p>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              {d.fetchedAt && <span style={{ fontSize: 11, color: T.textMut }}>Updated {timeAgo(d.fetchedAt)}</span>}
              <button onClick={load} disabled={loading} style={{
                padding: "7px 16px", borderRadius: 8, border: `1px solid ${T.border}`,
                background: T.card, color: T.textSec, fontSize: 12, fontWeight: 500,
                cursor: "pointer", fontFamily: T.font, opacity: loading ? .5 : 1,
                transition: "all .15s",
              }}>
                {loading ? "↻ Loading…" : "↻ Refresh"}
              </button>
              <div style={{
                width: 8, height: 8, borderRadius: "50%",
                background: loading ? T.gold : T.teal,
                boxShadow: `0 0 10px ${loading ? T.gold : T.teal}60`,
                animation: loading ? "pulse 1.2s infinite" : "none",
              }} />
            </div>
          </div>

          {/* Platform badges */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 16 }}>
            {["WhatsApp 💬", "Telegram ✈️", "Discord 🎮", "Slack 💼", "Signal 🔒", "iMessage 🍎", "Teams 🏢", "Matrix 🔗", "WebChat 🌐"].map((ch) => (
              <span key={ch} style={{
                display: "inline-flex", alignItems: "center", gap: 4,
                padding: "4px 10px", borderRadius: 20,
                background: T.surface, border: `1px solid ${T.border}`,
                fontSize: 11, color: T.textSec, fontWeight: 500,
              }}>{ch}</span>
            ))}
          </div>
        </header>

        {err && !d.stars && (
          <div style={{
            padding: "12px 16px", borderRadius: 10, marginBottom: 24,
            background: "#ef444415", border: "1px solid #ef444430",
            color: "#ef4444", fontSize: 13,
          }}>
            Could not load data. This might be a GitHub rate limit — it auto-retries in 5 min.
          </div>
        )}

        {/* ── GITHUB STATS ── */}
        <Section title="GitHub" icon="⚡" delay={100}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
            <Stat label="Stars" value={d.stars} icon="⭐" color={T.gold} delay={150} loading={loading && !d.stars} sub="All-time stargazers" />
            <Stat label="Forks" value={d.forks} icon="🍴" color={T.blue} delay={200} loading={loading && !d.forks} sub="Repository forks" />
            <Stat label="Open Issues + PRs" value={d.openIssues} icon="📋" color={T.orange} delay={250} loading={loading && !d.openIssues} sub="Combined count" />
            <Stat label="Watchers" value={d.watchers} icon="👁️" color={T.teal} delay={300} loading={loading && !d.watchers} sub="Subscribed to updates" />
          </div>
        </Section>

        {/* ── NPM DOWNLOADS ── */}
        <Section title="npm Downloads" icon="📦" delay={350}>
          <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 12 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <Stat label="Last 30 Days" value={d.npmDownloadsMonth} icon="📥" color={T.teal} delay={400} loading={loading && !d.npmDownloadsMonth} />
              <Stat label="Last 7 Days" value={d.npmDownloadsWeek} icon="📈" color={T.blue} delay={450} loading={loading && !d.npmDownloadsWeek} />
            </div>
            <ChartCard title="Weekly Downloads" subtitle="Last 30 days">
              {d.npmChart?.length > 0 ? (
                <ResponsiveContainer>
                  <BarChart data={d.npmChart} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                    <defs>
                      <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={T.teal} stopOpacity={.9} />
                        <stop offset="100%" stopColor={T.teal} stopOpacity={.3} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: T.textMut, fontFamily: T.mono }} axisLine={false} tickLine={false} tickFormatter={shortDate} />
                    <YAxis tick={{ fontSize: 10, fill: T.textMut, fontFamily: T.mono }} axisLine={false} tickLine={false} tickFormatter={fmt} />
                    <Tooltip {...tooltipStyle} formatter={(v) => [fmt(v) + " downloads", ""]} labelFormatter={shortDate} />
                    <Bar dataKey="downloads" radius={[5, 5, 0, 0]} maxBarSize={48}>
                      {d.npmChart.map((_, i) => (
                        <Cell key={i} fill={i === d.npmChart.length - 1 ? T.teal : `${T.teal}50`} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <Empty loading={loading} />
              )}
            </ChartCard>
          </div>
        </Section>

        {/* ── COMMIT ACTIVITY + RELEASES ── */}
        <Section title="Development" icon="🔧" delay={500}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <ChartCard title="Commit Activity" subtitle="Recent days">
              {d.commitChart?.length > 0 ? (
                <ResponsiveContainer>
                  <AreaChart data={d.commitChart} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                    <defs>
                      <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={T.red} stopOpacity={.3} />
                        <stop offset="100%" stopColor={T.red} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: T.textMut, fontFamily: T.mono }} axisLine={false} tickLine={false} tickFormatter={shortDate} />
                    <YAxis tick={{ fontSize: 10, fill: T.textMut, fontFamily: T.mono }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip {...tooltipStyle} formatter={(v) => [v + " commits", ""]} labelFormatter={shortDate} />
                    <Area type="monotone" dataKey="count" stroke={T.red} strokeWidth={2} fill="url(#areaGrad)" dot={{ r: 3, fill: T.red, stroke: T.card, strokeWidth: 2 }} activeDot={{ r: 5 }} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <Empty loading={loading} />
              )}
            </ChartCard>

            {/* Releases list */}
            <div style={{
              background: T.card, border: `1px solid ${T.border}`, borderRadius: 14,
              padding: "18px 20px",
            }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: T.textSec, textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 14, fontFamily: T.font }}>
                Recent Releases
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                {(d.recentReleases || []).slice(0, 6).map((r, i) => (
                  <a key={i} href={r.url} target="_blank" rel="noopener noreferrer" style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "9px 0", borderBottom: `1px solid ${T.border}`, textDecoration: "none",
                    transition: "opacity .15s",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{
                        width: 7, height: 7, borderRadius: "50%", flexShrink: 0,
                        background: i === 0 ? T.red : T.textMut,
                        boxShadow: i === 0 ? `0 0 8px ${T.red}60` : "none",
                      }} />
                      <span style={{
                        fontSize: 13, fontFamily: T.mono, fontWeight: i === 0 ? 600 : 400,
                        color: i === 0 ? T.text : T.textSec,
                      }}>
                        {r.tag}
                      </span>
                      {i === 0 && <span style={{
                        fontSize: 9, padding: "2px 7px", borderRadius: 4,
                        background: `${T.red}18`, color: T.red, fontWeight: 700,
                        textTransform: "uppercase", letterSpacing: ".06em",
                      }}>latest</span>}
                    </div>
                    <span style={{ fontSize: 11, color: T.textMut, fontFamily: T.mono }}>{timeAgo(r.date)}</span>
                  </a>
                ))}
                {(!d.recentReleases || d.recentReleases.length === 0) && <Empty loading={loading} />}
              </div>
            </div>
          </div>
        </Section>

        {/* ── RECENT COMMITS FEED ── */}
        <Section title="Latest Commits" icon="🔄" delay={600}>
          <div style={{
            background: T.card, border: `1px solid ${T.border}`, borderRadius: 14,
            padding: "8px 20px", overflow: "hidden",
          }}>
            {(d.activityFeed || []).map((a, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "flex-start", gap: 12,
                padding: "11px 0", borderBottom: i < (d.activityFeed?.length || 0) - 1 ? `1px solid ${T.border}` : "none",
              }}>
                {/* avatar or dot */}
                {a.avatar ? (
                  <img src={a.avatar} alt="" style={{
                    width: 24, height: 24, borderRadius: "50%", flexShrink: 0, marginTop: 1,
                    border: `1.5px solid ${T.border}`,
                  }} />
                ) : (
                  <div style={{
                    width: 24, height: 24, borderRadius: "50%", flexShrink: 0,
                    background: T.surface, border: `1.5px solid ${T.border}`,
                  }} />
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: 13, color: T.text, lineHeight: 1.4,
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  }}>
                    <span style={{ color: T.blue, fontFamily: T.mono, fontSize: 12, marginRight: 6 }}>{a.sha}</span>
                    {a.message}
                  </div>
                  <div style={{ fontSize: 11, color: T.textMut, marginTop: 2 }}>
                    {a.author} · {timeAgo(a.date)}
                  </div>
                </div>
              </div>
            ))}
            {(!d.activityFeed || d.activityFeed.length === 0) && <Empty loading={loading} />}
          </div>
        </Section>

        {/* ── TOP CONTRIBUTORS ── */}
        <Section title="Top Contributors" icon="👥" delay={700}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {(d.topContributors || []).map((c, i) => (
              <a key={c.login} href={c.url} target="_blank" rel="noopener noreferrer" style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "9px 14px", borderRadius: 10,
                background: T.card, border: `1px solid ${T.border}`,
                textDecoration: "none", transition: "border-color .15s, transform .15s",
                animation: `fadeUp .4s ease ${750 + i * 50}ms both`,
              }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = T.red + "40"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.transform = "translateY(0)"; }}
              >
                <img src={c.avatar} alt={c.login} style={{
                  width: 28, height: 28, borderRadius: "50%",
                  border: `2px solid ${i === 0 ? T.red : T.border}`,
                }} />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: T.text }}>{c.login}</div>
                  <div style={{ fontSize: 11, color: T.textMut, fontFamily: T.mono }}>{c.contributions} commits</div>
                </div>
                {i === 0 && <span style={{ fontSize: 14, marginLeft: 2 }}>👑</span>}
              </a>
            ))}
            {(!d.topContributors || d.topContributors.length === 0) && !loading && (
              <span style={{ color: T.textMut, fontSize: 13 }}>No contributor data</span>
            )}
          </div>
        </Section>

        {/* ── ECOSYSTEM ── */}
        <Section title="Ecosystem" icon="🌐" delay={900}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
            <EcoCard icon="🧩" title="ClawHub Skills" value="5,700+" sub="Community skill registry" color={T.orange} link="https://clawhub.com" delay={950} />
            <EcoCard icon="🤖" title="Moltbook Agents" value="1.5M+" sub="AI agent social network" color={T.blue} link="https://moltbook.com" delay={1000} />
            <EcoCard icon="📂" title="Skills Repo" value={d.skillsStars ? fmt(d.skillsStars) + " ⭐" : "—"} sub="openclaw/skills on GitHub" color={T.purple} link="https://github.com/openclaw/skills" delay={1050} />
            <EcoCard icon="📡" title="Channels" value="12+" sub="Messaging platforms supported" color={T.gold} delay={1100} />
          </div>
        </Section>

        {/* ── FOOTER ── */}
        <footer style={{
          background: T.card, border: `1px solid ${T.border}`, borderRadius: 14,
          padding: "16px 24px",
          display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 14,
          animation: "fadeUp .5s ease 1100ms both",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 12, color: T.textMut }}>
            <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#3178c6", display: "inline-block" }} />
              TypeScript
            </span>
            <span>MIT License</span>
            <span>By Peter Steinberger</span>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {[
              ["GitHub", "https://github.com/openclaw/openclaw"],
              ["Website", "https://openclaw.ai"],
              ["Docs", "https://docs.openclaw.ai"],
              ["Moltbook", "https://moltbook.com"],
              ["npm", "https://npmjs.com/package/openclaw"],
            ].map(([label, url]) => (
              <a key={label} href={url} target="_blank" rel="noopener noreferrer" style={{
                padding: "6px 12px", borderRadius: 7, fontSize: 11, fontWeight: 500,
                border: `1px solid ${T.border}`, color: T.textSec,
                textDecoration: "none", fontFamily: T.font,
                transition: "border-color .15s",
              }}>{label}</a>
            ))}
          </div>
        </footer>
      </div>

      {/* ── GLOBAL STYLES ── */}
      <style>{`
        *, *::before, *::after { box-sizing: border-box; }
        body { margin: 0; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%      { opacity: .4; transform: scale(.85); }
        }

        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: ${T.bg}; }
        ::-webkit-scrollbar-thumb { background: ${T.border}; border-radius: 3px; }

        /* Responsive overrides */
        @media (max-width: 768px) {
          div[style*="grid-template-columns: 280px 1fr"],
          div[style*="grid-template-columns: 1fr 1fr"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}

/* ── Empty state ── */
function Empty({ loading }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "center",
      height: "100%", color: T.textMut, fontSize: 13,
    }}>
      {loading ? "Loading…" : "No data available"}
    </div>
  );
}
