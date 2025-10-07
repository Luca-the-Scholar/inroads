import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { practices } from "@/data/practices";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";

export default function SessionComplete() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const practiceId = searchParams.get("practice");
  const duration = searchParams.get("duration");
  
  const practice = practices.find((p) => p.id === practiceId);
  
  const [steadiness, setSteadiness] = useState([3]);
  const [challenge, setChallenge] = useState([3]);
  const [stayedWith, setStayedWith] = useState<string>("yes");
  const [note, setNote] = useState("");
  
  const handleSave = () => {
    // In a real app, this would save to backend
    navigate("/progress");
  };
  
  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-lg mx-auto px-4 py-6">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">✓</span>
          </div>
          <h1 className="font-serif text-2xl font-bold text-foreground mb-2">
            Nice work
          </h1>
          <p className="text-muted-foreground">
            {duration} minutes of {practice?.title}
          </p>
        </div>
        
        <Card className="p-6 space-y-6">
          <div>
            <label className="text-sm font-medium text-foreground mb-3 block">
              How steady did the practice feel?
            </label>
            <Slider
              value={steadiness}
              onValueChange={setSteadiness}
              min={1}
              max={5}
              step={1}
              className="mb-2"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Scattered</span>
              <span>Steady</span>
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium text-foreground mb-3 block">
              How challenging was it?
            </label>
            <Slider
              value={challenge}
              onValueChange={setChallenge}
              min={1}
              max={5}
              step={1}
              className="mb-2"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Easy</span>
              <span>Difficult</span>
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium text-foreground mb-3 block">
              Stayed with the method?
            </label>
            <div className="flex gap-2">
              {["yes", "mostly", "no"].map((option) => (
                <Button
                  key={option}
                  variant={stayedWith === option ? "default" : "outline"}
                  onClick={() => setStayedWith(option)}
                  className="flex-1 capitalize"
                >
                  {option}
                </Button>
              ))}
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium text-foreground mb-3 block">
              Optional note (140 characters)
            </label>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value.slice(0, 140))}
              placeholder="Any insights or observations..."
              className="resize-none"
              rows={3}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {note.length}/140
            </p>
          </div>
        </Card>
        
        <div className="mt-6 space-y-3">
          <Button onClick={handleSave} className="w-full" size="lg">
            Save Session
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            +1.2 Mastery · Confidence +3
          </p>
        </div>
      </div>
    </div>
  );
}
