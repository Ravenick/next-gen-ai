import { AlertTriangle, X } from 'lucide-react';

interface ApiKeyBannerProps {
  onDismiss: () => void;
}

export function ApiKeyBanner({ onDismiss }: ApiKeyBannerProps) {
  return (
    <div className="relative z-20 px-4 py-2.5 bg-amber-500/10 border-b border-amber-500/20 flex items-center gap-3 fade-in">
      <AlertTriangle size={16} className="text-amber-400 flex-shrink-0" />
      <p className="text-xs text-amber-200/90 flex-1">
        Hugging Face API key not detected. Add{' '}
        <code className="px-1 py-0.5 rounded bg-black/30 text-amber-300 font-mono">
          VITE_HUGGING_FACE_API_KEY
        </code>{' '}
        to your <code className="font-mono">.env</code> file to enable AI
        responses.
      </p>
      <button
        onClick={onDismiss}
        className="text-amber-400/60 hover:text-amber-300 flex-shrink-0"
      >
        <X size={16} />
      </button>
    </div>
  );
}
