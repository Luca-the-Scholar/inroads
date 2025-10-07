import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Settings() {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-lg mx-auto">
        <header className="sticky top-0 bg-card border-b border-border z-10 px-4 py-4">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-3"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm">Back</span>
          </button>
          <h1 className="font-serif text-2xl font-bold text-foreground">
            Settings
          </h1>
        </header>
        
        <div className="px-4 py-6 space-y-4">
          <Card className="p-4 space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium text-foreground">Bell Type</p>
                <p className="text-sm text-muted-foreground">Choose your meditation bell</p>
              </div>
              <Select defaultValue="singing-bowl">
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="singing-bowl">Singing Bowl</SelectItem>
                  <SelectItem value="bell">Temple Bell</SelectItem>
                  <SelectItem value="gong">Gong</SelectItem>
                  <SelectItem value="chime">Chime</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium text-foreground">Warm-up Duration</p>
                <p className="text-sm text-muted-foreground">Countdown before session</p>
              </div>
              <Select defaultValue="10">
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Off</SelectItem>
                  <SelectItem value="10">10s</SelectItem>
                  <SelectItem value="30">30s</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium text-foreground">Interval Chime</p>
                <p className="text-sm text-muted-foreground">Bell during session</p>
              </div>
              <Select defaultValue="off">
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="off">Off</SelectItem>
                  <SelectItem value="5">5 min</SelectItem>
                  <SelectItem value="10">10 min</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </Card>
          
          <Card className="p-4 space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium text-foreground">Daily Reminder</p>
                <p className="text-sm text-muted-foreground">Notify me to practice</p>
              </div>
              <Switch />
            </div>
            
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium text-foreground">Show Mastery Tracking</p>
                <p className="text-sm text-muted-foreground">Display scores and progress</p>
              </div>
              <Switch defaultChecked />
            </div>
          </Card>
          
          <Card className="p-4 space-y-3">
            <Button variant="outline" className="w-full justify-start">
              Export My Data
            </Button>
            <Button variant="outline" className="w-full justify-start text-destructive">
              Delete All Data
            </Button>
          </Card>
          
          <div className="text-center text-sm text-muted-foreground pt-4">
            <p>Contempla v1.0</p>
            <p className="mt-1">Private by default. No public leaderboards.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
