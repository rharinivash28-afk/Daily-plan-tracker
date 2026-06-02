import React from "react";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip,
  CartesianGrid, BarChart, Bar, Cell,
} from "recharts";
import { Award, Activity, Flame, Percent } from "lucide-react";
import { formatShort } from "../utils/dates.js";
import { DAY_FULL } from "../utils/constants.js";
import MetricCard from "./MetricCard.jsx";

export default function AnalyticsView({ store }) {
  const { analytics } = store;
  const lineData = analytics.last30.map((d) => ({ date: formatShort(d.date), pct: d.pct }));
  const barData = analytics.dowCounts.map((c, i) => ({ day: DAY_FULL[i], count: c }));
  const maxDow = Math.max(1, ...analytics.dowCounts);

  return (
    <div className="space-y-6">
      <h2 className="font-display text-2xl text-ink">Analytics</h2>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Total Completions" icon={<Award size={14} />} value={analytics.totalCompletions} accent="#7F77DD" />
        <MetricCard label="Active Habits" icon={<Activity size={14} />} value={analytics.activeCount} accent="#378ADD" />
        <MetricCard label="Best Streak" icon={<Flame size={14} />} value={`${analytics.bestEver}d`} accent="#D85A30" />
        <MetricCard label="Avg Daily" icon={<Percent size={14} />} value={`${analytics.avgDaily}%`} accent="#1D9E75" />
      </div>

      {/* Line chart */}
      <div className="card-border bg-white/80 backdrop-blur rounded-xl p-5">
        <h3 className="font-display text-lg text-ink mb-4">Daily completion — last 30 days</h3>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={lineData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="lg" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#7F77DD" stopOpacity={0.9} />
                <stop offset="100%" stopColor="#534AB7" stopOpacity={0.9} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(28,26,46,0.06)" />
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: "rgba(28,26,46,0.4)" }} interval={4} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "rgba(28,26,46,0.4)" }} />
            <Tooltip
              contentStyle={{ borderRadius: 8, border: "0.5px solid rgba(28,26,46,0.12)", fontSize: 12 }}
              formatter={(v) => [`${v}%`, "Completion"]}
            />
            <Line type="monotone" dataKey="pct" stroke="url(#lg)" strokeWidth={2.5} dot={false} activeDot={{ r: 5, fill: "#534AB7" }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Bar chart */}
      <div className="card-border bg-white/80 backdrop-blur rounded-xl p-5">
        <h3 className="font-display text-lg text-ink mb-4">Most consistent days</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={barData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(28,26,46,0.06)" vertical={false} />
            <XAxis dataKey="day" tick={{ fontSize: 11, fill: "rgba(28,26,46,0.5)" }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: "rgba(28,26,46,0.4)" }} />
            <Tooltip
              cursor={{ fill: "rgba(127,119,221,0.06)" }}
              contentStyle={{ borderRadius: 8, border: "0.5px solid rgba(28,26,46,0.12)", fontSize: 12 }}
            />
            <Bar dataKey="count" radius={[6, 6, 0, 0]}>
              {barData.map((d, i) => (
                <Cell key={i} fill={d.count === maxDow ? "#534AB7" : "#B0A6E6"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
