import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { practices } from "@/data/practices";
import { Sparkline } from "@/components/Sparkline";
import { TrendingUp, TrendingDown } from "lucide-react";

export default function Progress() {
  // Mock summary data
  const summary = {
    today: 20,
    week: 140,
    month: 520,
  };
  
  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-lg mx-auto px-4 py-6">
        <header className="mb-6">
          <h1 className="font-serif text-3xl font-bold text-foreground mb-2">
            Progress
          </h1>
          <p className="text-muted-foreground">
            Track your meditation journey
          </p>
        </header>
        
        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <Card className="p-4 text-center">
            <p className="text-xs text-muted-foreground mb-1">Today</p>
            <p className="text-2xl font-bold text-foreground">{summary.today}</p>
            <p className="text-xs text-muted-foreground">minutes</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-xs text-muted-foreground mb-1">7 Days</p>
            <p className="text-2xl font-bold text-foreground">{summary.week}</p>
            <p className="text-xs text-muted-foreground">minutes</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-xs text-muted-foreground mb-1">30 Days</p>
            <p className="text-2xl font-bold text-foreground">{summary.month}</p>
            <p className="text-xs text-muted-foreground">minutes</p>
          </Card>
        </div>
        
        {/* Per-Practice Progress */}
        <div className="space-y-3">
          {practices.map((practice) => {
            const trend = practice.mastery.sparkline[practice.mastery.sparkline.length - 1] >
                         practice.mastery.sparkline[practice.mastery.sparkline.length - 5];
            
            return (
              <Card key={practice.id} className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="font-serif font-semibold text-foreground mb-1">
                      {practice.title}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {practice.mastery.totalMinutes} min · Last: {practice.mastery.lastPracticed}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-foreground">
                      {practice.mastery.score}
                    </span>
                    {trend ? (
                      <TrendingUp className="w-4 h-4 text-primary" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                </div>
                <Sparkline 
                  data={practice.mastery.sparkline} 
                  width={280} 
                  height={30} 
                />
              </Card>
            );
          })}
        </div>
        
        <Button variant="outline" className="w-full mt-6">
          Export Data (CSV)
        </Button>
      </div>
    </div>
  );
}
