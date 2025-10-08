import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Info } from "lucide-react";
import { Practice } from "@/data/practices";
import { useNavigate } from "react-router-dom";

interface PracticeCardProps {
  practice: Practice;
}

export function PracticeCard({ practice }: PracticeCardProps) {
  const navigate = useNavigate();
  
  const handleStartTimer = (duration: number) => {
    navigate(`/timer?practice=${practice.id}&duration=${duration}`);
  };
  
  const handleInfo = () => {
    navigate(`/practice/${practice.id}`);
  };
  
  return (
    <Card className="p-5 space-y-4 transition-shadow hover:shadow-md">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className="font-serif font-semibold text-lg text-foreground mb-1">
            {practice.title}
          </h3>
          <p className="text-sm text-muted-foreground">{practice.teacher.name}</p>
        </div>
        <button
          onClick={handleInfo}
          className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium"
          aria-label="View practice details"
        >
          Learn More
        </button>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {practice.tags.map((tag) => (
          <Badge key={tag} variant="secondary" className="text-xs">
            {tag}
          </Badge>
        ))}
      </div>
      
      <div className="flex gap-2">
        {practice.durations.map((duration) => (
          <Button
            key={duration}
            variant="outline"
            size="sm"
            onClick={() => handleStartTimer(duration)}
            className="flex-1 text-xs"
          >
            {duration}m
          </Button>
        ))}
      </div>
    </Card>
  );
}
