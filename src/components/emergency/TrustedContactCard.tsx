"use client";

import { useState } from "react";
import { TrustedContact } from "@/lib/types";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button, LinkButton } from "@/components/ui/Button";

export function TrustedContactCard({
  contact,
  onEdit,
  onDelete,
}: {
  contact: TrustedContact;
  onEdit: () => void;
  onDelete: () => Promise<void> | void;
}) {
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    try {
      await onDelete();
    } finally {
      setDeleting(false);
      setConfirming(false);
    }
  }

  return (
    <GlassCard className="flex items-center justify-between gap-4">
      <div className="flex min-w-0 items-center gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-pink/15 text-xl" aria-hidden>
          🧑
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{contact.name}</p>
          <p className="text-xs text-muted">{contact.relationship}</p>
          <p className="text-xs text-muted">{contact.phoneNumber}</p>
        </div>
      </div>

      {!confirming ? (
        <div className="flex shrink-0 gap-2">
          <LinkButton href={`tel:${contact.phoneNumber.replace(/\s+/g, "")}`} size="sm" variant="emergency">
            📞 Call
          </LinkButton>
          <Button size="sm" variant="secondary" onClick={onEdit}>
            Edit
          </Button>
          <Button size="sm" variant="danger" onClick={() => setConfirming(true)}>
            Delete
          </Button>
        </div>
      ) : (
        <div className="flex shrink-0 flex-col items-end gap-1.5">
          <p className="text-[11px] text-muted">Remove {contact.name}?</p>
          <div className="flex gap-2">
            <Button size="sm" variant="secondary" onClick={() => setConfirming(false)} disabled={deleting}>
              Cancel
            </Button>
            <Button size="sm" variant="danger" onClick={handleDelete} disabled={deleting}>
              {deleting ? "Removing…" : "Confirm"}
            </Button>
          </div>
        </div>
      )}
    </GlassCard>
  );
}
