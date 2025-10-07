import { PracticeCard } from "@/components/PracticeCard";
import { practices } from "@/data/practices";

export default function Library() {
  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-lg mx-auto px-4 py-6">
        <header className="mb-6">
          <h1 className="font-serif text-3xl font-bold text-foreground mb-2">
            Your Practices
          </h1>
          <p className="text-muted-foreground">
            Select a duration to begin, or tap info to learn more
          </p>
        </header>
        
        <div className="space-y-4">
          {practices.map((practice) => (
            <PracticeCard key={practice.id} practice={practice} />
          ))}
        </div>
      </div>
    </div>
  );
}
