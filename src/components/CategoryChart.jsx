import { useMemo } from 'react';
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { FiBarChart2 } from 'react-icons/fi';

const PIE_COLORS = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#f43f5e', '#64748b'];

/** Shared tooltip so both charts look identical. */
function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-line bg-elevated px-3 py-2 text-xs shadow-lift">
      <p className="font-medium text-ink">{label || payload[0].name}</p>
      <p className="mt-0.5 text-muted">
        {payload[0].value} project{payload[0].value === 1 ? '' : 's'}
      </p>
    </div>
  );
}

/**
 * Two small dashboard charts:
 *   - projects per category (bar)
 *   - projects per difficulty (donut)
 */
export default function CategoryChart({ projects }) {
  const byCategory = useMemo(() => {
    const counts = {};
    projects.forEach((project) => {
      counts[project.category] = (counts[project.category] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [projects]);

  const byDifficulty = useMemo(() => {
    const counts = {};
    projects.forEach((project) => {
      counts[project.difficulty] = (counts[project.difficulty] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [projects]);

  if (projects.length === 0) return null;

  return (
    <section className="card p-5">
      <h2 className="mb-5 flex items-center gap-2 text-[15px] font-semibold text-ink">
        <FiBarChart2 className="text-accent" aria-hidden />
        Library Breakdown
      </h2>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted">
            Top categories
          </p>
          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byCategory} margin={{ top: 4, right: 8, left: -22, bottom: 0 }}>
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: 'currentColor' }}
                  className="text-muted"
                  axisLine={false}
                  tickLine={false}
                  interval={0}
                  angle={-18}
                  textAnchor="end"
                  height={52}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 11, fill: 'currentColor' }}
                  className="text-muted"
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgb(99 102 241 / 0.06)' }} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]} fill="rgb(var(--color-accent))" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-2">
          <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted">
            By difficulty
          </p>
          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={byDifficulty}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={44}
                  outerRadius={72}
                  paddingAngle={3}
                  stroke="none"
                >
                  {byDifficulty.map((entry, index) => (
                    <Cell key={entry.name} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 flex flex-wrap justify-center gap-3">
            {byDifficulty.map((entry, index) => (
              <span key={entry.name} className="flex items-center gap-1.5 text-[11px] text-muted">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ background: PIE_COLORS[index % PIE_COLORS.length] }}
                />
                {entry.name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
