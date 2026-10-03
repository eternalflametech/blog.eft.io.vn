// Logic: Full-featured dual-pane Markdown editor with synchronized live preview, toolbar actions, drag-drop asset uploads, and debounced autosave.
// Input: Initial post data or blank state.
// Output: Interactive authoring interface with save/publish actions.

'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Bold,
  CheckSquare,
  Code,
  Eye,
  Heading1,
  Heading2,
  Heading3,
  Image as ImageIcon,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Quote,
  Save,
  Send,
  Table,
} from 'lucide-react';
import { adminCreatePost, adminUpdatePost, uploadAsset } from '@/lib/api';
import { PostWithDetails } from '@/lib/types';
import { slugifyVietnamese } from '@/lib/utils';
import MarkdownRenderer from '../MarkdownRenderer';

interface MarkdownEditorProps {
  initialPost?: PostWithDetails;
}

export default function MarkdownEditor({ initialPost }: MarkdownEditorProps) {
  const router = useRouter();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  // Form State
  const [title, setTitle] = useState(initialPost?.title || '');
  const [slug, setSlug] = useState(initialPost?.slug || '');
  const [isManualSlug, setIsManualSlug] = useState(!!initialPost?.slug);
  const [content, setContent] = useState(initialPost?.content || '');
  const [excerpt, setExcerpt] = useState(initialPost?.excerpt || '');
  const [coverImage, setCoverImage] = useState(initialPost?.cover_image || '');
  const [tagsInput, setTagsInput] = useState(
    initialPost?.tags?.map((t) => t.name).join(', ') || ''
  );

  // UI state
  const [viewMode, setViewMode] = useState<'split' | 'edit' | 'preview'>('split');
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'dirty'>('saved');
  const [isUploading, setIsUploading] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [postId, setPostId] = useState<string | null>(initialPost?.id || null);

  // Auto-slugify when title changes if manual override is inactive
  useEffect(() => {
    if (!isManualSlug && title) {
      setSlug(slugifyVietnamese(title));
    }
  }, [title, isManualSlug]);

  // Mark state dirty on change
  const handleContentChange = (val: string) => {
    setContent(val);
    setSaveStatus('dirty');
  };

  // Helper to insert markdown formatting at cursor
  const insertText = useCallback((prefix: string, suffix: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selection = textarea.value.substring(start, end);
    const replacement = `${prefix}${selection || 'văn bản'}${suffix}`;

    const newContent =
      textarea.value.substring(0, start) +
      replacement +
      textarea.value.substring(end);

    setContent(newContent);
    setSaveStatus('dirty');

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + prefix.length,
        start + prefix.length + (selection.length || 7)
      );
    }, 0);
  }, []);

  // Upload file helper
  const handleFileUpload = async (file: File) => {
    if (!file) return;
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await uploadAsset(formData);
      insertText(`![${file.name}](${res.url})`);
    } catch (err: any) {
      alert(`Lỗi tải tệp: ${err.message || err}`);
    } finally {
      setIsUploading(false);
    }
  };

  // Drag and Drop & Paste handling for assets
  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith('image/')) {
        const file = items[i].getAsFile();
        if (file) {
          e.preventDefault();
          handleFileUpload(file);
          return;
        }
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  // Synchronized scrolling
  const handleScroll = () => {
    const textarea = textareaRef.current;
    const preview = previewRef.current;
    if (!textarea || !preview) return;

    const percentage =
      textarea.scrollTop / (textarea.scrollHeight - textarea.clientHeight);
    preview.scrollTop = percentage * (preview.scrollHeight - preview.clientHeight);
  };

  // Save draft logic
  const handleSaveDraft = useCallback(async () => {
    if (!title.trim()) {
      alert('Vui lòng nhập tiêu đề bài viết');
      return;
    }

    setSaveStatus('saving');
    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const payload = {
      title,
      slug,
      content,
      excerpt: excerpt || title.slice(0, 150),
      cover_image: coverImage || undefined,
      status: 'draft',
      tags,
    };

    try {
      if (postId) {
        await adminUpdatePost(postId, payload);
      } else {
        const created = await adminCreatePost(payload);
        setPostId(created.id);
      }
      setSaveStatus('saved');
    } catch (err: any) {
      setSaveStatus('dirty');
      alert(`Lỗi lưu nháp: ${err.message || err}`);
    }
  }, [title, slug, content, excerpt, coverImage, tagsInput, postId]);

  // Publish post logic
  const handlePublish = async () => {
    if (!title.trim() || !content.trim()) {
      alert('Tiêu đề và nội dung bài viết không được để trống');
      return;
    }

    if (!confirm('Bạn có chắc chắn muốn xuất bản bài viết này lên trang chủ không?')) {
      return;
    }

    setIsPublishing(true);
    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const payload = {
      title,
      slug,
      content,
      excerpt: excerpt || title.slice(0, 150),
      cover_image: coverImage || undefined,
      status: 'published',
      tags,
    };

    try {
      if (postId) {
        await adminUpdatePost(postId, payload);
      } else {
        await adminCreatePost(payload);
      }
      alert('Bài viết đã được xuất bản thành công!');
      router.push('/admin/posts');
    } catch (err: any) {
      alert(`Lỗi xuất bản: ${err.message || err}`);
    } finally {
      setIsPublishing(false);
    }
  };

  // Keyboard shortcuts (Ctrl+B, Ctrl+I, Ctrl+K, Ctrl+S)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSaveDraft();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault();
        insertText('**', '**');
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'i') {
        e.preventDefault();
        insertText('*', '*');
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        const url = prompt('Nhập đường dẫn liên kết URL:');
        if (url) insertText('[', `](${url})`);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSaveDraft, insertText]);

  // Debounced autosave every 30s when dirty
  useEffect(() => {
    if (saveStatus !== 'dirty') return;
    const timer = setTimeout(() => {
      handleSaveDraft();
    }, 30000);
    return () => clearTimeout(timer);
  }, [saveStatus, handleSaveDraft]);

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] bg-zinc-950 text-zinc-100">
      {/* Frontmatter & Action Bar */}
      <div className="border-b border-zinc-800 bg-zinc-925 p-4 flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <input
            type="text"
            placeholder="Tiêu đề bài viết..."
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              setSaveStatus('dirty');
            }}
            className="flex-1 min-w-[280px] bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2.5 text-lg font-bold text-white focus:outline-none focus:border-violet-500 placeholder-zinc-500"
          />

          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-zinc-400">
              {saveStatus === 'saved' && (
                <span className="text-emerald-400 flex items-center gap-1">● Đã lưu</span>
              )}
              {saveStatus === 'saving' && (
                <span className="text-violet-400 flex items-center gap-1">◌ Đang lưu...</span>
              )}
              {saveStatus === 'dirty' && (
                <span className="text-amber-400 flex items-center gap-1">● Chưa lưu</span>
              )}
            </span>

            <button
              onClick={handleSaveDraft}
              className="flex items-center gap-1.5 rounded-lg border border-zinc-750 bg-zinc-850 px-3.5 py-2 text-xs font-medium text-zinc-200 hover:bg-zinc-800 transition-colors"
            >
              <Save className="h-4 w-4" />
              Lưu nháp
            </button>

            <button
              onClick={handlePublish}
              disabled={isPublishing}
              className="flex items-center gap-1.5 rounded-lg bg-violet-600 px-4 py-2 text-xs font-semibold text-white hover:bg-violet-500 transition-colors disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
              {isPublishing ? 'Đang xuất bản...' : 'Xuất bản'}
            </button>
          </div>
        </div>

        {/* Metadata Fields Collapse/Expand */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div>
            <label className="block text-zinc-400 mb-1 font-mono">Đường dẫn tĩnh (Slug):</label>
            <div className="flex gap-1">
              <input
                type="text"
                value={slug}
                onChange={(e) => {
                  setSlug(e.target.value);
                  setIsManualSlug(true);
                  setSaveStatus('dirty');
                }}
                className="w-full bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1.5 font-mono text-zinc-300 focus:outline-none focus:border-violet-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-zinc-400 mb-1 font-mono">Thẻ phân loại (Tags):</label>
            <input
              type="text"
              placeholder="Robotics, AI, Python (cách nhau bởi dấu phẩy)"
              value={tagsInput}
              onChange={(e) => {
                setTagsInput(e.target.value);
                setSaveStatus('dirty');
              }}
              className="w-full bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1.5 text-zinc-300 focus:outline-none focus:border-violet-500"
            />
          </div>

          <div>
            <label className="block text-zinc-400 mb-1 font-mono">Mô tả tóm tắt (Excerpt):</label>
            <input
              type="text"
              placeholder="Đoạn tóm tắt từ 140 - 160 ký tự cho SEO..."
              value={excerpt}
              onChange={(e) => {
                setExcerpt(e.target.value);
                setSaveStatus('dirty');
              }}
              className="w-full bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1.5 text-zinc-300 focus:outline-none focus:border-violet-500"
            />
          </div>
        </div>
      </div>

      {/* Formatting Toolbar */}
      <div className="border-b border-zinc-800 bg-zinc-900/70 px-4 py-2 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          <button
            onClick={() => insertText('**', '**')}
            title="In đậm (Ctrl+B)"
            className="p-1.5 rounded hover:bg-zinc-800 text-zinc-300 hover:text-white"
          >
            <Bold className="h-4 w-4" />
          </button>
          <button
            onClick={() => insertText('*', '*')}
            title="In nghiêng (Ctrl+I)"
            className="p-1.5 rounded hover:bg-zinc-800 text-zinc-300 hover:text-white"
          >
            <Italic className="h-4 w-4" />
          </button>
          <span className="h-4 w-[1px] bg-zinc-800 mx-1" />
          <button
            onClick={() => insertText('# ')}
            title="Tiêu đề 1"
            className="p-1.5 rounded hover:bg-zinc-800 text-zinc-300 hover:text-white"
          >
            <Heading1 className="h-4 w-4" />
          </button>
          <button
            onClick={() => insertText('## ')}
            title="Tiêu đề 2"
            className="p-1.5 rounded hover:bg-zinc-800 text-zinc-300 hover:text-white"
          >
            <Heading2 className="h-4 w-4" />
          </button>
          <button
            onClick={() => insertText('### ')}
            title="Tiêu đề 3"
            className="p-1.5 rounded hover:bg-zinc-800 text-zinc-300 hover:text-white"
          >
            <Heading3 className="h-4 w-4" />
          </button>
          <span className="h-4 w-[1px] bg-zinc-800 mx-1" />
          <button
            onClick={() => insertText('> ')}
            title="Trích dẫn"
            className="p-1.5 rounded hover:bg-zinc-800 text-zinc-300 hover:text-white"
          >
            <Quote className="h-4 w-4" />
          </button>
          <button
            onClick={() => insertText('```rust\n', '\n```')}
            title="Khối mã nguồn"
            className="p-1.5 rounded hover:bg-zinc-800 text-zinc-300 hover:text-white"
          >
            <Code className="h-4 w-4" />
          </button>
          <button
            onClick={() => insertText('- ')}
            title="Danh sách dấu chấm"
            className="p-1.5 rounded hover:bg-zinc-800 text-zinc-300 hover:text-white"
          >
            <List className="h-4 w-4" />
          </button>
          <button
            onClick={() => insertText('1. ')}
            title="Danh sách số"
            className="p-1.5 rounded hover:bg-zinc-800 text-zinc-300 hover:text-white"
          >
            <ListOrdered className="h-4 w-4" />
          </button>
          <button
            onClick={() => insertText('- [ ] ')}
            title="Danh sách công việc"
            className="p-1.5 rounded hover:bg-zinc-800 text-zinc-300 hover:text-white"
          >
            <CheckSquare className="h-4 w-4" />
          </button>
          <button
            onClick={() =>
              insertText(
                '| Tiêu đề 1 | Tiêu đề 2 |\n| :--- | :--- |\n| Nội dung | Nội dung |\n'
              )
            }
            title="Bảng biểu"
            className="p-1.5 rounded hover:bg-zinc-800 text-zinc-300 hover:text-white"
          >
            <Table className="h-4 w-4" />
          </button>
          <span className="h-4 w-[1px] bg-zinc-800 mx-1" />
          <button
            onClick={() => {
              const url = prompt('Nhập đường dẫn URL:');
              if (url) insertText('[', `](${url})`);
            }}
            title="Chèn liên kết (Ctrl+K)"
            className="p-1.5 rounded hover:bg-zinc-800 text-zinc-300 hover:text-white"
          >
            <LinkIcon className="h-4 w-4" />
          </button>
          <label
            title="Tải ảnh lên thư viện"
            className="p-1.5 rounded hover:bg-zinc-800 text-zinc-300 hover:text-white cursor-pointer"
          >
            <ImageIcon className="h-4 w-4" />
            <input
              type="file"
              accept="image/*,.pdf"
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.[0]) handleFileUpload(e.target.files[0]);
              }}
            />
          </label>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-lg border border-zinc-800 text-xs">
          <button
            onClick={() => setViewMode('edit')}
            className={`px-2.5 py-1 rounded ${
              viewMode === 'edit'
                ? 'bg-violet-600 text-white font-medium'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Soạn thảo
          </button>
          <button
            onClick={() => setViewMode('split')}
            className={`px-2.5 py-1 rounded hidden md:block ${
              viewMode === 'split'
                ? 'bg-violet-600 text-white font-medium'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Song song
          </button>
          <button
            onClick={() => setViewMode('preview')}
            className={`px-2.5 py-1 rounded ${
              viewMode === 'preview'
                ? 'bg-violet-600 text-white font-medium'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Xem trước
          </button>
        </div>
      </div>

      {/* Editor Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Pane: Markdown Textarea */}
        {(viewMode === 'split' || viewMode === 'edit') && (
          <div
            className={`relative h-full flex-1 border-r border-zinc-800 ${
              viewMode === 'split' ? 'w-1/2' : 'w-full'
            }`}
          >
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => handleContentChange(e.target.value)}
              onScroll={handleScroll}
              onPaste={handlePaste}
              onDrop={handleDrop}
              placeholder="Bắt đầu soạn thảo bài viết bằng cú pháp Markdown... (Hỗ trợ kéo thả hoặc dán ảnh trực tiếp)"
              className="w-full h-full bg-zinc-950 p-6 font-mono text-sm leading-relaxed text-zinc-200 focus:outline-none resize-none placeholder-zinc-600"
            />
            {isUploading && (
              <div className="absolute bottom-4 right-4 bg-violet-900/80 border border-violet-500 text-white text-xs px-3 py-1.5 rounded-full flex items-center gap-2">
                <span className="animate-spin">◷</span> Đang tải và tối ưu hóa ảnh...
              </div>
            )}
          </div>
        )}

        {/* Right Pane: Live Rendered Preview */}
        {(viewMode === 'split' || viewMode === 'preview') && (
          <div
            ref={previewRef}
            className={`h-full overflow-y-auto bg-zinc-925 p-8 ${
              viewMode === 'split' ? 'w-1/2' : 'w-full'
            }`}
          >
            <div className="max-w-2xl mx-auto">
              <h1 className="text-3xl font-extrabold text-white mb-4">
                {title || 'Tiêu đề bài viết mẫu'}
              </h1>
              {excerpt && (
                <p className="text-zinc-400 text-base italic border-l-2 border-zinc-700 pl-4 my-4">
                  {excerpt}
                </p>
              )}
              <hr className="border-zinc-800 my-6" />
              <MarkdownRenderer content={content || '*Nội dung xem trước sẽ hiển thị tại đây...*'} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
