/**
 * SmsProvider: real SMS delivery via Twilio's REST API (no SDK dependency —
 * plain fetch with HTTP Basic Auth), gated by TWILIO_ACCOUNT_SID /
 * TWILIO_AUTH_TOKEN / TWILIO_FROM_NUMBER (see .env.example).
 *
 * Mirrors the pattern in mapsProvider.ts/weatherProvider.ts: a mock provider
 * that always works (logs instead of sending, so the emergency flow is never
 * blocked on missing credentials) plus a getReal*Provider() factory that
 * returns null when unconfigured. Never throws — a failed/unsent message
 * must not crash the emergency-alert flow.
 */

export interface SmsSendResult {
  success: boolean;
  demo: boolean;
  error?: string;
}

export interface SmsProvider {
  sendSms(to: string, body: string): Promise<SmsSendResult>;
}

const REQUEST_TIMEOUT_MS = 8000;

export class TwilioSmsProvider implements SmsProvider {
  constructor(
    private readonly accountSid: string,
    private readonly authToken: string,
    private readonly fromNumber: string,
  ) {}

  async sendSms(to: string, body: string): Promise<SmsSendResult> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${this.accountSid}/Messages.json`, {
        method: "POST",
        headers: {
          Authorization: `Basic ${Buffer.from(`${this.accountSid}:${this.authToken}`).toString("base64")}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({ To: to, From: this.fromNumber, Body: body }),
        signal: controller.signal,
      });

      if (!res.ok) {
        const detail = (await res.json().catch(() => null)) as { message?: string } | null;
        return { success: false, demo: false, error: detail?.message || `Twilio responded with ${res.status}.` };
      }
      return { success: true, demo: false };
    } catch (err) {
      return { success: false, demo: false, error: err instanceof Error ? err.message : "SMS request failed." };
    } finally {
      clearTimeout(timeout);
    }
  }
}

/**
 * DEMO MODE fallback: never actually sends anything, just logs and reports
 * success so the emergency-alert UI can be exercised without a Twilio
 * account. Every result is flagged demo: true so callers can show that
 * clearly instead of implying a real message went out.
 */
class DemoSmsProvider implements SmsProvider {
  async sendSms(to: string, body: string): Promise<SmsSendResult> {
    console.log(`[DEMO SMS] to ${to}: ${body}`);
    return { success: true, demo: true };
  }
}

export const demoSmsProvider: SmsProvider = new DemoSmsProvider();

export function getRealSmsProvider(): SmsProvider | null {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_FROM_NUMBER;
  if (!accountSid || !authToken || !fromNumber) return null;
  return new TwilioSmsProvider(accountSid, authToken, fromNumber);
}

export function getSmsProvider(): SmsProvider {
  return getRealSmsProvider() ?? demoSmsProvider;
}
