"use client";

import { useEffect, useState } from "react";
import { EMERGENCY_NUMBERS } from "@/lib/mock/emergencyNumbers";
import { TrustedContact, TrustedContactInput } from "@/lib/types";
import { getContacts, addContact, updateContact, deleteContact, getNearbyHelp, NearbyHelpPlace } from "@/lib/api/client";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button, LinkButton } from "@/components/ui/Button";
import { Disclaimer } from "@/components/ui/Disclaimer";
import { OfficialNumberCard } from "@/components/emergency/OfficialNumberCard";
import { TrustedContactCard } from "@/components/emergency/TrustedContactCard";
import { NearbyHelpCard } from "@/components/emergency/NearbyHelpCard";
import { AddContactModal } from "@/components/emergency/AddContactModal";

type LoadState = "loading" | "ready" | "error";
type NearbyHelpState = "idle" | "locating" | "loading" | "ready" | "denied" | "error";

export default function EmergencyPage() {
  const [emergencyMode, setEmergencyMode] = useState(false);
  const [contacts, setContacts] = useState<TrustedContact[]>([]);
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<TrustedContact | null>(null);
  const [nearbyHelp, setNearbyHelp] = useState<NearbyHelpPlace[]>([]);
  const [nearbyHelpState, setNearbyHelpState] = useState<NearbyHelpState>("idle");

  function findNearbyHelp() {
    if (!("geolocation" in navigator)) {
      setNearbyHelpState("error");
      return;
    }
    setNearbyHelpState("locating");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setNearbyHelpState("loading");
        getNearbyHelp(position.coords.latitude, position.coords.longitude)
          .then((places) => {
            setNearbyHelp(places);
            setNearbyHelpState("ready");
          })
          .catch(() => setNearbyHelpState("error"));
      },
      (err) => setNearbyHelpState(err.code === err.PERMISSION_DENIED ? "denied" : "error"),
      { timeout: 10000 },
    );
  }

  function loadContacts() {
    setLoadState("loading");
    getContacts()
      .then((data) => {
        setContacts(data);
        setLoadState("ready");
      })
      .catch(() => setLoadState("error"));
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial fetch on mount
    loadContacts();
  }, []);

  async function handleSave(input: TrustedContactInput) {
    if (editingContact) {
      const updated = await updateContact(editingContact.id, input);
      setContacts((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    } else {
      const created = await addContact(input);
      setContacts((prev) => [...prev, created]);
    }
    setModalOpen(false);
    setEditingContact(null);
  }

  async function handleDelete(id: string) {
    const prev = contacts;
    setContacts((c) => c.filter((contact) => contact.id !== id));
    try {
      await deleteContact(id);
    } catch {
      setContacts(prev);
    }
  }

  const primaryContact = contacts[0];

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
      <h1 className="text-2xl font-bold sm:text-3xl">🚨 Emergency Help</h1>
      <p className="mt-1.5 text-sm text-muted">
        Quick access to official emergency numbers and the people you trust.
      </p>

      <GlassCard className="mt-6 border-danger/30 bg-danger/[0.04]">
        {!emergencyMode ? (
          <Button variant="emergency" size="lg" fullWidth onClick={() => setEmergencyMode(true)}>
            🚨 Activate Emergency Mode
          </Button>
        ) : (
          <div className="animate-fade-up">
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold text-danger">Emergency Mode Active</p>
              <button className="text-xs text-muted underline" onClick={() => setEmergencyMode(false)}>
                Deactivate
              </button>
            </div>
            <p className="mt-1 text-xs text-muted">
              This does not notify police, ambulance, or dispatch any real emergency response. Use
              the calls below to reach real help directly.
            </p>
            <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
              <LinkButton href="tel:112" variant="emergency">
                📞 Call 112
              </LinkButton>
              <LinkButton href="tel:181" variant="emergency">
                📞 Women Helpline 181
              </LinkButton>
              {primaryContact ? (
                <LinkButton href={`tel:${primaryContact.phoneNumber.replace(/\s+/g, "")}`} variant="emergency">
                  📞 Call {primaryContact.name}
                </LinkButton>
              ) : (
                <Button variant="secondary" onClick={() => setModalOpen(true)}>
                  + Add Trusted Contact
                </Button>
              )}
            </div>
          </div>
        )}
      </GlassCard>

      <section className="mt-8">
        <h2 className="text-lg font-semibold">Official Emergency Numbers</h2>
        <div className="mt-3 space-y-3">
          {EMERGENCY_NUMBERS.map((entry) => (
            <OfficialNumberCard key={entry.id} entry={entry} />
          ))}
        </div>
        <Disclaimer className="mt-3">
          Emergency numbers are provided for quick access. Availability may vary by location and
          service.
        </Disclaimer>
      </section>

      <section className="mt-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Nearby Help</h2>
            <p className="text-xs text-muted">Real police stations, hospitals and fire stations near you.</p>
          </div>
          {nearbyHelpState === "idle" && (
            <Button size="sm" variant="secondary" onClick={findNearbyHelp}>
              📍 Find Nearby
            </Button>
          )}
        </div>

        <div className="mt-3 space-y-3">
          {(nearbyHelpState === "locating" || nearbyHelpState === "loading") && (
            <>
              <GlassCard className="h-16 animate-pulse" />
              <GlassCard className="h-16 animate-pulse" />
            </>
          )}

          {nearbyHelpState === "denied" && (
            <GlassCard className="text-center text-sm text-muted">
              Location access was denied. Allow location access in your browser to see nearby help.
            </GlassCard>
          )}

          {nearbyHelpState === "error" && (
            <GlassCard className="text-center text-sm text-danger">
              Couldn&apos;t find nearby help right now.
              <div className="mt-3">
                <Button size="sm" onClick={findNearbyHelp}>
                  Retry
                </Button>
              </div>
            </GlassCard>
          )}

          {nearbyHelpState === "ready" && nearbyHelp.length === 0 && (
            <GlassCard className="text-center text-sm text-muted">
              No mapped police stations, hospitals or fire stations found nearby.
            </GlassCard>
          )}

          {nearbyHelpState === "ready" && nearbyHelp.map((place) => <NearbyHelpCard key={place.id} place={place} />)}
        </div>

        {nearbyHelpState === "ready" && (
          <Disclaimer className="mt-3">
            Sourced from OpenStreetMap contributor data — may be incomplete or outdated for your area.
          </Disclaimer>
        )}
      </section>

      <section className="mt-10">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">My Trusted Contacts</h2>
            <p className="text-xs text-muted">People you choose to contact during an emergency.</p>
          </div>
        </div>

        <div className="mt-3 space-y-3">
          {loadState === "loading" && (
            <>
              <GlassCard className="h-20 animate-pulse" />
              <GlassCard className="h-20 animate-pulse" />
            </>
          )}

          {loadState === "error" && (
            <GlassCard className="text-center text-sm text-danger">
              Couldn&apos;t load your trusted contacts.
              <div className="mt-3">
                <Button size="sm" onClick={loadContacts}>
                  Retry
                </Button>
              </div>
            </GlassCard>
          )}

          {loadState === "ready" && contacts.length === 0 && (
            <GlassCard className="text-center">
              <p className="text-sm text-muted">No trusted contacts added yet.</p>
              <Button className="mt-3" onClick={() => setModalOpen(true)}>
                + Add Trusted Contact
              </Button>
            </GlassCard>
          )}

          {loadState === "ready" &&
            contacts.map((contact) => (
              <TrustedContactCard
                key={contact.id}
                contact={contact}
                onEdit={() => {
                  setEditingContact(contact);
                  setModalOpen(true);
                }}
                onDelete={() => handleDelete(contact.id)}
              />
            ))}
        </div>

        {loadState === "ready" && contacts.length > 0 && (
          <Button
            className="mt-4"
            variant="secondary"
            onClick={() => {
              setEditingContact(null);
              setModalOpen(true);
            }}
          >
            + Add Trusted Contact
          </Button>
        )}

        <Disclaimer className="mt-4">
          DEMO MODE: trusted contacts are stored against an anonymous per-device session for this
          prototype, not a production database. They are private to you and never exposed
          publicly or in bulk to anyone else.
        </Disclaimer>
      </section>

      {modalOpen && (
        <AddContactModal
          initial={editingContact}
          onCancel={() => {
            setModalOpen(false);
            setEditingContact(null);
          }}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
