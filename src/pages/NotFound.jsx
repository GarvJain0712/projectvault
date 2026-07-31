import { motion } from 'framer-motion';
import { FiArrowLeft, FiCompass } from 'react-icons/fi';
import Button from '@/components/ui/Button';
import PageTransition from '@/components/ui/PageTransition';

export default function NotFound() {
  return (
    <PageTransition>
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <motion.p
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 18 }}
          className="bg-gradient-to-br from-accent to-accent/40 bg-clip-text text-7xl font-extrabold tracking-tight text-transparent sm:text-8xl"
        >
          404
        </motion.p>

        <h1 className="mt-4 text-xl font-semibold text-ink">This page isn’t in the vault</h1>
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted">
          The link may be broken, or the project it pointed to has been deleted.
        </p>

        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Button to="/" icon={FiArrowLeft} size="sm">
            Back to dashboard
          </Button>
          <Button to="/projects" variant="secondary" icon={FiCompass} size="sm">
            Browse projects
          </Button>
        </div>
      </div>
    </PageTransition>
  );
}
