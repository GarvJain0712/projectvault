import { motion } from 'framer-motion';
import {
  FiAward,
  FiBookOpen,
  FiDownload,
  FiExternalLink,
  FiGithub,
  FiLinkedin,
  FiMail,
  FiMapPin,
} from 'react-icons/fi';
import { PROFILE } from '@/data/profile';
import { useProjects } from '@/context/ProjectContext';
import { formatWatchTime, initialsOf } from '@/utils/helpers';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import PageTransition from '@/components/ui/PageTransition';

export default function About() {
  const { stats } = useProjects();

  const liveHighlights = [
    { label: 'Projects in vault', value: stats.totalProjects },
    { label: 'Explanation videos', value: stats.totalVideos },
    { label: 'Footage recorded', value: formatWatchTime(stats.totalWatchSeconds) },
  ];

  return (
    <PageTransition className="space-y-5">
      {/* Header card */}
      <section className="hero-wash overflow-hidden rounded-2xl border border-line p-6 sm:p-8">
        <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 22 }}
            className="shrink-0"
          >
            {PROFILE.photo ? (
              <img
                src={PROFILE.photo}
                alt={PROFILE.name}
                className="h-24 w-24 rounded-2xl object-cover shadow-lift ring-2 ring-accent/20 sm:h-28 sm:w-28"
              />
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-accent text-3xl font-bold text-accent-ink shadow-lift sm:h-28 sm:w-28">
                {initialsOf(PROFILE.name)}
              </div>
            )}
          </motion.div>

          <div className="min-w-0">
            <h1 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
              {PROFILE.name}
            </h1>
            <p className="mt-1 text-sm font-medium text-accent">{PROFILE.role}</p>
            <p className="mt-1.5 flex items-center gap-1.5 text-[13px] text-muted">
              <FiMapPin aria-hidden /> {PROFILE.location}
            </p>

            <div className="mt-5 flex flex-wrap gap-2.5">
              {PROFILE.resume ? (
                <Button href={PROFILE.resume} icon={FiDownload} size="sm">
                  Download resume
                </Button>
              ) : null}
              <Button href={`mailto:${PROFILE.email}`} variant="secondary" icon={FiMail} size="sm">
                Contact me
              </Button>
              <Button href={PROFILE.github} variant="secondary" icon={FiGithub} size="sm">
                GitHub
              </Button>
              <Button href={PROFILE.linkedin} variant="secondary" icon={FiLinkedin} size="sm">
                LinkedIn
              </Button>
              <Button
                href={PROFILE.portfolio}
                variant="secondary"
                icon={FiExternalLink}
                size="sm"
              >
                Portfolio
              </Button>
            </div>
          </div>
        </div>

        <p className="mt-7 max-w-3xl text-sm leading-relaxed text-muted">{PROFILE.bio}</p>
      </section>

      {/* Live stats from the vault */}
      <div className="grid gap-4 sm:grid-cols-3">
        {liveHighlights.map((item, index) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.06 }}
            className="card p-5"
          >
            <p className="text-2xl font-semibold tracking-tight text-ink tabular-nums">
              {item.value}
            </p>
            <p className="mt-1 text-[13px] text-muted">{item.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* Skills */}
        <section className="card p-5 sm:p-6">
          <h2 className="mb-5 flex items-center gap-2 text-[15px] font-semibold text-ink">
            <FiAward className="text-accent" aria-hidden />
            Skills
          </h2>
          <div className="space-y-5">
            {PROFILE.skills.map((group) => (
              <div key={group.group}>
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">
                  {group.group}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {group.items.map((skill) => (
                    <Badge key={skill} tone="accent">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Education */}
        <section className="card p-5 sm:p-6">
          <h2 className="mb-5 flex items-center gap-2 text-[15px] font-semibold text-ink">
            <FiBookOpen className="text-accent" aria-hidden />
            Education
          </h2>

          <ol className="relative space-y-6 pl-6">
            <span className="absolute bottom-2 left-[5px] top-2 w-px bg-line" aria-hidden />
            {PROFILE.education.map((entry) => (
              <li key={entry.id} className="relative">
                <span
                  className="absolute -left-6 top-1.5 h-2.5 w-2.5 rounded-full bg-accent ring-4 ring-accent/15"
                  aria-hidden
                />
                <p className="text-sm font-semibold text-ink">{entry.degree}</p>
                <p className="mt-0.5 text-[13px] text-accent">{entry.institution}</p>
                <p className="mt-0.5 text-[11.5px] text-muted">{entry.period}</p>
                {entry.detail ? (
                  <p className="mt-1.5 text-[13px] leading-relaxed text-muted">{entry.detail}</p>
                ) : null}
              </li>
            ))}
          </ol>
        </section>
      </div>

      <p className="text-center text-xs text-muted">
        Everything on this page comes from <code className="text-accent">src/data/profile.js</code> —
        edit that one file to make it yours.
      </p>
    </PageTransition>
  );
}
