import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Activity, Heart, Moon, TrendingUp, Footprints, Brain, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export const HealthView = () => {
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [showPermissionDialog, setShowPermissionDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [healthData, setHealthData] = useState<any[]>([]);

  useEffect(() => {
    checkPermissionStatus();
  }, []);

  const checkPermissionStatus = async () => {
    // Check if user has already granted mock permission
    const granted = localStorage.getItem('mock_health_permission') === 'true';
    setPermissionGranted(granted);
    
    if (granted) {
      await loadHealthData();
    }
    setLoading(false);
  };

  const generateMockHealthData = () => {
    const data = [];
    const today = new Date();
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      // Generate correlated data: meditation increases -> stress decreases, mood improves
      const meditationMinutes = Math.floor(Math.random() * 60) + (i < 15 ? 20 : 0);
      const stressLevel = Math.max(1, 5 - Math.floor(meditationMinutes / 15));
      const moodScore = Math.min(5, Math.floor(meditationMinutes / 12) + 2);
      
      data.push({
        date: date.toISOString().split('T')[0],
        meditation_minutes: meditationMinutes,
        heart_rate_avg: 68 + Math.floor(Math.random() * 12),
        heart_rate_resting: 58 + Math.floor(Math.random() * 8),
        sleep_hours: 6.5 + Math.random() * 2,
        steps: 4000 + Math.floor(Math.random() * 6000),
        energy_level: Math.min(5, Math.floor(meditationMinutes / 15) + 2),
        stress_level: stressLevel,
        mood_score: moodScore
      });
    }
    
    return data;
  };

  const loadHealthData = async () => {
    setLoading(true);
    try {
      // Check if we have mock data already
      const { data: existingData } = await supabase
        .from('mock_health_metrics')
        .select('*')
        .order('metric_date', { ascending: true })
        .limit(30);

      if (existingData && existingData.length > 0) {
        const formattedData = existingData.map(d => ({
          date: d.metric_date,
          meditation_minutes: d.mindful_minutes || 0,
          heart_rate_avg: d.heart_rate_avg || 70,
          heart_rate_resting: d.heart_rate_resting || 60,
          sleep_hours: d.sleep_hours || 7,
          steps: d.steps || 5000,
          energy_level: d.energy_level || 3,
          stress_level: d.stress_level || 3,
          mood_score: d.mood_score || 3
        }));
        setHealthData(formattedData);
      } else {
        // Generate and store mock data
        const mockData = generateMockHealthData();
        setHealthData(mockData);
        
        // Store in database
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const dbRecords = mockData.map(d => ({
            user_id: user.id,
            metric_date: d.date,
            heart_rate_avg: d.heart_rate_avg,
            heart_rate_resting: d.heart_rate_resting,
            sleep_hours: d.sleep_hours,
            steps: d.steps,
            mindful_minutes: d.meditation_minutes,
            energy_level: d.energy_level,
            stress_level: d.stress_level,
            mood_score: d.mood_score
          }));
          
          await supabase.from('mock_health_metrics').insert(dbRecords);
        }
      }
    } catch (error) {
      console.error('Error loading health data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGrantPermission = async () => {
    // Simulate permission grant
    localStorage.setItem('mock_health_permission', 'true');
    setPermissionGranted(true);
    setShowPermissionDialog(false);
    
    toast({
      title: "Health Access Granted",
      description: "Mock health data integration is now active. (No real data is accessed)",
    });
    
    await loadHealthData();
  };

  const calculateCorrelation = () => {
    if (healthData.length < 7) return null;
    
    // Simple correlation: more meditation = lower stress, higher mood
    const recentData = healthData.slice(-14);
    const avgMeditation = recentData.reduce((sum, d) => sum + d.meditation_minutes, 0) / recentData.length;
    const avgStress = recentData.reduce((sum, d) => sum + d.stress_level, 0) / recentData.length;
    const avgMood = recentData.reduce((sum, d) => sum + d.mood_score, 0) / recentData.length;
    
    return {
      avgMeditation: Math.round(avgMeditation),
      avgStress: avgStress.toFixed(1),
      avgMood: avgMood.toFixed(1),
      insight: avgMeditation > 20 
        ? "Your meditation practice appears to correlate with improved mood and reduced stress levels."
        : "Consider increasing meditation frequency to potentially improve wellness metrics."
    };
  };

  const correlation = calculateCorrelation();

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6 pb-32">
        <div className="max-w-4xl mx-auto">
          <p className="text-center text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!permissionGranted) {
    return (
      <div className="min-h-screen bg-background p-6 pb-32">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-2 mb-6">
            <Activity className="h-6 w-6" />
            <h1 className="text-2xl font-bold">Health Integration</h1>
          </div>

          <Card className="p-6 text-center space-y-4">
            <div className="flex justify-center">
              <div className="rounded-full bg-primary/10 p-4">
                <Activity className="h-12 w-12 text-primary" />
              </div>
            </div>
            
            <h2 className="text-xl font-semibold">Connect Health Data</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Track correlations between your meditation practice and health metrics like sleep, heart rate, and mood.
            </p>
            
            <Badge variant="outline" className="mt-2">
              <Info className="h-3 w-3 mr-1" />
              Demo Mode - Uses simulated data only
            </Badge>

            <div className="pt-4">
              <Button onClick={() => setShowPermissionDialog(true)} size="lg">
                Enable Health Tracking
              </Button>
            </div>
          </Card>

          <Dialog open={showPermissionDialog} onOpenChange={setShowPermissionDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Health Data Access</DialogTitle>
                <DialogDescription>
                  This is a demonstration of the Health integration UX. No real health data will be accessed.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <p className="text-sm">
                  Contempla would like to access:
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <Heart className="h-4 w-4 text-red-500" />
                    Heart Rate Data
                  </li>
                  <li className="flex items-center gap-2">
                    <Moon className="h-4 w-4 text-blue-500" />
                    Sleep Analysis
                  </li>
                  <li className="flex items-center gap-2">
                    <Footprints className="h-4 w-4 text-green-500" />
                    Activity & Steps
                  </li>
                  <li className="flex items-center gap-2">
                    <Brain className="h-4 w-4 text-purple-500" />
                    Mindfulness Minutes
                  </li>
                </ul>
                
                <p className="text-xs text-muted-foreground pt-2">
                  In a production app, this would request actual Apple Health permissions. 
                  This demo uses generated data to show the UX flow.
                </p>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowPermissionDialog(false)} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={handleGrantPermission} className="flex-1">
                  Allow Access
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6 pb-32">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-6 w-6" />
            <h1 className="text-2xl font-bold">Health Insights</h1>
          </div>
          <Badge variant="outline">
            <Info className="h-3 w-3 mr-1" />
            Demo Data
          </Badge>
        </div>

        {/* Correlation Insights */}
        {correlation && (
          <Card className="p-6 bg-primary/5 border-primary/20">
            <div className="flex items-start gap-3">
              <TrendingUp className="h-5 w-5 text-primary mt-1" />
              <div className="flex-1">
                <h3 className="font-semibold mb-2">Correlation Insight</h3>
                <p className="text-sm text-muted-foreground mb-3">{correlation.insight}</p>
                <div className="grid grid-cols-3 gap-3 text-sm">
                  <div>
                    <div className="text-muted-foreground">Avg Meditation</div>
                    <div className="font-medium">{correlation.avgMeditation} min/day</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Avg Stress</div>
                    <div className="font-medium">{correlation.avgStress}/5</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Avg Mood</div>
                    <div className="font-medium">{correlation.avgMood}/5</div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Meditation vs Stress Chart */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Meditation & Stress Levels</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={healthData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                className="text-xs"
              />
              <YAxis className="text-xs" />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="meditation_minutes" stroke="#2F6FAF" name="Meditation (min)" strokeWidth={2} />
              <Line type="monotone" dataKey="stress_level" stroke="#E78A3A" name="Stress Level" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Mood & Sleep Chart */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Mood & Sleep Quality</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={healthData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                className="text-xs"
              />
              <YAxis className="text-xs" />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="mood_score" stroke="#2F6FAF" name="Mood Score" strokeWidth={2} />
              <Line type="monotone" dataKey="sleep_hours" stroke="#8B5CF6" name="Sleep (hrs)" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Heart className="h-4 w-4 text-red-500" />
              <span className="text-sm text-muted-foreground">Avg Heart Rate</span>
            </div>
            <div className="text-2xl font-bold">
              {Math.round(healthData.reduce((sum, d) => sum + d.heart_rate_avg, 0) / healthData.length)} bpm
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Moon className="h-4 w-4 text-blue-500" />
              <span className="text-sm text-muted-foreground">Avg Sleep</span>
            </div>
            <div className="text-2xl font-bold">
              {(healthData.reduce((sum, d) => sum + d.sleep_hours, 0) / healthData.length).toFixed(1)} hrs
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Footprints className="h-4 w-4 text-green-500" />
              <span className="text-sm text-muted-foreground">Avg Steps</span>
            </div>
            <div className="text-2xl font-bold">
              {Math.round(healthData.reduce((sum, d) => sum + d.steps, 0) / healthData.length).toLocaleString()}
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Brain className="h-4 w-4 text-purple-500" />
              <span className="text-sm text-muted-foreground">Avg Energy</span>
            </div>
            <div className="text-2xl font-bold">
              {(healthData.reduce((sum, d) => sum + d.energy_level, 0) / healthData.length).toFixed(1)}/5
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};