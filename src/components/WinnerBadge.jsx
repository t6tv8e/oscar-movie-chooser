import { Trophy } from 'lucide-react';

export default function WinnerBadge() {
  return (
    <div className="absolute -top-2 -right-2 bg-gold text-gray-950 rounded-full px-2 py-1 flex items-center gap-1 text-xs font-bold shadow-lg z-10">
      <Trophy size={12} />
      WINNER
    </div>
  );
}
