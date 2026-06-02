import React, { useMemo } from "react";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
  BarChart, Bar, Cell,
} from "recharts";
import { Award, Activity, Flame, Percent } from "lucide-react";
import { format } from "date-fns";
import { lastNDays, KEY, getDay, DOW_FULL } from "../../utils/dates.js";
import { dayCompletion, getStreak, isHabitScheduledOn, isCompletedOn } from "../../utils/streakLogic.js";

function StatCard({ icon, label, value }) {
  return (
    <div className="p-4 rounded-2xl border border-black/[0.08] dark:border-white/[0.08] bg-card-light dark:bg-card-dark">
      <div className="flex items-center gap-2 text-ink-muted text-xs font-medium">{icon}{label}</div>
      <div className="text-2xl font-bold text-ink dark:text-ink-dark mt-1">{value}</div>
    </div>
  );
}

export default function AnalyticsView({ habits }) {
  const active = habits.filter((h) => !h.archived);

  const enoughData = active.length > 0;

  const lineData = useMemo(
    () => lastNDays(30).map((d) => ({ label: format(d, "MMM d"), pct: dayCompletion(habits, d).pct })),
    [habits]
  );

  const dowData = useMemo(() => {
    const sums = Array(7).fill(0), counts = Array(7).fill(0);
    lastNDays(30).forEach((d) => {
      const idx = (getDay(d) + 6) % 7; // Mon-first
      const { pct, total } = dayCompletion(habits, d);
      if (total > 0) { sums[idx] += pct; counts[idx]++; }
    });
    return sums.map((s, i) => ({ day: DOW_FULL[i], pct: counts[i] ? Math.round(s / counts[i]) : 0 }));
  }, [habits]);

  const bestDay = useMemo(() => dowData.reduce((a, b) => (b.pct > a.pct ? b : a), dowData[0] || { day: "—", pct: 0 }), [dowData]);

  const perf = useMemo(() => {
    return active.map((h) => {
      const days = lastNDays(14);
      const scheduled = days.filter((d) => isHabitScheduledOn(h, d));
      const done = scheduled.filter((d) => isCompletedOn(h, d)).length;
      const rate = scheduled.length ? Math.round((done / scheduled.length) * 100) : 0;
      const spark = days.map((d) => (isCompletedOn(h, d) ? 1 : 0));
      return { h, rate, spark };
    }).sort((a, b) => b.rate - a.rate);
  }, [active]);

  const totalCompletions = active.reduce((acc, h) => acc + Object.values(h.completions || {}).filter(Boolean).length, 0);
  const bestEver = active.reduce((m, h) => Math.max(m, getStreak(h)), 0);
  const avgDaily = lineData.length ? Math.round(lineData.reduce((a, b) => a + b.pct, 0) / lineData.length) : 0;

  if (!enoughData) {
    return (
      <div className="grid place-items-center text-center py-20">
        <Activity size={48} className="text-purple-400 mb-3" />
        <p className="text-ink-muted max-w-xs">Check back after 7 days of tracking to see your patterns.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-ink dark:text-ink-dark">Analytics</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={<Award size={14} />} label="Total completions" value={totalCompletions} />
        <StatCard icon={<Activity size={14} />} label="Active habits" value={active.length} />
        <StatCard icon={<Flame size={14} />} label="Best ever streak" value={`${bestEver}d`} />
        <StatCard icon={<Percent size={14} />} label="Avg daily" value={`${avgDaily}%`} />
      </div>

      {/* Line */}
      <div className="p-5 rounded-2xl border border-black/[0.08] dark:border-white/[0.08] bg-card-light dark:bg-card-dark">
        <h3 className="text-sm font-semibold text-ink dark:text-ink-dark mb-4">Last 30 days</h3>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={lineData} margin={{ top: 5, right: 8, left: -22, bottom: 0 }}>
            <defs>
              <linearGradient id="fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#534AB7" stopOpacity={0.25} />
                <stop offset="100%" stopColor="#534AB7" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(127,119,221,0.12)" />
            <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#9CA3AF" }} interval={6} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "#9CA3AF" }} />
            <Tooltip formatter={(v) => [`${v}%`, "Completion"]} contentStyle={{ borderRadius: 12, fontSize: 12, border: "1px solid rgba(0,0,0,0.08)" }} />
            <Area type="monotone" dataKey="pct" stroke="#534AB7" strokeWidth={2.5} fill="url(#fill)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Bar */}
      <div className="p-5 rounded-2xl border border-black/[0.08] dark:border-white/[0.08] bg-card-light dark:bg-card-dark">
        <h3 className="text-sm font-semibold text-ink dark:text-ink-dark mb-1">Best days of the week</h3>
        <p className="text-xs text-ink-muted mb-4">You're most consistent on {bestDay.day}.</p>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={dowData} layout="vertical" margin={{ top: 0, right: 12, left: 8, bottom: 0 }}>
            <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10, fill: "#9CA3AF" }} />
            <YAxis type="category" dataKey="day" tick={{ fontSize: 11, fill: "#6B7280" }} width={36} />
            <Tooltip formatter={(v) => [`${v}%`, "Avg"]} contentStyle={{ borderRadius: 12, fontSize: 12 }} cursor={{ fill: "rgba(127,119,221,0.06)" }} />
            <Bar dataKey="pct" radius={[0, 6, 6, 0]}>
              {dowData.map((d, i) => <Cell key={i} fill="#534AB7" fillOpacity={0.4 + (d.pct / 100) * 0.6} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Performance list */}
      <div className="p-5 rounded-2xl border border-black/[0.08] dark:border-white/[0.08] bg-card-light dark:bg-card-dark">
        <h3 className="text-sm font-semibold text-ink dark:text-ink-dark mb-4">Habit performance</h3>
        <div className="space-y-3">
          {perf.map(({ h, rate, spark }) => (
            <div key={h.id} className="flex items-center gap-3">
              <span className="text-lg">{h.emoji}</span>
              <span className="flex-1 text-sm text-ink dark:text-ink-dark truncate">{h.name}</span>
              <div className="flex items-end gap-0.5 h-6">
                {spark.map((v, i) => <span key={i} className="w-1 rounded-sm" style={{ height: v ? "100%" : "30%", background: v ? "#534AB7" : "rgba(127,119,221,0.2)" }} />)}
              </div>
              <span className="w-10 text-right text-sm font-semibold text-ink dark:text-ink-dark">{rate}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
