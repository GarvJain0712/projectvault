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

export const ACCENT_COLORS = [
  { name: 'Electric', value: '47 92 255' },
  { name: 'Flare', value: '243 92 62' },
  { name: 'Signal', value: '249 192 15' },
  { name: 'Mint', value: '16 185 129' },
  { name: 'Violet', value: '139 92 246' },
  { name: 'Ink', value: '26 25 23' },
];

/** Tailwind classes for the difficulty pill, keyed by difficulty. */
export const DIFFICULTY_STYLES = {
  Beginner: 'bg-[#10b981] border border-ink text-white font-medium',
  Intermediate: 'bg-[#f9c00f] border border-ink text-ink font-medium',
  Advanced: 'bg-[#f35c3e] border border-ink text-white font-medium',
};

export const STATUS_STYLES = {
  Planned: 'bg-neutral-400 border border-ink text-ink font-medium',
  'In Progress': 'bg-[#2f5cff] border border-ink text-white font-medium',
  Completed: 'bg-[#10b981] border border-ink text-white font-medium',
};

/** localStorage keys — centralised so they never drift apart. */
export const STORAGE_KEYS = {
  projects: 'pv:projects',
  settings: 'pv:settings',
  activity: 'pv:activity',
  profile: 'pv:profile',
};

export const ITEMS_PER_PAGE = 9;
