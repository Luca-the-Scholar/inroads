import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { practices } from "@/data/practices";

export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [selectedPractices, setSelectedPractices] = useState<string[]>([]);
  const [reminders, setReminders] = useState(false);
  
  const handlePracticeToggle = (id: string) => {
    setSelectedPractices((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };
  
  const handleFinish = () => {
    // In a real app, save preferences
    navigate("/");
  };
  
  if (step === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="max-w-md text-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">🧘</span>
          </div>
          <h1 className="font-serif text-4xl font-bold text-foreground">
            Contempla
          </h1>
          <p className="text-lg text-muted-foreground">
            Practice with literacy
          </p>
          <p className="text-foreground">
            A minimal meditation app that combines timer, technique library, and mastery tracking—without gamification.
          </p>
          <Button onClick={() => setStep(1)} size="lg" className="mt-8">
            Get Started
          </Button>
        </div>
      </div>
    );
  }
  
  if (step === 1) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="max-w-md text-center space-y-6">
          <h2 className="font-serif text-3xl font-bold text-foreground">
            Your journey begins
          </h2>
          <p className="text-muted-foreground">
            Contempla offers plural meditation techniques, each with teacher and scholar perspectives. Track your mastery over time.
          </p>
          <Button onClick={() => setStep(2)} size="lg">
            Continue
          </Button>
        </div>
      </div>
    );
  }
  
  if (step === 2) {
    return (
      <div className="min-h-screen bg-background px-4 py-8">
        <div className="max-w-lg mx-auto">
          <h2 className="font-serif text-2xl font-bold text-foreground mb-2">
            Choose 1–3 practices to start
          </h2>
          <p className="text-muted-foreground mb-6">
            You can explore all practices later
          </p>
          
          <div className="space-y-3 mb-8">
            {practices.slice(0, 5).map((practice) => (
              <Card
                key={practice.id}
                className={`p-4 cursor-pointer transition-all ${
                  selectedPractices.includes(practice.id)
                    ? "ring-2 ring-primary"
                    : ""
                }`}
                onClick={() => handlePracticeToggle(practice.id)}
              >
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={selectedPractices.includes(practice.id)}
                    onCheckedChange={() => handlePracticeToggle(practice.id)}
                  />
                  <div className="flex-1">
                    <h3 className="font-serif font-semibold text-foreground">
                      {practice.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {practice.tags.join(" · ")}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
          
          <Button
            onClick={() => setStep(3)}
            size="lg"
            className="w-full"
            disabled={selectedPractices.length === 0 || selectedPractices.length > 3}
          >
            Continue ({selectedPractices.length}/3)
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <div className="max-w-md mx-auto space-y-6">
        <h2 className="font-serif text-2xl font-bold text-foreground">
          Almost ready
        </h2>
        
        <Card className="p-5 space-y-4">
          <div className="flex items-start gap-3">
            <Checkbox
              checked={reminders}
              onCheckedChange={(checked) => setReminders(checked === true)}
            />
            <div>
              <p className="font-medium text-foreground">Daily reminder</p>
              <p className="text-sm text-muted-foreground">
                We'll send you a gentle notification to practice
              </p>
            </div>
          </div>
        </Card>
        
        <Card className="p-5 bg-secondary">
          <p className="text-sm text-foreground">
            <strong>Private by default.</strong> Your meditation data stays on your device. No public leaderboards, no social features—just you and your practice.
          </p>
        </Card>
        
        <Button onClick={handleFinish} size="lg" className="w-full">
          Start Practicing
        </Button>
      </div>
    </div>
  );
}
