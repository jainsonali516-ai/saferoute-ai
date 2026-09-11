"use client";

import { FormEvent, useEffect, useState } from "react";
import { ContactRelationship, TrustedContact, TrustedContactInput } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { isValidPhoneNumber } from "@/lib/utils";
import { cn } from "@/lib/utils";

const RELATIONSHIPS: ContactRelationship[] = ["Parent", "Guardian", "Friend", "Relative", "Other"];

export function AddContactModal({
  initial,
  onCancel,
  onSave,
}: {
  initial?: TrustedContact | null;
  onCancel: () => void;
  onSave: (input: TrustedContactInput) => Promise<void>;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [phoneNumber, setPhoneNumber] = useState(initial?.phoneNumber ?? "");
  const [relationship, setRelationship] = useState<ContactRelationship>(initial?.relationship ?? "Parent");
  const [errors, setErrors] = useState<{ name?: string; phoneNumber?: string }>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onCancel();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onCancel]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const nextErrors: { name?: string; phoneNumber?: string } = {};
    if (!name.trim()) nextErrors.name = "Name is required.";
    if (!phoneNumber.trim()) {
      nextErrors.phoneNumber = "Phone number is required.";
    } else if (!isValidPhoneNumber(phoneNumber)) {
      nextErrors.phoneNumber = "Enter a valid phone number (7-15 digits).";
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setServerError(null);
    setSubmitting(true);
    try {
      await onSave({ name: name.trim(), phoneNumber: phoneNumber.trim(), relationship });
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Couldn't save contact.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center" role="dialog" aria-modal="true">
      <form
        onSubmit={handleSubmit}
        className="glass-card w-full max-w-md rounded-b-none border-b-0 p-5 sm:rounded-b-[1.25rem] sm:border-b"
      >
        <h2 className="text-lg font-semibold">{initial ? "Edit trusted contact" : "Add trusted contact"}</h2>

        <div className="mt-4 space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted" htmlFor="contact-name">
              Name
            </label>
            <input
              id="contact-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={cn("modal-input", errors.name && "border-danger/60")}
              placeholder="e.g. Mom"
              autoFocus
            />
            {errors.name && <p className="mt-1 text-xs text-danger">{errors.name}</p>}
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted" htmlFor="contact-phone">
              Phone number
            </label>
            <input
              id="contact-phone"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className={cn("modal-input", errors.phoneNumber && "border-danger/60")}
              placeholder="e.g. +91 98765 43210"
              type="tel"
            />
            {errors.phoneNumber && <p className="mt-1 text-xs text-danger">{errors.phoneNumber}</p>}
          </div>

          <div>
            <span className="mb-1.5 block text-xs font-medium text-muted">Relationship</span>
            <div className="flex flex-wrap gap-2">
              {RELATIONSHIPS.map((rel) => (
                <button
                  type="button"
                  key={rel}
                  onClick={() => setRelationship(rel)}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors focus-ring",
                    relationship === rel
                      ? "border-brand-pink/50 bg-brand-pink/15 text-foreground"
                      : "border-white/10 bg-white/[0.03] text-muted",
                  )}
                >
                  {rel}
                </button>
              ))}
            </div>
          </div>

          {serverError && <p className="text-xs text-danger">{serverError}</p>}
        </div>

        <div className="mt-6 flex gap-3">
          <Button type="button" variant="secondary" fullWidth onClick={onCancel} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" fullWidth disabled={submitting}>
            {submitting ? "Saving…" : "Save Contact"}
          </Button>
        </div>
      </form>

      <style jsx global>{`
        .modal-input {
          width: 100%;
          border-radius: 0.75rem;
          border: 1px solid rgba(255, 255, 255, 0.14);
          background: rgba(255, 255, 255, 0.04);
          padding: 0.6rem 0.85rem;
          font-size: 0.875rem;
          color: var(--foreground);
        }
        .modal-input:focus {
          outline: 2px solid var(--brand-pink);
          outline-offset: 1px;
        }
      `}</style>
    </div>
  );
}
