"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { TiptapEditor } from "@/components/blog/TiptapEditor";
import { toast } from "sonner";
import { generateBlogPostSlug, calculateReadingTime } from "@/lib/blog-utils";
import { X, Image as ImageIcon, Loader2, Save, Send, Eye, Plus } from "lucide-react";

interface BlogPostData {
  id?: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage: string | null;
  coverImageAlt: string | null;
  published: boolean;
  publishedAt: string | null;
  tags: { name: string }[];
}

interface BlogFormProps {
  initialData?: BlogPostData;
  isEdit?: boolean;
}

const SUGGESTED_TAGS = [
  "CBC",
  "Grade 7",
  "Grade 8",
  "Grade 9",
  "Exam Tips",
  "Teacher Resources",
  "Education News",
  "PP1",
  "PP2",
  "Junior Secondary",
  "KNEC",
  "Mental Health",
];

export function BlogForm({ initialData, isEdit = false }: BlogFormProps) {
  const router = useRouter();

  // 1. Core Post Form States
  const [postId, setPostId] = useState<string | undefined>(initialData?.id);
  const [title, setTitle] = useState(initialData?.title || "");
  const [slug, setSlug] = useState(initialData ? generateBlogPostSlug(initialData.title) : "");
  const [excerpt, setExcerpt] = useState(initialData?.excerpt || "");
  const [content, setContent] = useState(initialData?.content || "");
  const [coverImage, setCoverImage] = useState<string | null>(initialData?.coverImage || null);
  const [coverImageAlt, setCoverImageAlt] = useState(initialData?.coverImageAlt || "");
  const [tags, setTags] = useState<string[]>(initialData?.tags.map((t) => t.name) || []);
  const [published, setPublished] = useState(initialData?.published || false);
  const [publishedAt, setPublishedAt] = useState<string>(
    initialData?.publishedAt
      ? new Date(initialData.publishedAt).toISOString().substring(0, 16)
      : ""
  );

  // 2. Auxiliary States
  const [tagInput, setTagInput] = useState("");
  const [wordCount, setWordCount] = useState(0);
  const [imageUploading, setImageUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [autosaveStatus, setAutosaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [isDirty, setIsDirty] = useState(false);

  // Refs for tracking current values inside the autosave interval closure
  const formStateRef = useRef({ postId, title, excerpt, content, coverImage, coverImageAlt, tags, published, publishedAt, isDirty });

  // Update refs when state changes
  useEffect(() => {
    formStateRef.current = { postId, title, excerpt, content, coverImage, coverImageAlt, tags, published, publishedAt, isDirty };
  }, [postId, title, excerpt, content, coverImage, coverImageAlt, tags, published, publishedAt, isDirty]);

  // Auto-generate slug when title changes (unless it's an edit and title was unmodified)
  useEffect(() => {
    if (!isEdit || (initialData && title !== initialData.title)) {
      setSlug(generateBlogPostSlug(title));
    }
  }, [title, isEdit, initialData]);

  // Mark form as dirty when inputs change (ignore initial load)
  const isInitialMount = useRef(true);
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      // Calculate initial word count
      const stripped = (initialData?.content || "").replace(/<[^>]*>/g, "");
      const words = stripped.trim().split(/\s+/).filter((w) => w.length > 0).length;
      setWordCount(words);
      return;
    }
    setIsDirty(true);
  }, [title, excerpt, content, coverImage, coverImageAlt, tags, published, publishedAt]);

  // Helper: Save Post core logic
  const savePost = async (publishOverride?: boolean, silent = false) => {
    const current = formStateRef.current;
    
    if (!current.title.trim()) {
      if (!silent) toast.error("Please enter a title");
      return null;
    }

    const isPublishing = publishOverride !== undefined ? publishOverride : current.published;

    const postPayload = {
      title: current.title,
      excerpt: current.excerpt || (current.content ? current.content.replace(/<[^>]*>/g, "").substring(0, 150) + "..." : ""),
      content: current.content,
      coverImage: current.coverImage,
      coverImageAlt: current.coverImageAlt,
      tags: current.tags,
      published: isPublishing,
      publishedAt: isPublishing && current.publishedAt ? new Date(current.publishedAt).toISOString() : (isPublishing ? new Date().toISOString() : null),
    };

    const url = current.postId ? `/api/admin/blog/${current.postId}` : "/api/admin/blog";
    const method = current.postId ? "PUT" : "POST";

    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(postPayload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Save failed");
    }

    const savedPost = await response.json();
    
    // Update IDs and states
    if (!current.postId && savedPost.id) {
      setPostId(savedPost.id);
      // Soft transition the URL to the edit state without reloading
      window.history.replaceState(null, "", `/admin/blog/${savedPost.id}/edit`);
    }
    
    setIsDirty(false);
    return savedPost;
  };

  // 3. Autosave interval (60 seconds)
  useEffect(() => {
    const interval = setInterval(async () => {
      const current = formStateRef.current;
      if (current.isDirty && current.title.trim() && autosaveStatus !== "saving") {
        setAutosaveStatus("saving");
        try {
          await savePost(undefined, true);
          setAutosaveStatus("saved");
          setTimeout(() => setAutosaveStatus("idle"), 3000);
        } catch (err) {
          console.error("Autosave error:", err);
          setAutosaveStatus("error");
          setTimeout(() => setAutosaveStatus("idle"), 5000);
        }
      }
    }, 60000); // 60 seconds

    return () => clearInterval(interval);
  }, [autosaveStatus]);

  // Save manual handler
  const handleSave = async (e: React.FormEvent, publishOverride?: boolean) => {
    e.preventDefault();
    setIsSaving(true);
    
    const isPublishing = publishOverride !== undefined ? publishOverride : published;
    if (publishOverride !== undefined) {
      setPublished(publishOverride);
    }

    try {
      const saved = await savePost(publishOverride);
      if (saved) {
        toast.success(
          isPublishing
            ? "Blog post published successfully!"
            : "Draft saved successfully."
        );
        router.push("/admin/blog");
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to save blog post");
    } finally {
      setIsSaving(false);
    }
  };

  // Image Upload handler
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be under 5MB");
      return;
    }

    setImageUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload/blog-image", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Upload failed");
      }

      const data = await res.json();
      setCoverImage(data.url);
      toast.success("Cover image uploaded successfully.");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to upload cover image.");
    } finally {
      setImageUploading(false);
    }
  };

  // Tags handers
  const addTag = (tagToAdd: string) => {
    const cleanTag = tagToAdd.trim();
    if (!cleanTag) return;
    if (!tags.includes(cleanTag)) {
      setTags((prev) => [...prev, cleanTag]);
    }
    setTagInput("");
  };

  const removeTag = (tagToRemove: string) => {
    setTags((prev) => prev.filter((t) => t !== tagToRemove));
  };

  // Preview page URL
  const previewUrl = slug ? `/blog/${slug}?preview=true` : "";

  return (
    <form onSubmit={(e) => handleSave(e)} className="space-y-8">
      {/* Title & Actions Row */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 leading-tight">
            {isEdit ? "Edit Blog Post" : "Create New Post"}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Write beautiful educational guides for Kenyan teachers and students.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {postId && slug && (
            <a
              href={previewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 border border-gray-200 text-gray-700 bg-white rounded-xl hover:bg-gray-50 text-sm font-semibold transition-colors"
            >
              <Eye className="w-4 h-4" />
              Preview Post
            </a>
          )}
          <button
            type="button"
            onClick={(e) => handleSave(e, false)}
            disabled={isSaving || !title.trim()}
            className="inline-flex items-center gap-2 px-4 py-2.5 border border-[#d1e8dc] text-[#008c43] bg-[#f0faf5] rounded-xl hover:bg-[#e0f2ea] text-sm font-bold transition-colors disabled:opacity-60"
          >
            {isSaving && !published ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Save Draft
          </button>
          <button
            type="button"
            onClick={(e) => handleSave(e, true)}
            disabled={isSaving || !title.trim()}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#008c43] text-white rounded-xl hover:bg-[#006832] text-sm font-bold transition-colors disabled:opacity-60 shadow-sm"
          >
            {isSaving && published ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            Publish Post
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Columns: Editor & Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Post Title & Slug */}
          <div className="bg-white p-5 rounded-2xl border border-[#d1e8dc] space-y-4 shadow-sm">
            <div>
              <label htmlFor="title" className="block text-sm font-bold text-gray-700 mb-1.5">
                Post Title
              </label>
              <input
                id="title"
                type="text"
                required
                placeholder="e.g. 5 Essential CBC Learning Tips for Grade 7 Students"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#008c43] focus:border-transparent transition-shadow bg-gray-50 hover:bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                Slug Preview
              </label>
              <div className="text-xs text-gray-500 font-mono select-all bg-gray-50 p-2.5 rounded-lg border border-gray-100 break-all">
                https://somovibe.com/blog/<span className="text-[#008c43] font-bold">{slug || "..."}</span>
              </div>
            </div>
          </div>

          {/* Editor Area */}
          <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-700">
              Content Body
            </label>
            <TiptapEditor
              value={content}
              onChange={setContent}
              onWordCountChange={setWordCount}
              placeholder="Start drafting your blog content. Support headings, lists, formatting, blockquotes, code, and insert/upload images directly..."
            />
          </div>
        </div>

        {/* Right 1 Column: Metadata & Sidebar Panel */}
        <div className="space-y-6">
          {/* Cover Image Upload */}
          <div className="bg-white p-5 rounded-2xl border border-[#d1e8dc] space-y-4 shadow-sm">
            <h3 className="text-sm font-bold text-gray-700 border-b border-gray-100 pb-2">Cover Image</h3>
            
            {/* Image Preview & Upload Dropzone */}
            {coverImage ? (
              <div className="relative rounded-xl overflow-hidden border border-gray-200 group aspect-[16/9]">
                <img
                  src={coverImage}
                  alt={coverImageAlt || "Cover Preview"}
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => setCoverImage(null)}
                  className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-black/70 hover:bg-black text-white flex items-center justify-center transition-colors"
                  title="Remove Image"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-200 hover:border-[#008c43] bg-gray-50/50 hover:bg-white rounded-xl p-6 text-center cursor-pointer transition-colors relative aspect-[16/9] flex flex-col items-center justify-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  disabled={imageUploading}
                />
                {imageUploading ? (
                  <>
                    <Loader2 className="w-8 h-8 text-[#008c43] animate-spin mb-2" />
                    <p className="text-xs text-gray-500">Uploading cover image...</p>
                  </>
                ) : (
                  <>
                    <ImageIcon className="w-8 h-8 text-gray-400 mb-2" />
                    <p className="text-xs font-bold text-gray-700">Click to upload cover image</p>
                    <p className="text-[10px] text-gray-400 mt-1">PNG, JPG, or WEBP up to 5MB</p>
                  </>
                )}
              </div>
            )}

            {/* Cover Alt Text */}
            <div>
              <label htmlFor="cover-alt" className="block text-xs font-bold text-gray-600 mb-1">
                Image Alt Text (SEO)
              </label>
              <input
                id="cover-alt"
                type="text"
                placeholder="Describe this image for screen readers"
                value={coverImageAlt}
                onChange={(e) => setCoverImageAlt(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 text-xs focus:outline-none focus:ring-1 focus:ring-[#008c43]"
              />
            </div>
          </div>

          {/* Excerpt */}
          <div className="bg-white p-5 rounded-2xl border border-[#d1e8dc] space-y-4 shadow-sm">
            <h3 className="text-sm font-bold text-gray-700 border-b border-gray-100 pb-2">Excerpt</h3>
            <label htmlFor="excerpt" className="block text-xs text-gray-500 leading-relaxed mb-1">
              Short summary shown on blog listing cards (max 160 characters).
            </label>
            <textarea
              id="excerpt"
              rows={3}
              maxLength={160}
              placeholder="Summarize the core takeaways of this article..."
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 text-xs focus:outline-none focus:ring-2 focus:ring-[#008c43] bg-gray-50 hover:bg-white"
            />
            <div className="text-right text-[10px] text-gray-400 font-medium">
              {excerpt.length}/160 characters
            </div>
          </div>

          {/* Tags */}
          <div className="bg-white p-5 rounded-2xl border border-[#d1e8dc] space-y-4 shadow-sm">
            <h3 className="text-sm font-bold text-gray-700 border-b border-gray-100 pb-2">Categories & Tags</h3>
            
            {/* Tags Badges */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#e0f2ea] text-[#004d25] rounded-full text-xs font-bold"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="w-3.5 h-3.5 rounded-full hover:bg-[#b0e2c5] flex items-center justify-center transition-colors"
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Tag Input */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add custom tag..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addTag(tagInput);
                  }
                }}
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#008c43]"
              />
              <button
                type="button"
                onClick={() => addTag(tagInput)}
                className="px-3 bg-gray-100 hover:bg-gray-200 border border-gray-200 text-gray-700 text-xs font-bold rounded-lg transition-colors flex items-center justify-center"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Suggested Tags list */}
            <div>
              <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                Suggested Tags
              </span>
              <div className="flex flex-wrap gap-1">
                {SUGGESTED_TAGS.filter((tag) => !tags.includes(tag)).map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => addTag(tag)}
                    className="px-2 py-1 bg-gray-50 border border-gray-100 rounded-md text-[10px] text-gray-600 hover:bg-[#f0faf5] hover:text-[#008c43] hover:border-[#d1e8dc]"
                  >
                    + {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Publishing Settings & Stats */}
          <div className="bg-white p-5 rounded-2xl border border-[#d1e8dc] space-y-4 shadow-sm text-sm">
            <h3 className="text-sm font-bold text-gray-700 border-b border-gray-100 pb-2">Publish Settings</h3>
            
            {/* Published Toggle */}
            <div className="flex items-center justify-between">
              <label htmlFor="publish-toggle" className="font-semibold text-gray-700 cursor-pointer">
                Publish immediately
              </label>
              <input
                id="publish-toggle"
                type="checkbox"
                checked={published}
                onChange={(e) => setPublished(e.target.checked)}
                className="w-4 h-4 rounded text-[#008c43] focus:ring-[#008c43]"
              />
            </div>

            {/* Scheduled Date */}
            <div className="space-y-1.5">
              <label htmlFor="publish-date" className="block text-xs font-bold text-gray-600">
                Publication Date / Schedule
              </label>
              <input
                id="publish-date"
                type="datetime-local"
                value={publishedAt}
                onChange={(e) => setPublishedAt(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#008c43] bg-gray-50"
              />
              <span className="block text-[10px] text-gray-400">
                Leave empty to publish instantly, or pick a future date for scheduled publication.
              </span>
            </div>

            {/* Reading stats */}
            <div className="pt-3 border-t border-gray-100 text-xs text-gray-500 font-medium space-y-1">
              <div>Word count: {wordCount} words</div>
              <div>Reading time: ~{calculateReadingTime(content)} min read</div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Autosave status bar */}
      <div className="fixed bottom-4 left-4 z-40 bg-gray-900/90 backdrop-blur-sm text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-lg flex items-center gap-2">
        <span className={`w-2 h-2 rounded-full ${
          autosaveStatus === "saving" ? "bg-amber-400 animate-pulse" :
          autosaveStatus === "saved" ? "bg-green-400" :
          autosaveStatus === "error" ? "bg-red-400" : "bg-gray-400"
        }`} />
        <span>
          {autosaveStatus === "saving" ? "Autosaving draft..." :
           autosaveStatus === "saved" ? "Draft autosaved." :
           autosaveStatus === "error" ? "Autosave failed." :
           isDirty ? "Unsaved changes" : "All changes saved"}
        </span>
      </div>
    </form>
  );
}
