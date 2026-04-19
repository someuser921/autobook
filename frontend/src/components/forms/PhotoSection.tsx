import { useRef, useState } from "react";
import { Camera, X, Loader2 } from "lucide-react";
import { photosApi, getPhotoUrl } from "../../api";
import { PhotoLightbox } from "../ui/PhotoLightbox";
import type { MaintenancePhoto } from "../../api/types";

interface EditProps {
  recordId: number;
  photos: MaintenancePhoto[];
  onChange: (photos: MaintenancePhoto[]) => void;
  pendingFiles?: never;
  onPendingFilesChange?: never;
}

interface PendingProps {
  recordId?: never;
  photos?: never;
  onChange?: never;
  pendingFiles: File[];
  onPendingFilesChange: (files: File[]) => void;
}

type Props = EditProps | PendingProps;

export function PhotoSection(props: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);

  const isPending = "pendingFiles" in props && props.pendingFiles !== undefined;

  const totalCount = isPending ? props.pendingFiles.length : (props.photos?.length ?? 0);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";

    if (isPending) {
      props.onPendingFilesChange([...props.pendingFiles, file]);
      return;
    }

    setUploading(true);
    try {
      const res = await photosApi.upload(props.recordId, file);
      props.onChange([...props.photos, res.data]);
    } catch {
      // silent
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteExisting = async (photo: MaintenancePhoto) => {
    if (isPending) return;
    setDeletingId(photo.id);
    try {
      await photosApi.delete(photo.id);
      props.onChange(props.photos.filter((p) => p.id !== photo.id));
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

        {/* Edit mode: uploaded photos */}
        {!isPending && props.photos?.map((p) => (
          <div key={p.id} className="relative w-16 h-16 shrink-0">
            <img
              src={getPhotoUrl(p.filename)}
              alt=""
              className="w-full h-full object-cover rounded-xl cursor-pointer"
              onClick={() => setLightboxSrc(getPhotoUrl(p.filename))}
            />
            <button
              type="button"
              onClick={() => handleDeleteExisting(p)}
              disabled={deletingId === p.id}
              className="absolute -top-1.5 -right-1.5 bg-white border border-gray-200 rounded-full p-0.5 shadow-sm hover:bg-red-50 hover:border-red-200 transition"
            >
              {deletingId === p.id
                ? <Loader2 size={12} className="text-gray-400 animate-spin" />
                : <X size={12} className="text-gray-500" />}
            </button>
          </div>
        ))}

        {/* Pending mode: local file previews */}
        {isPending && props.pendingFiles.map((file, i) => (
          <div key={i} className="relative w-16 h-16 shrink-0">
            <img
              src={URL.createObjectURL(file)}
              alt=""
              className="w-full h-full object-cover rounded-xl"
            />
            <button
              type="button"
              onClick={() => props.onPendingFilesChange(props.pendingFiles.filter((_, j) => j !== i))}
              className="absolute -top-1.5 -right-1.5 bg-white border border-gray-200 rounded-full p-0.5 shadow-sm hover:bg-red-50 hover:border-red-200 transition"
            >
              <X size={12} className="text-gray-500" />
            </button>
          </div>
        ))}

        {/* Add button */}
        {totalCount < 5 && (
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
        className="hidden"
        onChange={handleFileChange}
      />

      {lightboxSrc && <PhotoLightbox src={lightboxSrc} onClose={() => setLightboxSrc(null)} />}
    </div>
  );
}
