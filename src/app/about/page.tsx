import { GlassCard } from "@/components/ui/GlassCard";
import { Disclaimer } from "@/components/ui/Disclaimer";

const PIPELINE = [
  { icon: "📥", title: "Data inputs", desc: "Origin, destination, mode, and (conceptually) live traffic, weather, transit and public activity signals." },
  { icon: "🧩", title: "Context aggregation", desc: "Signals are combined into a per-route context snapshot for the time of travel." },
  { icon: "🎚️", title: "Risk & uncertainty model", desc: "A model estimates a context score with a confidence band — never a single certain number." },
  { icon: "🎯", title: "Personalization", desc: "Your saved preferences (priority, walking tolerance, accessibility) reweight the estimate." },
  { icon: "💬", title: "Explanation generator", desc: "Produces plain-language reasons behind each recommendation." },
  { icon: "⚖️", title: "Route ranking", desc: "Routes are grouped into Fastest, Safer and Balanced for you to choose from." },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold sm:text-3xl">About &amp; How AI Works</h1>
      <p className="mt-1.5 text-sm text-muted">
        SafeRoute AI is a hackathon prototype exploring context-aware, explainable travel
        recommendations for women travelers.
      </p>

      <GlassCard className="mt-6">
        <h2 className="mb-5 text-sm font-semibold">The conceptual AI pipeline</h2>
        <div className="space-y-4">
          {PIPELINE.map((p, i) => (
            <div key={p.title} className="flex gap-3">
              <div className="flex flex-col items-center">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/8 text-sm">{p.icon}</span>
                {i < PIPELINE.length - 1 && <span className="mt-1 h-full w-px flex-1 bg-white/10" />}
              </div>
              <div className="pb-4">
                <p className="text-sm font-semibold">{p.title}</p>
                <p className="mt-0.5 text-xs text-muted">{p.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>

      <GlassCard className="mt-4">
        <h2 className="mb-2 text-sm font-semibold">What this prototype is not</h2>
        <ul className="space-y-1.5 text-xs text-muted">
          <li>• It does not use real crime statistics or verified real-time incident data.</li>
          <li>• It never claims a route is guaranteed safe.</li>
          <li>• Any &quot;safety&quot; indicator is an estimate with explicit uncertainty, not a fact.</li>
          <li>• Emergency features do not dispatch real police/ambulance services — they open your phone dialer or call your own trusted contacts.</li>
        </ul>
      </GlassCard>

      <Disclaimer className="mt-4">
        All route, context and safety-related data in this app is clearly marked demo/mock data
        generated for demonstration purposes.
      </Disclaimer>
    </div>
  );
}
