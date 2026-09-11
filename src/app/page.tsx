import { GlassCard } from "@/components/ui/GlassCard";
import { LinkButton } from "@/components/ui/Button";
import { DemoBadge } from "@/components/ui/Disclaimer";

const USPS = [
  { icon: "🧠", title: "Context-aware AI", desc: "Weighs time of day, activity, weather and transport — not just distance." },
  { icon: "⚖️", title: "Fastest vs Safer vs Balanced", desc: "Always three real choices, never a single forced answer." },
  { icon: "💬", title: "Explainable recommendations", desc: "Every route says plainly why it was suggested." },
  { icon: "🔮", title: "AI risk & context prediction", desc: "Estimates exposure signals — clearly labeled as estimates." },
  { icon: "🎯", title: "Personalization", desc: "Tunes to your own priorities, mode and accessibility needs." },
  { icon: "📡", title: "Real-time context", desc: "Conceptually reflects live traffic, weather and activity." },
  { icon: "⏱️", title: "Smart check-ins", desc: "Gentle prompts during a journey so you're never silent for long." },
  { icon: "🔒", title: "Privacy-first architecture", desc: "No unnecessary location history. You control what's shared." },
  { icon: "🆘", title: "Emergency & trusted contacts", desc: "One tap to official numbers or the people you trust." },
  { icon: "📉", title: "Honest uncertainty", desc: "No overconfident claims — confidence bands, always." },
];

const STEPS = [
  { step: "1", title: "Tell us your trip", desc: "Enter where you're starting and going, and how you'll travel." },
  { step: "2", title: "AI weighs context", desc: "We combine mock traffic, weather, activity and transport signals with your preferences." },
  { step: "3", title: "Compare routes", desc: "See Fastest, Safer and Balanced options — each with a plain-language explanation." },
  { step: "4", title: "Travel with support", desc: "Live progress, check-ins, and one-tap access to trusted contacts and emergency numbers." },
];

export default function HomePage() {
  return (
    <div>
      <section className="mx-auto max-w-6xl px-4 pb-14 pt-14 sm:px-6 sm:pt-20">
        <div className="mx-auto max-w-3xl text-center animate-fade-up">
          <DemoBadge className="mb-5" />
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
            The fastest route is <span className="brand-gradient-text">not always</span> the right route.
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-balance text-base text-muted sm:text-lg">
            SafeRoute AI compares journeys through context, not just distance — so you can choose with
            more information, not blind trust.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <LinkButton href="/plan" size="lg">
              Plan a Journey →
            </LinkButton>
            <LinkButton href="/about" variant="secondary" size="lg">
              How it works
            </LinkButton>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        <h2 className="mb-6 text-center text-sm font-semibold uppercase tracking-widest text-muted">
          What makes SafeRoute AI different
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {USPS.map((usp) => (
            <GlassCard key={usp.title} hover className="text-left">
              <div className="mb-3 text-2xl">{usp.icon}</div>
              <h3 className="mb-1.5 text-sm font-semibold">{usp.title}</h3>
              <p className="text-xs leading-relaxed text-muted">{usp.desc}</p>
            </GlassCard>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <GlassCard className="p-6 sm:p-10">
          <h2 className="mb-8 text-center text-2xl font-bold">How it works</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s) => (
              <div key={s.step} className="text-center sm:text-left">
                <div className="mx-auto mb-3 flex h-9 w-9 items-center justify-center rounded-full brand-gradient-bg text-sm font-bold sm:mx-0">
                  {s.step}
                </div>
                <h3 className="mb-1 text-sm font-semibold">{s.title}</h3>
                <p className="text-xs leading-relaxed text-muted">{s.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 flex justify-center">
            <LinkButton href="/plan">Start planning →</LinkButton>
          </div>
        </GlassCard>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-24 sm:px-6">
        <GlassCard className="flex flex-col items-center gap-4 border-danger/30 bg-danger/[0.04] p-6 text-center sm:flex-row sm:justify-between sm:text-left">
          <div>
            <h3 className="text-base font-semibold">Need help right now?</h3>
            <p className="text-sm text-muted">Official emergency numbers and your trusted contacts are always one tap away.</p>
          </div>
          <LinkButton href="/emergency" variant="emergency">
            🚨 Emergency Help
          </LinkButton>
        </GlassCard>
      </section>
    </div>
  );
}
