import { useRef, useState } from "react";
import { Camera, X, Loader2 } from "lucide-react";
import { photosApi, getPhotoUrl } from "../../api";
import { PhotoLightbox } from "../ui/PhotoLightbox";
import type { MaintenancePhoto } from "../../api/types";

interface Props {
  recordId: number;
  photos: MaintenancePhoto[];
  onChange: (photos: MaintenancePhoto[]) => void;
}

export function PhotoSection({ recordId, photos, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    setUploading(true);
    try {
      const res = await photosApi.upload(recordId, file);
      onChange([...photos, res.data]);
    } catch {
      // silent — user will notice nothing uploaded
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (photo: MaintenancePhoto) => {
    setDeletingId(photo.id);
    try {
      await photosApi.delete(photo.id);
      onChange(photos.filter((p) => p.id !== photo.id));
    } catch {
      // silent
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="field">
      <label className="label">Фото</label>
      <div className="flex flex-wrap gap-2">
        {photos.map((p) => (
          <div key={p.id} className="relative w-16 h-16 shrink-0">
            <img
              src={getPhotoUrl(p.filename)}
              alt=""
              className="w-full h-full object-cover rounded-xl cursor-pointer"
              onClick={() => setLightboxSrc(getPhotoUrl(p.filename))}
            />
            <button
              type="button"
              onClick={() => handleDelete(p)}
              disabled={deletingId === p.id}
              className="absolute -top-1.5 -right-1.5 bg-white border border-gray-200 rounded-full p-0.5 shadow-sm hover:bg-red-50 hover:border-red-200 transition"
            >
              {deletingId === p.id
                ? <Loader2 size={12} className="text-gray-400 animate-spin" />
                : <X size={12} className="text-gray-500" />}
            </button>
          </div>
        ))}

        {photos.length < 5 && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="w-16 h-16 flex flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-gray-200 text-gray-400 hover:border-blue-300 hover:text-blue-500 transition shrink-0"
          >
            {uploading
              ? <Loader2 size={18} className="animate-spin" />
              : <Camera size={18} />}
            {!uploading && <span className="text-[9px] font-medium">Фото</span>}
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileChange}
      />

      {lightboxSrc && <PhotoLightbox src={lightboxSrc} onClose={() => setLightboxSrc(null)} />}
    </div>
  );
}
