import { useState, useRef, useEffect } from "react";
import { ChevronDown, X } from "lucide-react";

interface Props {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SearchableSelect({ options, value, onChange, placeholder = "Выберите..." }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = query.trim()
    ? options.filter((o) => o.toLowerCase().includes(query.toLowerCase()))
    : options;

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const select = (option: string) => {
    onChange(option);
    setOpen(false);
    setQuery("");
  };

  const clear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
    setQuery("");
  };

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className="input flex items-center justify-between text-left w-full"
      >
        <span className={value ? "text-gray-900" : "text-gray-400"}>
          {value || placeholder}
        </span>
        <span className="flex items-center gap-1 shrink-0 ml-2">
          {value && (
            <span onClick={clear} className="text-gray-400 hover:text-gray-600 p-0.5">
              <X size={13} />
            </span>
          )}
          <ChevronDown size={14} className={`text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} />
        </span>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
          {/* Search input */}
          <div className="p-2 border-b border-gray-100">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Поиск..."
              className="w-full px-3 py-1.5 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {/* Options list */}
          <div className="max-h-52 overflow-y-auto overscroll-contain">
            {filtered.length === 0 ? (
              <div className="px-3 py-2 text-sm text-gray-400">Ничего не найдено</div>
            ) : (
              filtered.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => select(option)}
                  className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                    option === value
                      ? "bg-blue-50 text-blue-700 font-medium"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {option}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
