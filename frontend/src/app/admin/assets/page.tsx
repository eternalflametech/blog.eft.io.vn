// Logic: Administrator digital asset library for media uploads, deduplication view, and URL copying.
// Input: File uploads via input or dropzone, asset listing queries.
// Output: Interactive media asset grid.

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Copy, FileText, Image as ImageIcon, UploadCloud } from 'lucide-react';
import { adminGetAssets, uploadAsset } from '@/lib/api';
import { Asset } from '@/lib/types';
import { formatBytes, formatDate } from '@/lib/utils';

export default function AdminAssetsPage() {
  const router = useRouter();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const loadAssets = async () => {
    try {
      const data = await adminGetAssets();
      setAssets(data);
    } catch {
      router.push('/admin/login');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssets();
  }, []);

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setIsUploading(true);

    try {
      for (let i = 0; i < files.length; i++) {
        const formData = new FormData();
        formData.append('file', files[i]);
        await uploadAsset(formData);
      }
      await loadAssets();
    } catch (err: any) {
      alert(`Lỗi tải lên: ${err.message || err}`);
    } finally {
      setIsUploading(false);
    }
  };

  const copyUrl = (asset: Asset) => {
    const ext = asset.storage_path.split('.').pop() || 'webp';
    const url = `/api/v2/assets/${asset.sha256}.${ext}`;
    navigator.clipboard.writeText(url);
    setCopiedId(asset.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Thư Viện Tài Nguyên</h1>
        <p className="text-xs text-zinc-400 mt-1">
          Quản lý tệp ảnh và tài liệu tải lên. Hệ thống tự động khử trùng lặp SHA-256 và tối ưu sang định dạng WebP.
        </p>
      </div>

      {/* Upload Dropzone */}
      <div className="mb-10 rounded-2xl border-2 border-dashed border-zinc-800 bg-zinc-925/50 p-8 text-center hover:border-violet-500/50 transition-colors">
        <UploadCloud className="mx-auto h-10 w-10 text-violet-400 mb-3" />
        <h3 className="text-sm font-semibold text-white mb-1">
          Kéo thả tệp vào đây hoặc nhấn để chọn từ máy tính
        </h3>
        <p className="text-xs text-zinc-500 mb-4">
          Hỗ trợ: PNG, JPG, JPEG, WebP, SVG, PDF (Dung lượng tối đa 10 MB/tệp)
        </p>
        <label className="inline-flex cursor-pointer items-center justify-center rounded-xl bg-violet-600 px-4 py-2 text-xs font-semibold text-white hover:bg-violet-500 transition-colors shadow-lg shadow-violet-600/20">
          <span>{isUploading ? 'Đang tải lên...' : 'Chọn tệp tải lên'}</span>
          <input
            type="file"
            multiple
            accept="image/*,.pdf"
            disabled={isUploading}
            onChange={(e) => handleFileUpload(e.target.files)}
            className="hidden"
          />
        </label>
      </div>

      {/* Assets Grid */}
      {loading ? (
        <div className="py-20 text-center text-xs font-mono text-zinc-500">
          Đang tải danh mục tài nguyên...
        </div>
      ) : assets.length === 0 ? (
        <div className="rounded-2xl border border-zinc-850 p-12 text-center text-sm text-zinc-400">
          Chưa có tài nguyên nào được tải lên.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {assets.map((asset) => {
            const ext = asset.storage_path.split('.').pop() || 'webp';
            const url = `/api/v2/assets/${asset.sha256}.${ext}`;
            const isImage = asset.mime_type.startsWith('image/');

            return (
              <div
                key={asset.id}
                className="group flex flex-col justify-between rounded-xl border border-zinc-850 bg-zinc-925 p-3 hover:border-violet-500/40 transition-colors"
              >
                <div>
                  <div className="relative mb-3 flex h-36 w-full items-center justify-center overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900">
                    {isImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={url}
                        alt={asset.filename}
                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                      />
                    ) : (
                      <FileText className="h-12 w-12 text-zinc-500" />
                    )}
                  </div>

                  <div className="truncate text-xs font-medium text-white mb-1" title={asset.filename}>
                    {asset.filename}
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500 mb-2">
                    <span>{formatBytes(asset.size_bytes)}</span>
                    <span className="uppercase">{ext}</span>
                  </div>
                </div>

                <div className="border-t border-zinc-850 pt-2 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-zinc-500">
                    {formatDate(asset.created_at)}
                  </span>

                  <button
                    onClick={() => copyUrl(asset)}
                    title="Sao chép đường dẫn cố định"
                    className="flex items-center gap-1 rounded bg-zinc-800 px-2 py-1 text-[11px] font-medium text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors"
                  >
                    {copiedId === asset.id ? (
                      <>
                        <Check className="h-3 w-3 text-emerald-400" />
                        <span className="text-emerald-400">Đã chép</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" />
                        <span>Chép URL</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
