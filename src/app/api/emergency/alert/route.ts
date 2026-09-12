import { NextRequest } from "next/server";
import { apiFail, apiFromCaught, apiOk } from "@/lib/server/apiResponse";
import { getCurrentUserId } from "@/lib/server/auth";
import { listTrustedContacts } from "@/lib/server/trustedContactsStore";
import { getSmsProvider } from "@/lib/server/providers/smsProvider";

interface AlertResult {
  contactId: string;
  name: string;
  sent: boolean;
  demo: boolean;
  error?: string;
}

/**
 * POST /api/emergency/alert — sends an SMS to every trusted contact (or a
 * subset, via body.contactIds) via the SMS provider (real Twilio if
 * configured, otherwise a logged demo send — see smsProvider.ts). Never
 * throws per-contact; each contact gets its own success/failure result so
 * one bad number doesn't block alerting the others.
 */
export async function POST(req: NextRequest) {
  const userId = await getCurrentUserId();
  const body = await req.json().catch(() => ({}));
  const contactIds: string[] | undefined = Array.isArray(body?.contactIds) ? body.contactIds : undefined;
  const shareUrl: string | undefined = typeof body?.shareUrl === "string" ? body.shareUrl : undefined;

  try {
    const allContacts = await listTrustedContacts(userId);
    const contacts = contactIds ? allContacts.filter((c) => contactIds.includes(c.id)) : allContacts;
    if (contacts.length === 0) {
      return apiFail("No trusted contacts to alert.", 404);
    }

    const provider = getSmsProvider();
    const message = shareUrl
      ? `SafeRoute AI: I may need help. Track my live location: ${shareUrl}`
      : "SafeRoute AI: I may need help. Please check on me.";

    const results: AlertResult[] = await Promise.all(
      contacts.map(async (contact) => {
        const result = await provider.sendSms(contact.phoneNumber, message);
        return { contactId: contact.id, name: contact.name, sent: result.success, demo: result.demo, error: result.error };
      }),
    );

    return apiOk({ results });
  } catch (err) {
    return apiFromCaught(err, "Couldn't send emergency alerts.");
  }
}
