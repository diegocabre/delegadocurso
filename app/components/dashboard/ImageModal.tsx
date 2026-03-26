import { ExternalLink, X } from "lucide-react";

export default function ImageModal({
  url,
  onClose,
}: {
  url: string;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 bg-slate-900/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative max-w-3xl w-full bg-white rounded-2xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute top-4 right-4 p-2 bg-white/80 rounded-full shadow-md"
          onClick={onClose}
        >
          <X size={24} />
        </button>
        <img
          src={url}
          alt="Comprobante"
          className="w-full max-h-[80vh] object-contain p-2"
        />
        <div className="p-4 bg-slate-50 text-center">
          <a
            href={url}
            target="_blank"
            className="text-xs font-bold text-blue-600 flex items-center justify-center gap-1"
          >
            Abrir original <ExternalLink size={12} />
          </a>
        </div>
      </div>
    </div>
  );
}
