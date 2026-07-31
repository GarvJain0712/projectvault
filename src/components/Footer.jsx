import { Link } from 'react-router-dom';
import { FiGithub, FiLinkedin, FiMail } from 'react-icons/fi';
import { PROFILE } from '@/data/profile';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-12 border-t border-line px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-5 sm:flex-row">
        <div className="text-center sm:text-left">
          <p className="text-sm font-semibold text-ink">ProjectVault</p>
          <p className="mt-0.5 text-xs text-muted">
            © {year} {PROFILE.name}. Built with React, Vite and Tailwind CSS.
          </p>
        </div>

        <div className="flex items-center gap-1">
          <Link
            to="/about"
            className="rounded-lg px-3 py-2 text-xs font-medium text-muted transition hover:bg-ink/5 hover:text-ink"
          >
            About
          </Link>
          <Link
            to="/settings"
            className="rounded-lg px-3 py-2 text-xs font-medium text-muted transition hover:bg-ink/5 hover:text-ink"
          >
            Settings
          </Link>
          {[
            { href: PROFILE.github, icon: FiGithub, label: 'GitHub' },
            { href: PROFILE.linkedin, icon: FiLinkedin, label: 'LinkedIn' },
            { href: `mailto:${PROFILE.email}`, icon: FiMail, label: 'Email' },
          ].map(({ href, icon: Icon, label }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              className="rounded-lg p-2 text-muted transition hover:bg-ink/5 hover:text-ink"
            >
              <Icon />
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
