import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  FiCheckCircle,
  FiFilm,
  FiImage,
  FiLink,
  FiSave,
  FiTrash2,
  FiUploadCloud,
} from 'react-icons/fi';
import { CATEGORIES, DIFFICULTIES, STATUSES } from '@/data/constants';
import { createEmptyProject } from '@/services/projectService';
import { storeVideo } from '@/services/videoStore';
import { useProjects } from '@/context/ProjectContext';
import { useToast } from '@/context/ToastContext';
import {
  createId,
  fileToDataUrl,
  formatDuration,
  readVideoDuration,
} from '@/utils/helpers';
import Button from './ui/Button';
import Field from './ui/Field';
import FileDropzone from './FileDropzone';
import ProgressBar from './ui/ProgressBar';
import TagInput from './TagInput';

/** Section wrapper so the long form stays scannable. */
function Section({ title, description, children }) {
  return (
    <section className="card p-5 sm:p-6">
      <header className="mb-5">
        <h2 className="text-[15px] font-semibold text-ink">{title}</h2>
        {description ? <p className="mt-1 text-[13px] text-muted">{description}</p> : null}
      </header>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

/**
 * Shared create/edit form.
 * Pass `initialProject` to edit; leave it out to create a new one.
 */
export default function UploadForm({ initialProject = null }) {
  const isEditing = Boolean(initialProject);
  const navigate = useNavigate();
  const toast = useToast();
  const { addProject, editProject } = useProjects();

  const [form, setForm] = useState(() => initialProject || createEmptyProject());
  const [videoFile, setVideoFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('idle'); // idle | uploading | done
  const [errors, setErrors] = useState({});

  const set = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
    if (errors[key]) setErrors((current) => ({ ...current, [key]: undefined }));
  };

  /* ------------------------------ file handling ---------------------------- */

  const handleVideoFile = async ([file]) => {
    if (!file) return;
    const duration = await readVideoDuration(file);
    setVideoFile(file);
    setForm((current) => ({
      ...current,
      videoName: file.name,
      duration,
      videoUrl: '', // an uploaded file wins over a pasted URL
    }));
  };

  const handleThumbnail = async ([file]) => {
    if (!file) return;
    set('thumbnail', await fileToDataUrl(file));
  };

  const handleImages = async (files) => {
    const encoded = await Promise.all(
      files.map(async (file) => ({
        id: createId('img'),
        url: await fileToDataUrl(file),
        caption: file.name,
      }))
    );
    set('images', [...(form.images || []), ...encoded]);
  };

  /* --------------------------------- submit -------------------------------- */

  const validate = () => {
    const next = {};
    if (!form.title.trim()) next.title = 'A title is required.';
    if (!form.shortDescription.trim()) next.shortDescription = 'Add a one-line description.';
    if (!form.category) next.category = 'Pick a category.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validate()) {
      toast.error('Please fix the highlighted fields.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setStatus('uploading');
    setProgress(0);

    try {
      let payload = { ...form };

      if (videoFile) {
        // storeVideo picks the right destination for the current mode:
        // the API (disk/Cloudinary) when configured, IndexedDB otherwise.
        // In API mode `setProgress` receives real upload progress.
        const stored = await storeVideo(videoFile, form.videoKey, setProgress);
        payload = {
          ...payload,
          videoKey: stored.videoKey,
          videoUrl: stored.videoUrl || payload.videoUrl,
          duration: stored.duration ?? payload.duration,
        };
      } else {
        setProgress(100);
      }

      if (isEditing) {
        await editProject(form.id, payload);
        toast.success('Project updated');
      } else {
        await addProject(payload);
        toast.success('Project added to your vault');
      }

      setStatus('done');
      window.setTimeout(() => navigate(isEditing ? `/project/${form.id}` : '/projects'), 700);
    } catch (error) {
      setStatus('idle');
      setProgress(0);
      toast.error(error?.message || 'Could not save the project. Please try again.');
    }
  };

  /* --------------------------------- render -------------------------------- */

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <Section
        title="Video"
        description="Upload the explanation video, or point to one that already lives online."
      >
        <FileDropzone
          accept="video/*"
          icon={FiFilm}
          label={videoFile || form.videoName ? 'Replace video' : 'Click to browse or drop a video'}
          hint="MP4, WebM or MOV — stored locally in your browser"
          onFiles={handleVideoFile}
        />

        {form.videoName ? (
          <div className="flex items-center gap-3 rounded-xl border border-line bg-surface px-3.5 py-3">
            <FiFilm className="shrink-0 text-accent" aria-hidden />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-medium text-ink">{form.videoName}</p>
              {form.duration ? (
                <p className="text-[11.5px] text-muted">{formatDuration(form.duration)}</p>
              ) : null}
            </div>
            <button
              type="button"
              onClick={() => {
                setVideoFile(null);
                setForm((current) => ({ ...current, videoName: '', videoKey: '', duration: 0 }));
              }}
              aria-label="Remove video"
              className="rounded-lg p-2 text-muted transition hover:bg-rose-500/10 hover:text-rose-500"
            >
              <FiTrash2 />
            </button>
          </div>
        ) : null}

        <Field label="…or paste a video URL" hint="A direct MP4 link, or any URL you can embed.">
          <div className="relative">
            <FiLink className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="url"
              value={form.videoUrl}
              onChange={(event) => set('videoUrl', event.target.value)}
              placeholder="https://…/my-demo.mp4"
              className="input pl-10"
            />
          </div>
        </Field>
      </Section>

      <Section title="Basics" description="How this project shows up across the vault.">
        <Field label="Project title" required error={errors.title} htmlFor="title">
          <input
            id="title"
            type="text"
            value={form.title}
            onChange={(event) => set('title', event.target.value)}
            placeholder="e.g. Smart Home Automation with ESP32"
            className="input"
          />
        </Field>

        <Field
          label="Short description"
          required
          error={errors.shortDescription}
          hint="One line — this is what appears on the card."
          htmlFor="shortDescription"
        >
          <input
            id="shortDescription"
            type="text"
            value={form.shortDescription}
            onChange={(event) => set('shortDescription', event.target.value)}
            placeholder="Control lights and sensors from anywhere over Wi-Fi."
            maxLength={140}
            className="input"
          />
        </Field>

        <Field label="Long description" htmlFor="longDescription">
          <textarea
            id="longDescription"
            value={form.longDescription}
            onChange={(event) => set('longDescription', event.target.value)}
            placeholder="What does the project do, and how does it work?"
            rows={4}
            className="input resize-y"
          />
        </Field>

        <Field label="Project overview" hint="The 'why' behind it — context, motivation, outcome.">
          <textarea
            value={form.overview}
            onChange={(event) => set('overview', event.target.value)}
            rows={3}
            className="input resize-y"
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Category" required error={errors.category}>
            <select
              value={form.category}
              onChange={(event) => set('category', event.target.value)}
              className="input"
            >
              {CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Difficulty">
            <select
              value={form.difficulty}
              onChange={(event) => set('difficulty', event.target.value)}
              className="input"
            >
              {DIFFICULTIES.map((difficulty) => (
                <option key={difficulty} value={difficulty}>
                  {difficulty}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Date">
            <input
              type="date"
              value={form.date}
              onChange={(event) => set('date', event.target.value)}
              className="input"
            />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Completion status">
            <select
              value={form.status}
              onChange={(event) => set('status', event.target.value)}
              className="input"
            >
              {STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </Field>

          <Field label={`Progress — ${form.progress}%`}>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={form.progress}
              onChange={(event) => set('progress', Number(event.target.value))}
              className="mt-3 w-full accent-[rgb(var(--color-accent))]"
            />
          </Field>
        </div>
      </Section>

      <Section title="Details" description="Technologies, tags and the key features you demo.">
        <Field label="Technologies used" hint="Press Enter after each one.">
          <TagInput
            value={form.technologies}
            onChange={(value) => set('technologies', value)}
            placeholder="React, ESP32, MQTT…"
          />
        </Field>

        <Field label="Tags">
          <TagInput
            value={form.tags}
            onChange={(value) => set('tags', value)}
            placeholder="iot, embedded, hackathon…"
          />
        </Field>

        <Field label="Key features">
          <TagInput
            value={form.features}
            onChange={(value) => set('features', value)}
            placeholder="Add a feature and press Enter"
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="GitHub link">
            <input
              type="url"
              value={form.githubUrl}
              onChange={(event) => set('githubUrl', event.target.value)}
              placeholder="https://github.com/you/project"
              className="input"
            />
          </Field>
          <Field label="Live demo link">
            <input
              type="url"
              value={form.demoUrl}
              onChange={(event) => set('demoUrl', event.target.value)}
              placeholder="https://your-demo.app"
              className="input"
            />
          </Field>
        </div>

        <Field label="Project notes" hint="Gotchas, tuning values, things future-you will forget.">
          <textarea
            value={form.notes}
            onChange={(event) => set('notes', event.target.value)}
            rows={3}
            className="input resize-y"
          />
        </Field>
      </Section>

      <Section title="Media" description="A thumbnail and any screenshots worth showing.">
        <Field label="Thumbnail">
          <FileDropzone
            accept="image/*"
            icon={FiImage}
            label="Click to browse or drop an image"
            hint="16:9 works best"
            onFiles={handleThumbnail}
            onClear={() => set('thumbnail', '')}
            preview={
              form.thumbnail ? (
                <img src={form.thumbnail} alt="Thumbnail preview" className="aspect-video w-full object-cover" />
              ) : null
            }
          />
        </Field>

        <Field label="Project images">
          <FileDropzone
            accept="image/*"
            multiple
            icon={FiImage}
            label="Add screenshots"
            hint="You can select several at once"
            onFiles={handleImages}
          />
          {form.images?.length ? (
            <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
              {form.images.map((image) => (
                <div key={image.id} className="group relative overflow-hidden rounded-lg border border-line">
                  <img src={image.url} alt={image.caption} className="aspect-video w-full object-cover" />
                  <button
                    type="button"
                    onClick={() =>
                      set(
                        'images',
                        form.images.filter((entry) => entry.id !== image.id)
                      )
                    }
                    aria-label="Remove image"
                    className="absolute right-1 top-1 rounded-md bg-black/60 p-1 text-white opacity-0 transition group-hover:opacity-100"
                  >
                    <FiTrash2 className="text-xs" />
                  </button>
                </div>
              ))}
            </div>
          ) : null}
        </Field>
      </Section>

      {/* Sticky action bar */}
      <div className="sticky bottom-4 z-10">
        <div className="glass flex flex-wrap items-center gap-2 rounded-2xl px-3 py-3 shadow-lift sm:gap-3 sm:px-4">
          <AnimatePresence mode="wait">
            {status === 'uploading' ? (
              <motion.div
                key="progress"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full sm:flex-1"
              >
                <ProgressBar value={progress} showLabel label="Uploading…" />
              </motion.div>
            ) : status === 'done' ? (
              <motion.p
                key="done"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-1 items-center gap-2 text-[13px] font-medium text-emerald-500"
              >
                <FiCheckCircle /> Saved successfully
              </motion.p>
            ) : (
              <motion.p
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="hidden flex-1 text-[13px] text-muted sm:block"
              >
                {isEditing ? 'Editing an existing project' : 'Everything is stored in your browser'}
              </motion.p>
            )}
          </AnimatePresence>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate(-1)}
            type="button"
            className="ml-auto sm:ml-0"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            size="sm"
            icon={isEditing ? FiSave : FiUploadCloud}
            disabled={status === 'uploading'}
          >
            {isEditing ? 'Save changes' : 'Add to vault'}
          </Button>
        </div>
      </div>
    </form>
  );
}
