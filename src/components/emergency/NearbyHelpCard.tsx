import { NearbyHelpPlace } from "@/lib/api/client";
import { GlassCard } from "@/components/ui/GlassCard";
import { LinkButton } from "@/components/ui/Button";

const ICONS: Record<NearbyHelpPlace["type"], string> = {
  police: "👮",
  hospital: "🏥",
  fire_station: "🚒",
};

export function NearbyHelpCard({ place }: { place: NearbyHelpPlace }) {
  const mapsUrl = `https://www.openstreetmap.org/?mlat=${place.location.lat}&mlon=${place.location.lng}#map=17/${place.location.lat}/${place.location.lng}`;

  return (
    <GlassCard className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-3 min-w-0">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/8 text-xl" aria-hidden>
          {ICONS[place.type]}
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{place.name}</p>
          <p className="text-xs text-muted">{place.distanceKm} km away</p>
        </div>
      </div>
      <LinkButton href={mapsUrl} target="_blank" rel="noopener noreferrer" variant="secondary" size="md" className="shrink-0">
        🗺️ Map
      </LinkButton>
    </GlassCard>
  );
}
