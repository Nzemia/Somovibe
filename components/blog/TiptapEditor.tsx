"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import CharacterCount from "@tiptap/extension-character-count";
import Underline from "@tiptap/extension-underline";
import { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  Image as ImageIcon,
  Link2,
  Minus,
  Undo,
  Redo,
  Upload,
} from "lucide-react";

interface TiptapEditorProps {
  value: string;
  onChange: (html: string) => void;
  onWordCountChange?: (count: number) => void;
  placeholder?: string;
}

export function TiptapEditor({
  value,
  onChange,
  onWordCountChange,
  placeholder = "Write your post content here...",
}: TiptapEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Dialog & Form States for Links and Images
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState("");

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // StarterKit has codeBlock, blockquote, bulletList, orderedList, strike, etc.
        codeBlock: {
          HTMLAttributes: {
            class: "bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm overflow-x-auto",
          },
        },
      }),
      Underline,
      Image.configure({
        HTMLAttributes: {
          class: "rounded-xl max-w-full my-6 mx-auto shadow-md block",
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-primary underline font-semibold hover:opacity-85",
          target: "_blank",
          rel: "noopener noreferrer",
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
      CharacterCount,
    ],
    content: value || "",
    editorProps: {
      attributes: {
        class:
          "blog-content ProseMirror focus:outline-none min-h-[400px] max-h-[600px] overflow-y-auto px-5 py-4 border border-gray-200 rounded-b-2xl bg-white text-gray-900",
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html);

      if (onWordCountChange) {
        const words = editor.storage.characterCount.words();
        onWordCountChange(words);
      }
    },
  });

  // Keep editor content in sync with outer state (when loaded or reset)
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || "");
    }
  }, [value, editor]);

  if (!editor) return null;

  const openLinkDialog = () => {
    const previousUrl = editor.getAttributes("link").href || "";
    setLinkUrl(previousUrl);
    setIsLinkDialogOpen(true);
  };

  const handleLinkSave = () => {
    setIsLinkDialogOpen(false);
    
    if (!linkUrl.trim()) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    let formattedUrl = linkUrl.trim();
    if (
      !/^https?:\/\//i.test(formattedUrl) &&
      !/^\//.test(formattedUrl) &&
      !/^mailto:/i.test(formattedUrl) &&
      !/^tel:/i.test(formattedUrl) &&
      !/^#/i.test(formattedUrl)
    ) {
      formattedUrl = `https://${formattedUrl}`;
    }

    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href: formattedUrl, target: "_blank" })
      .run();
  };

  const handleLinkRemove = () => {
    setIsLinkDialogOpen(false);
    editor.chain().focus().extendMarkRange("link").unsetLink().run();
  };

  const openImageDialog = () => {
    setImageUrl("");
    setIsImageDialogOpen(true);
  };

  const handleImageSave = () => {
    setIsImageDialogOpen(false);
    if (imageUrl.trim()) {
      editor.chain().focus().setImage({ src: imageUrl.trim() }).run();
    }
  };

  const triggerImageUpload = () => {
    fileInputRef.current?.click();
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB");
      return;
    }

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

      const { url } = await res.json();
      editor.chain().focus().setImage({ src: url, alt: file.name }).run();
    } catch (err: any) {
      console.error("Editor image upload error:", err);
      toast.error(err.message || "Failed to upload image. Make sure you are logged in.");
    } finally {
      if (e.target) e.target.value = ""; // Reset file input
    }
  };

  const buttonClass = (isActive: boolean) =>
    `p-2 rounded-lg transition-colors ${
      isActive
        ? "bg-[#008c43] text-white"
        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
    }`;

  return (
    <div className="border border-gray-200 rounded-2xl overflow-hidden shadow-sm bg-white">
      {/* Editor Toolbar */}
      <div className="flex flex-wrap items-center gap-1.5 p-2 bg-gray-50 border-b border-gray-200 select-none">
        {/* Formatting */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={buttonClass(editor.isActive("bold"))}
          title="Bold"
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={buttonClass(editor.isActive("italic"))}
          title="Italic"
        >
          <Italic className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={buttonClass(editor.isActive("underline"))}
          title="Underline"
        >
          <UnderlineIcon className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={buttonClass(editor.isActive("strike"))}
          title="Strikethrough"
        >
          <Strikethrough className="w-4 h-4" />
        </button>

        <div className="w-px h-5 bg-gray-300 mx-1" />

        {/* Headings */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={buttonClass(editor.isActive("heading", { level: 1 }))}
          title="Heading 1"
        >
          <Heading1 className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={buttonClass(editor.isActive("heading", { level: 2 }))}
          title="Heading 2"
        >
          <Heading2 className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={buttonClass(editor.isActive("heading", { level: 3 }))}
          title="Heading 3"
        >
          <Heading3 className="w-4 h-4" />
        </button>

        <div className="w-px h-5 bg-gray-300 mx-1" />

        {/* Lists & Quotes */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={buttonClass(editor.isActive("bulletList"))}
          title="Bullet List"
        >
          <List className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={buttonClass(editor.isActive("orderedList"))}
          title="Ordered List"
        >
          <ListOrdered className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={buttonClass(editor.isActive("blockquote"))}
          title="Blockquote"
        >
          <Quote className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={buttonClass(editor.isActive("codeBlock"))}
          title="Code Block"
        >
          <Code className="w-4 h-4" />
        </button>

        <div className="w-px h-5 bg-gray-300 mx-1" />

        {/* Links, Images, HR */}
        <button
          type="button"
          onClick={openLinkDialog}
          className={buttonClass(editor.isActive("link"))}
          title="Hyperlink"
        >
          <Link2 className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={openImageDialog}
          className={buttonClass(false)}
          title="Add Image from URL"
        >
          <ImageIcon className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={triggerImageUpload}
          className={buttonClass(false)}
          title="Upload Cover / Inline Image"
        >
          <Upload className="w-4 h-4" />
        </button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageUpload}
          accept="image/*"
          className="hidden"
        />
        <button
          type="button"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          className={buttonClass(false)}
          title="Horizontal Line"
        >
          <Minus className="w-4 h-4" />
        </button>

        <div className="flex-1" />

        {/* Undo / Redo */}
        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 disabled:opacity-40 transition-colors"
          title="Undo"
        >
          <Undo className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 disabled:opacity-40 transition-colors"
          title="Redo"
        >
          <Redo className="w-4 h-4" />
        </button>
      </div>

      {/* Editor Content Area */}
      <EditorContent editor={editor} />

      {/* Link Dialog */}
      <Dialog open={isLinkDialogOpen} onOpenChange={setIsLinkDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Insert Hyperlink</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col space-y-2 py-4">
            <label htmlFor="link-url-input" className="text-xs font-bold text-gray-500 dark:text-gray-400">
              URL
            </label>
            <Input
              id="link-url-input"
              placeholder="e.g. https://somovibe.com"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              className="focus-visible:ring-[#008c43]"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleLinkSave();
                }
              }}
            />
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            {editor.isActive("link") && (
              <Button
                type="button"
                variant="destructive"
                onClick={handleLinkRemove}
                className="w-full sm:w-auto text-white"
              >
                Remove Link
              </Button>
            )}
            <div className="flex-1" />
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsLinkDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleLinkSave}
              className="bg-[#008c43] hover:bg-[#006832] text-white"
            >
              Apply
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Image URL Dialog */}
      <Dialog open={isImageDialogOpen} onOpenChange={setIsImageDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Image from URL</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col space-y-2 py-4">
            <label htmlFor="image-url-input" className="text-xs font-bold text-gray-500 dark:text-gray-400">
              Image URL
            </label>
            <Input
              id="image-url-input"
              placeholder="e.g. https://example.com/image.jpg"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="focus-visible:ring-[#008c43]"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleImageSave();
                }
              }}
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsImageDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleImageSave}
              className="bg-[#008c43] hover:bg-[#006832] text-white"
            >
              Add Image
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
