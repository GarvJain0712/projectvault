import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FiChevronLeft, FiChevronRight, FiX } from 'react-icons/fi';

/** Thumbnail grid with a lightbox. Arrow keys navigate, Escape closes. */
export default function ImageGallery({ images = [], title = 'Project images' }) {
  const [activeIndex, setActiveIndex] = useState(null);

  if (images.length === 0) return null;

  const close = () => setActiveIndex(null);
  const step = (delta) =>
    setActiveIndex((current) => (current + delta + images.length) % images.length);

  return (
    <section className="card p-5">
      <h2 className="mb-4 text-[15px] font-semibold text-ink">{title}</h2>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {images.map((image, index) => (
          <motion.button
            key={image.id || index}
            type="button"
            onClick={() => setActiveIndex(index)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="aspect-video overflow-hidden rounded-xl border border-line"
          >
            <img
              src={image.url || image}
              alt={image.caption || `Screenshot ${index + 1}`}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
            />
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {activeIndex !== null ? (
          <motion.div
            className="fixed inset-0 z-[120] flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
            onKeyDown={(event) => {
              if (event.key === 'ArrowRight') step(1);
              if (event.key === 'ArrowLeft') step(-1);
            }}
            role="dialog"
            aria-modal="true"
            tabIndex={-1}
            ref={(node) => node?.focus()}
          >
            <button
              type="button"
              onClick={close}
              aria-label="Close image viewer"
              className="absolute right-4 top-4 rounded-lg p-2.5 text-white/80 transition hover:bg-white/10 hover:text-white"
            >
              <FiX className="text-xl" />
            </button>

            {images.length > 1 ? (
              <>
                <button
                  type="button"
                  aria-label="Previous image"
                  onClick={(event) => {
                    event.stopPropagation();
                    step(-1);
                  }}
                  className="absolute left-4 rounded-full bg-white/10 p-3 text-white transition hover:bg-white/20"
                >
                  <FiChevronLeft className="text-xl" />
                </button>
                <button
                  type="button"
                  aria-label="Next image"
                  onClick={(event) => {
                    event.stopPropagation();
                    step(1);
                  }}
                  className="absolute right-4 rounded-full bg-white/10 p-3 text-white transition hover:bg-white/20"
                >
                  <FiChevronRight className="text-xl" />
                </button>
              </>
            ) : null}

            <motion.img
              key={activeIndex}
              src={images[activeIndex].url || images[activeIndex]}
              alt={images[activeIndex].caption || `Screenshot ${activeIndex + 1}`}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.22 }}
              onClick={(event) => event.stopPropagation()}
              className="max-h-[85vh] max-w-[90vw] rounded-xl object-contain shadow-lift"
            />

            <p className="absolute bottom-5 text-xs text-white/70">
              {activeIndex + 1} / {images.length}
            </p>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </section>
  );
}
