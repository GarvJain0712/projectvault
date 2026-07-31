import mongoose from 'mongoose';

/**
 * Mirrors createEmptyProject() in the frontend's projectService.js.
 * Keep the two in sync when you add a field.
 */
const commentSchema = new mongoose.Schema(
  {
    id: String,
    author: { type: String, default: 'Anonymous' },
    text: { type: String, required: true },
    at: { type: Date, default: Date.now },
  },
  { _id: false }
);

const imageSchema = new mongoose.Schema(
  { id: String, url: String, caption: String },
  { _id: false }
);

const resourceSchema = new mongoose.Schema(
  { id: String, name: String, url: String, type: String },
  { _id: false }
);

const projectSchema = new mongoose.Schema(
  {
    // We keep the frontend's own string id as the primary key so existing
    // exports import cleanly and URLs stay stable.
    _id: { type: String },

    title: { type: String, required: true, trim: true },
    shortDescription: { type: String, default: '' },
    longDescription: { type: String, default: '' },
    overview: { type: String, default: '' },
    features: { type: [String], default: [] },

    category: { type: String, default: 'Web Development', index: true },
    technologies: { type: [String], default: [], index: true },
    tags: { type: [String], default: [] },
    difficulty: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced'],
      default: 'Beginner',
    },
    status: {
      type: String,
      enum: ['Planned', 'In Progress', 'Completed'],
      default: 'Completed',
    },
    progress: { type: Number, min: 0, max: 100, default: 100 },

    githubUrl: { type: String, default: '' },
    demoUrl: { type: String, default: '' },
    date: { type: String, default: '' },
    notes: { type: String, default: '' },

    thumbnail: { type: String, default: '' },
    images: { type: [imageSchema], default: [] },
    resources: { type: [resourceSchema], default: [] },

    // In API mode the video lives in cloud storage / on disk, so only the URL
    // is stored. videoKey stays for backwards compatibility with local-only data.
    videoKey: { type: String, default: '' },
    videoUrl: { type: String, default: '' },
    videoName: { type: String, default: '' },
    duration: { type: Number, default: 0 },

    favorite: { type: Boolean, default: false },
    watchLater: { type: Boolean, default: false },
    pinned: { type: Boolean, default: false },

    views: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    comments: { type: [commentSchema], default: [] },
  },
  {
    timestamps: true, // adds createdAt / updatedAt automatically
    versionKey: false,
  }
);

// Text index so search can be pushed to the database later if you want.
projectSchema.index({ title: 'text', shortDescription: 'text', longDescription: 'text' });

/** Send `id` to the client instead of Mongo's `_id`. */
projectSchema.set('toJSON', {
  transform: (_doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    return ret;
  },
});

export const Project = mongoose.model('Project', projectSchema);
