import { Trophy } from 'lucide-react';

export default function WinnerBadge() {
  return (
    <div className="absolute top-0 right-0 bg-gradient-to-r from-gold-dark via-gold-light to-gold-dark text-gray-950 px-3 py-1 flex items-center gap-1 text-xs font-extrabold tracking-wide shadow-lg z-10 rounded-bl-lg">
      <Trophy size={14} strokeWidth={2.5} />
      WINNER
    </div>
  );
}
