import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { BottomNav } from "./components/BottomNav";
import Library from "./pages/Library";
import PracticeDetail from "./pages/PracticeDetail";
import TimerPage from "./pages/TimerPage";
import SessionComplete from "./pages/SessionComplete";
import Progress from "./pages/Progress";
import Settings from "./pages/Settings";
import Onboarding from "./pages/Onboarding";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/" element={<><Library /><BottomNav /></>} />
          <Route path="/practice/:id" element={<><PracticeDetail /><BottomNav /></>} />
          <Route path="/timer" element={<TimerPage />} />
          <Route path="/session-complete" element={<><SessionComplete /><BottomNav /></>} />
          <Route path="/progress" element={<><Progress /><BottomNav /></>} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
