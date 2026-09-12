import { GlassCard } from "@/components/ui/GlassCard";
import { Disclaimer } from "@/components/ui/Disclaimer";
import { getSupabasePublicClient } from "@/lib/supabase/client";

type Instrument = { id: number; name: string };

export default async function InstrumentsPage() {
  const supabase = getSupabasePublicClient();
  const { data: instruments, error } = supabase
    ? await supabase.from("instruments").select("id, name").order("id")
    : { data: null, error: null };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold sm:text-3xl">Instruments</h1>
      <p className="mt-1.5 text-sm text-muted">
        Demo page reading directly from a Supabase Postgres table.
      </p>

      <GlassCard className="mt-6">
        {!supabase && (
          <p className="text-sm text-muted">
            Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY in .env.local to load data.
          </p>
        )}
        {error && <p className="text-sm text-red-400">Error: {error.message}</p>}
        {instruments && instruments.length === 0 && (
          <p className="text-sm text-muted">No instruments yet — run the seed SQL against the instruments table.</p>
        )}
        {instruments && instruments.length > 0 && (
          <ul className="space-y-1.5 text-sm">
            {(instruments as Instrument[]).map((instrument) => (
              <li key={instrument.id}>{instrument.name}</li>
            ))}
          </ul>
        )}
      </GlassCard>

      <Disclaimer className="mt-4">
        This page and its data are unrelated to SafeRoute AI&apos;s route/safety features — it exists only to
        demonstrate a direct Supabase table read.
      </Disclaimer>
    </div>
  );
}
