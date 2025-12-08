import { Users, Library, Calendar, Timer, Settings } from "lucide-react";

interface BottomNavProps {
  activeView: 'community' | 'library' | 'history' | 'settings' | 'timer';
  onViewChange: (view: 'community' | 'library' | 'history' | 'settings' | 'timer') => void;
}

export function BottomNav({ activeView, onViewChange }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 glass border-t border-border/30 z-50 safe-bottom">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between px-2 py-2 gap-1">
          <button
            onClick={() => onViewChange('community')}
            className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-200 min-w-[56px] touch-target focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
              activeView === 'community'
                ? 'text-primary bg-primary/10'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            }`}
          >
            <Users className="w-5 h-5" />
            <span className="text-[10px] font-medium leading-tight">Community</span>
          </button>

          <button
            onClick={() => onViewChange('library')}
            className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-200 min-w-[56px] touch-target focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
              activeView === 'library'
                ? 'text-primary bg-primary/10'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            }`}
          >
            <Library className="w-5 h-5" />
            <span className="text-[10px] font-medium leading-tight">Library</span>
          </button>

          {/* Emphasized timer button */}
          <button
            onClick={() => onViewChange('timer')}
            className={`flex flex-col items-center gap-1 px-4 py-2.5 rounded-2xl transition-all duration-200 min-w-[64px] touch-target focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
              activeView === 'timer'
                ? 'bg-gradient-to-br from-accent to-accent/80 text-accent-foreground scale-105 shadow-glow-orange-md'
                : 'bg-gradient-to-br from-primary to-primary/80 text-primary-foreground hover:scale-[1.02] shadow-glow-sm hover:shadow-glow-md'
            }`}
          >
            <Timer className="w-6 h-6" />
            <span className="text-[10px] font-bold leading-tight">Timer</span>
          </button>

          <button
            onClick={() => onViewChange('history')}
            className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-200 min-w-[56px] touch-target focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
              activeView === 'history'
                ? 'text-primary bg-primary/10'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            }`}
          >
            <Calendar className="w-5 h-5" />
            <span className="text-[10px] font-medium leading-tight">History</span>
          </button>

          <button
            onClick={() => onViewChange('settings')}
            className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-200 min-w-[56px] touch-target focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
              activeView === 'settings'
                ? 'text-primary bg-primary/10'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            }`}
          >
            <Settings className="w-5 h-5" />
            <span className="text-[10px] font-medium leading-tight">Settings</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
