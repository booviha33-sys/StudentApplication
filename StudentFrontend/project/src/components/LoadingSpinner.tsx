import { Loader2 } from 'lucide-react';
import './LoadingSpinner.css';

export default function LoadingSpinner({ size = 24, label }: { size?: number; label?: string }) {
  return (
    <div className="loading-spinner">
      <Loader2 size={size} className="spin" />
      {label && <span className="loading-label">{label}</span>}
    </div>
  );
}
