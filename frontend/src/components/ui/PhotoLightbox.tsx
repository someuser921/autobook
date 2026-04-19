import { useEffect } from "react";
import { X } from "lucide-react";

interface Props {
  src: string;
  onClose: () => void;
}

export function PhotoLightbox({ src, onClose }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      onClick={onClose}
    >
      <button
        className="absolute top-4 right-4 text-white/80 hover:text-white bg-black/40 rounded-full p-1.5"
        onClick={onClose}
      >
        <X size={20} />
      </button>
      <img
        src={src}
        alt=""
        className="max-w-full max-h-full rounded-lg object-contain"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
}
