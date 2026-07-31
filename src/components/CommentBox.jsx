import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FiMessageSquare, FiSend, FiTrash2 } from 'react-icons/fi';
import { useProjects } from '@/context/ProjectContext';
import { useToast } from '@/context/ToastContext';
import { formatRelativeTime, initialsOf } from '@/utils/helpers';
import Button from './ui/Button';

/** Comment list + composer for the project details page. */
export default function CommentBox({ project }) {
  const { addComment, deleteComment } = useProjects();
  const toast = useToast();
  const [author, setAuthor] = useState('');
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const comments = project.comments || [];

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!text.trim()) return;

    setSubmitting(true);
    await addComment(project.id, { author, text });
    setText('');
    setSubmitting(false);
    toast.success('Comment posted');
  };

  return (
    <section className="card p-5">
      <h2 className="mb-4 flex items-center gap-2 text-[15px] font-semibold text-ink">
        <FiMessageSquare className="text-accent" aria-hidden />
        Comments
        <span className="rounded-md bg-ink/5 px-1.5 text-[11px] font-semibold text-muted dark:bg-white/10">
          {comments.length}
        </span>
      </h2>

      <form onSubmit={handleSubmit} className="space-y-2.5">
        <input
          type="text"
          value={author}
          onChange={(event) => setAuthor(event.target.value)}
          placeholder="Your name (optional)"
          aria-label="Your name"
          className="input"
        />
        <textarea
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Share a thought, a question or a suggestion…"
          aria-label="Comment"
          rows={3}
          className="input resize-y"
        />
        <div className="flex justify-end">
          <Button type="submit" size="sm" icon={FiSend} disabled={!text.trim() || submitting}>
            Post comment
          </Button>
        </div>
      </form>

      <div className="mt-6 space-y-1">
        <AnimatePresence initial={false}>
          {comments.map((comment) => (
            <motion.div
              key={comment.id}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0 }}
              className="group flex gap-3 rounded-xl p-2.5 transition-colors hover:bg-ink/[0.03] dark:hover:bg-white/[0.03]"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/10 text-[11px] font-semibold text-accent">
                {initialsOf(comment.author) || 'A'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-2 text-[13px] font-medium text-ink">
                  {comment.author}
                  <span className="text-[11px] font-normal text-muted">
                    {formatRelativeTime(comment.at)}
                  </span>
                </p>
                <p className="mt-0.5 whitespace-pre-wrap break-words text-[13px] leading-relaxed text-muted">
                  {comment.text}
                </p>
              </div>
              <button
                type="button"
                onClick={() => deleteComment(project.id, comment.id)}
                aria-label="Delete comment"
                className="h-7 w-7 shrink-0 rounded-lg text-muted opacity-0 transition hover:bg-rose-500/10 hover:text-rose-500 focus:opacity-100 group-hover:opacity-100"
              >
                <FiTrash2 className="mx-auto" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>

        {comments.length === 0 ? (
          <p className="py-6 text-center text-[13px] text-muted">
            No comments yet — be the first to add one.
          </p>
        ) : null}
      </div>
    </section>
  );
}
