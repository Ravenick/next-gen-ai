import { Sparkles, Code2, Lightbulb, PenLine, Compass } from 'lucide-react';

const SUGGESTIONS = [
  {
    icon: Sparkles,
    title: 'Explain a concept',
    prompt: 'Explain quantum computing in simple terms with an analogy',
  },
  {
    icon: Code2,
    title: 'Write some code',
    prompt: 'Write a Python function that finds prime numbers using the Sieve of Eratosthenes',
  },
  {
    icon: Lightbulb,
    title: 'Brainstorm ideas',
    prompt: 'Give me 5 creative project ideas for learning React',
  },
  {
    icon: PenLine,
    title: 'Help me write',
    prompt: 'Write a short sci-fi story about an AI that discovers music',
  },
  {
    icon: Compass,
    title: 'Plan something',
    prompt: 'Create a 7-day workout plan for a beginner with no equipment',
  },
];

interface WelcomeScreenProps {
  onSuggestion: (prompt: string) => void;
}

export function WelcomeScreen({ onSuggestion }: WelcomeScreenProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full px-6 fade-in">
      {/* Energy orb */}
      <div className="relative mb-8">
        <div className="w-24 h-24 energy-orb" />
      </div>

      <h1 className="text-4xl md:text-5xl font-bold mb-3 text-center">
        <span className="text-sheen">NEXUS</span>
      </h1>
      <p className="text-slate-400 text-center mb-10 max-w-md">
        Your next-generation AI companion. Ask anything, create anything,
        explore anything.
      </p>

      {/* Suggestion cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-w-3xl w-full">
        {SUGGESTIONS.map((s, i) => {
          const Icon = s.icon;
          return (
            <button
              key={i}
              onClick={() => onSuggestion(s.prompt)}
              className="glass glass-sheen group rounded-xl p-4 text-left
              border border-white/5 hover:border-cyan-500/20
              transition-all hover:scale-[1.02] msg-in"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-cyan-500/10 flex items-center justify-center flex-shrink-0 group-hover:bg-cyan-500/20 transition-colors">
                  <Icon size={16} className="text-cyan-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-200 mb-1">
                    {s.title}
                  </p>
                  <p className="text-xs text-slate-500 line-clamp-2">
                    {s.prompt}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
