import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { practices } from "@/data/practices";
import { Button } from "@/components/ui/button";
import { Play, Pause, X } from "lucide-react";

export default function TimerPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const practiceId = searchParams.get("practice");
  const durationParam = searchParams.get("duration");
  
  const practice = practices.find((p) => p.id === practiceId);
  const totalSeconds = durationParam ? parseInt(durationParam) * 60 : 600;
  
  const [secondsLeft, setSecondsLeft] = useState(totalSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const [isWarmup, setIsWarmup] = useState(true);
  const [warmupSeconds, setWarmupSeconds] = useState(10);
  
  useEffect(() => {
    if (!isRunning) return;
    
    const interval = setInterval(() => {
      if (isWarmup) {
        setWarmupSeconds((prev) => {
          if (prev <= 1) {
            setIsWarmup(false);
            return 0;
          }
          return prev - 1;
        });
      } else {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            navigate(`/session-complete?practice=${practiceId}&duration=${durationParam}`);
            return 0;
          }
          return prev - 1;
        });
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [isRunning, isWarmup, practiceId, durationParam, navigate]);
  
  const handleStart = () => {
    setIsRunning(true);
  };
  
  const handlePause = () => {
    setIsRunning(false);
  };
  
  const handleEnd = () => {
    navigate(`/session-complete?practice=${practiceId}&duration=${durationParam}`);
  };
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };
  
  const progress = isWarmup ? 0 : ((totalSeconds - secondsLeft) / totalSeconds) * 100;
  
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="max-w-lg mx-auto w-full flex-1 flex flex-col">
        {/* Header */}
        <header className="px-4 py-4 flex justify-between items-center">
          <div>
            <h2 className="font-serif text-xl font-semibold text-foreground">
              {practice?.title || "Meditation"}
            </h2>
            <p className="text-sm text-muted-foreground">
              {durationParam} minute session
            </p>
          </div>
          <button
            onClick={() => navigate("/")}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </header>
        
        {/* Timer Display */}
        <div className="flex-1 flex flex-col items-center justify-center px-4">
          {isWarmup ? (
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-4">Get ready...</p>
              <div className="text-6xl font-bold text-primary mb-2">
                {warmupSeconds}
              </div>
            </div>
          ) : (
            <>
              {/* Progress Ring */}
              <div className="relative mb-8">
                <svg width="240" height="240" className="transform -rotate-90">
                  <circle
                    cx="120"
                    cy="120"
                    r="110"
                    fill="none"
                    stroke="hsl(var(--muted))"
                    strokeWidth="8"
                  />
                  <circle
                    cx="120"
                    cy="120"
                    r="110"
                    fill="none"
                    stroke="hsl(var(--primary))"
                    strokeWidth="8"
                    strokeDasharray={2 * Math.PI * 110}
                    strokeDashoffset={2 * Math.PI * 110 * (1 - progress / 100)}
                    strokeLinecap="round"
                    className="transition-all duration-1000"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-6xl font-bold text-foreground">
                    {formatTime(secondsLeft)}
                  </span>
                </div>
              </div>
            </>
          )}
          
          {/* Controls */}
          <div className="flex gap-4">
            {!isRunning ? (
              <Button
                size="lg"
                onClick={handleStart}
                className="w-24 h-24 rounded-full"
              >
                <Play className="w-8 h-8" />
              </Button>
            ) : (
              <>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={handlePause}
                  className="w-20 h-20 rounded-full"
                >
                  <Pause className="w-6 h-6" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={handleEnd}
                  className="px-6 h-20 rounded-full"
                >
                  End Session
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
