import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export function Modal({ open, onClose, title, children }: Props) {
  const [dragY, setDragY] = useState(0);
  const [dragging, setDragging] = useState(false);
  const startYRef = useRef(0);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.width = "100%";
    } else {
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.width = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.width = "";
    };
  }, [open]);

  // Reset drag state when modal opens
  useEffect(() => {
    if (open) setDragY(0);
  }, [open]);

  const handleTouchStart = (e: React.TouchEvent) => {
    startYRef.current = e.touches[0].clientY;
    setDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const delta = e.touches[0].clientY - startYRef.current;
    if (delta > 0) setDragY(delta); // only downward
  };

  const handleTouchEnd = () => {
    setDragging(false);
    if (dragY > 120) {
      onClose();
    }
    setDragY(0);
  };

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        style={{ opacity: dragging ? Math.max(0.2, 0.5 - dragY / 400) : undefined }}
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        className="relative bg-white w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl shadow-2xl flex flex-col"
        style={{
          maxHeight: "calc(100dvh - 48px)",
          transform: `translateY(${dragY}px)`,
          transition: dragging ? "none" : "transform 0.3s cubic-bezier(0.32,0.72,0,1)",
        }}
      >
        {/* Drag handle (mobile) — touch target */}
        <div
          className="flex justify-center pt-3 pb-2 sm:hidden cursor-grab active:cursor-grabbing touch-none"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="w-10 h-1 rounded-full bg-gray-300" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-2 pb-3 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">{title}</h2>
          <button onClick={onClose} className="p-1.5 rounded-xl text-gray-400 hover:bg-gray-100 transition -mr-1">
            <X size={18} />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto overscroll-contain flex-1">
          <div className="px-4 pt-3" style={{ paddingBottom: "calc(2rem + env(safe-area-inset-bottom))" }}>
            {children}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
