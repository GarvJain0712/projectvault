import { motion } from 'framer-motion';
import { FiMoon, FiSun } from 'react-icons/fi';
import { useTheme } from '@/context/ThemeContext';
import Tooltip from './ui/Tooltip';

/** Light/dark switch with a crossfading icon. */
export default function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <Tooltip label={isDark ? 'Switch to light mode' : 'Switch to dark mode'} side="bottom">
      <motion.button
        type="button"
        onClick={toggleTheme}
        whileTap={{ scale: 0.9 }}
        aria-label="Toggle colour theme"
        className="relative flex h-9 w-9 items-center justify-center rounded-lg text-muted transition hover:bg-ink/5 hover:text-ink"
      >
        <motion.span
          key={isDark ? 'moon' : 'sun'}
          initial={{ opacity: 0, rotate: -90, scale: 0.6 }}
          animate={{ opacity: 1, rotate: 0, scale: 1 }}
          transition={{ duration: 0.22 }}
          className="text-[17px]"
        >
          {isDark ? <FiMoon /> : <FiSun />}
        </motion.span>
      </motion.button>
    </Tooltip>
  );
}
