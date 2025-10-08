import { useParams, useNavigate } from "react-router-dom";
import { practices } from "@/data/practices";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MasteryRing } from "@/components/MasteryRing";
import { Sparkline } from "@/components/Sparkline";
import { ArrowLeft, Play } from "lucide-react";

export default function PracticeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const practice = practices.find((p) => p.id === id);
  
  if (!practice) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Practice not found</p>
      </div>
    );
  }
  
  const handleStartTimer = (duration: number) => {
    navigate(`/timer?practice=${practice.id}&duration=${duration}`);
  };
  
  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <header className="sticky top-0 bg-card border-b border-border z-10 px-4 py-4">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-3"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm">Back to Library</span>
          </button>
          <h1 className="font-serif text-2xl font-bold text-foreground">
            {practice.title}
          </h1>
        </header>
        
        <div className="px-4 py-6 space-y-6">
          {/* Tabs */}
          <Tabs defaultValue="teacher" className="w-full">
            <TabsList className="w-full grid grid-cols-4">
              <TabsTrigger value="teacher">Teacher</TabsTrigger>
              <TabsTrigger value="scholar">Scholar</TabsTrigger>
              <TabsTrigger value="research">Research</TabsTrigger>
              <TabsTrigger value="guide">Guide</TabsTrigger>
            </TabsList>
            
            <TabsContent value="teacher" className="mt-4">
              <Card className="p-5">
                <p className="text-sm font-semibold text-muted-foreground mb-2">
                  {practice.teacher.name}
                </p>
                <p className="text-foreground leading-relaxed">
                  {practice.teacher.bio}
                </p>
              </Card>
            </TabsContent>
            
            <TabsContent value="scholar" className="mt-4">
              <Card className="p-5">
                <p className="text-sm font-semibold text-muted-foreground mb-2">
                  {practice.scholar.name}
                </p>
                <p className="text-scholar font-serif leading-relaxed">
                  {practice.scholar.context}
                </p>
              </Card>
            </TabsContent>
            
            <TabsContent value="research" className="mt-4">
              <Card className="p-5">
                <h3 className="font-semibold text-foreground mb-3">Related Medical Research</h3>
                <p className="text-foreground leading-relaxed mb-4">
                  {practice.research.summary}
                </p>
                <h4 className="text-sm font-semibold text-muted-foreground mb-2">Key Findings</h4>
                <ul className="space-y-2">
                  {practice.research.findings.map((finding, index) => (
                    <li key={index} className="flex gap-3">
                      <span className="text-primary font-semibold">•</span>
                      <span className="text-foreground text-sm">{finding}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            </TabsContent>
            
            <TabsContent value="guide" className="mt-4">
              <Card className="p-5">
                <h3 className="font-semibold text-foreground mb-3">Steps</h3>
                <ol className="space-y-2">
                  {practice.guide.steps.map((step, index) => (
                    <li key={index} className="flex gap-3">
                      <span className="text-primary font-semibold">{index + 1}.</span>
                      <span className="text-foreground">{step}</span>
                    </li>
                  ))}
                </ol>
              </Card>
            </TabsContent>
          </Tabs>
          
          {/* Timer Panel */}
          <Card className="p-5">
            <h3 className="font-semibold text-foreground mb-3">Start Practice</h3>
            <div className="flex gap-2 mb-3">
              {practice.durations.map((duration) => (
                <Button
                  key={duration}
                  variant="outline"
                  size="sm"
                  onClick={() => handleStartTimer(duration)}
                  className="flex-1"
                >
                  <Play className="w-4 h-4 mr-1" />
                  {duration}m
                </Button>
              ))}
            </div>
            {practice.guide.audioAvailable && (
              <p className="text-xs text-muted-foreground">
                Audio guidance available
              </p>
            )}
          </Card>
          
          {/* Mastery Card */}
          <Card className="p-5">
            <h3 className="font-semibold text-foreground mb-4">Your Mastery</h3>
            <div className="flex items-center gap-6 mb-4">
              <MasteryRing score={practice.mastery.score} />
              <div className="flex-1">
                <p className="text-2xl font-bold text-foreground mb-1">
                  {practice.mastery.level}
                </p>
                <p className="text-sm text-muted-foreground">
                  {practice.mastery.totalMinutes} minutes total
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Confidence: {practice.mastery.confidence}%
                </p>
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-2">Last 30 days</p>
              <Sparkline data={practice.mastery.sparkline} width={280} height={40} />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
