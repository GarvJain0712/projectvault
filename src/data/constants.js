/**
 * Static option lists used across the app.
 * Keeping them in one file means a new category only has to be added once.
 */

export const CATEGORIES = [
  // 'React',
  // 'C++',
  // 'DSA',
  // 'Arduino',
  // 'ESP32',
  // 'IoT',
  // 'Robotics',
  // 'Machine Learning',
  // 'AI',
  // 'Web Development',
  'College Projects'
];

export const DIFFICULTIES = ['Beginner', 'Intermediate', 'Advanced'];

export const STATUSES = ['Planned', 'In Progress', 'Completed'];

export const SORT_OPTIONS = [
  { value: 'latest', label: 'Latest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'alphabetical', label: 'Alphabetical (A–Z)' },
  { value: 'mostViewed', label: 'Most Viewed' },
];

/** Accent colours offered in Settings. Values are raw "R G B" triplets. */
export const ACCENT_COLORS = [
  { name: 'Indigo', value: '99 102 241' },
  { name: 'Violet', value: '139 92 246' },
  { name: 'Blue', value: '59 130 246' },
  { name: 'Emerald', value: '16 185 129' },
  { name: 'Amber', value: '245 158 11' },
  { name: 'Rose', value: '244 63 94' },
  { name: 'Cyan', value: '6 182 212' },
  { name: 'Slate', value: '100 116 139' },
];

/** Tailwind classes for the difficulty pill, keyed by difficulty. */
export const DIFFICULTY_STYLES = {
  Beginner: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  Intermediate: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  Advanced: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
};

export const STATUS_STYLES = {
  Planned: 'bg-slate-500/10 text-slate-600 dark:text-slate-300',
  'In Progress': 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  Completed: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
};

/** localStorage keys — centralised so they never drift apart. */
export const STORAGE_KEYS = {
  projects: 'pv:projects',
  settings: 'pv:settings',
  activity: 'pv:activity',
  profile: 'pv:profile',
};

export const ITEMS_PER_PAGE = 9;
