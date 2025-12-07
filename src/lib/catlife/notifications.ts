// CatLife Chat Sim - Notifications Service
// Email via Resend (active), SMS via Twilio (placeholder until A2P approved)

import { Resend } from "resend";
import { REMINDER_EMAIL_TEMPLATES, REMINDER_SMS_TEMPLATES } from "./prompts";
import type { ReminderSettings, ReminderChannel } from "@/types/catlife";

// ============================================
// Configuration
// ============================================

const resend = new Resend(process.env.RESEND_API_KEY);

// Twilio is disabled until A2P campaign is approved
const TWILIO_ENABLED = process.env.TWILIO_ENABLED === "true";
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;

// ============================================
// Email Sending (Active)
// ============================================

interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Send a reminder email via Resend
 */
export async function sendReminderEmail(
  to: string,
  catName: string,
  channel: ReminderChannel
): Promise<EmailResult> {
  try {
    const template = REMINDER_EMAIL_TEMPLATES[channel](catName);

    const { data, error } = await resend.emails.send({
      from: `CatLife <${process.env.FROM_EMAIL || "noreply@lawrencehua.com"}>`,
      to: [to],
      subject: template.subject,
      html: formatEmailHtml(template.subject, template.body, catName),
    });

    if (error) {
      console.error("Resend error:", error);
      return { success: false, error: error.message };
    }

    return { success: true, messageId: data?.id };
  } catch (err) {
    console.error("Email send error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

/**
 * Format email body as HTML with styling
 */
function formatEmailHtml(subject: string, body: string, catName: string): string {
  const unsubscribeUrl = `${process.env.NEXT_PUBLIC_BASE_URL || "https://lawrencehua.com"}/api/catlife/unsubscribe`;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #fef7ed;">
      <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 24px; border-radius: 16px 16px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 24px;">🐱 CatLife</h1>
        <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 14px;">Caring for ${catName}</p>
      </div>
      
      <div style="background: white; padding: 24px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        <h2 style="color: #92400e; margin-top: 0;">${subject}</h2>
        
        <div style="color: #451a03; line-height: 1.6; white-space: pre-wrap;">
${body}
        </div>
        
        <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #fde68a;">
          <p style="color: #92400e; font-size: 12px; margin: 0;">
            You're receiving this because you set up CatLife reminders for ${catName}.
            <br><br>
            <a href="${unsubscribeUrl}" style="color: #d97706; text-decoration: underline;">Unsubscribe from all reminders</a>
          </p>
        </div>
      </div>
      
      <div style="text-align: center; padding: 16px; color: #92400e; font-size: 12px;">
        Made with 💛 by <a href="https://lawrencehua.com" style="color: #d97706;">Lawrence Hua</a>
      </div>
    </body>
    </html>
  `;
}

// ============================================
// SMS Sending (Placeholder - Twilio)
// ============================================

interface SmsResult {
  success: boolean;
  messageSid?: string;
  error?: string;
}

/**
 * Send a reminder SMS via Twilio
 * Currently disabled - will be enabled when A2P campaign is approved
 */
export async function sendReminderSms(
  to: string,
  catName: string,
  channel: ReminderChannel
): Promise<SmsResult> {
  // Check if Twilio is enabled
  if (!TWILIO_ENABLED) {
    console.log("[CatLife] SMS disabled - Twilio A2P campaign pending approval");
    return {
      success: false,
      error: "SMS notifications not yet available. Please use email.",
    };
  }

  // Validate Twilio credentials
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE_NUMBER) {
    console.error("[CatLife] Twilio credentials not configured");
    return {
      success: false,
      error: "SMS service not configured",
    };
  }

  try {
    const messageBody = REMINDER_SMS_TEMPLATES[channel](catName);

    // Twilio REST API call
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${Buffer.from(
            `${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`
          ).toString("base64")}`,
        },
        body: new URLSearchParams({
          To: to,
          From: TWILIO_PHONE_NUMBER,
          Body: messageBody,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Twilio error:", data);
      return {
        success: false,
        error: data.message || "Failed to send SMS",
      };
    }

    return {
      success: true,
      messageSid: data.sid,
    };
  } catch (err) {
    console.error("SMS send error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

// ============================================
// Unified Notification Sender
// ============================================

export interface NotificationResult {
  success: boolean;
  channel: "email" | "sms";
  messageId?: string;
  error?: string;
}

/**
 * Send a reminder notification via the appropriate channel
 */
export async function sendReminder(
  settings: ReminderSettings,
  reminderType: ReminderChannel
): Promise<NotificationResult> {
  const { contactType, contactValue, catName } = settings;

  if (contactType === "email") {
    const result = await sendReminderEmail(contactValue, catName, reminderType);
    return {
      success: result.success,
      channel: "email",
      messageId: result.messageId,
      error: result.error,
    };
  } else if (contactType === "sms") {
    const result = await sendReminderSms(contactValue, catName, reminderType);
    return {
      success: result.success,
      channel: "sms",
      messageId: result.messageSid,
      error: result.error,
    };
  }

  return {
    success: false,
    channel: contactType,
    error: "Unknown contact type",
  };
}

// ============================================
// Validation Helpers
// ============================================

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate phone number format (E.164)
 */
export function isValidPhoneNumber(phone: string): boolean {
  // E.164 format: +1234567890 (10-15 digits with + prefix)
  const phoneRegex = /^\+[1-9]\d{9,14}$/;
  return phoneRegex.test(phone.replace(/\s/g, ""));
}

/**
 * Normalize phone number to E.164 format
 */
export function normalizePhoneNumber(phone: string): string {
  // Remove all non-digit characters except leading +
  let normalized = phone.replace(/[^\d+]/g, "");

  // If no country code, assume US (+1)
  if (!normalized.startsWith("+")) {
    // Remove leading 1 if present
    if (normalized.startsWith("1") && normalized.length === 11) {
      normalized = normalized.substring(1);
    }
    normalized = "+1" + normalized;
  }

  return normalized;
}

// ============================================
// Test Functions (for development)
// ============================================

/**
 * Send a test email to verify configuration
 */
export async function sendTestEmail(to: string): Promise<EmailResult> {
  try {
    const { data, error } = await resend.emails.send({
      from: `CatLife <${process.env.FROM_EMAIL || "noreply@lawrencehua.com"}>`,
      to: [to],
      subject: "🐱 CatLife Test Email",
      html: `
        <div style="font-family: sans-serif; padding: 20px;">
          <h1>CatLife Test Email</h1>
          <p>If you're seeing this, email notifications are working correctly!</p>
          <p>🐱 Meow!</p>
        </div>
      `,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, messageId: data?.id };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

/**
 * Check if SMS is currently available
 */
export function isSmsAvailable(): boolean {
  return TWILIO_ENABLED && !!TWILIO_ACCOUNT_SID && !!TWILIO_AUTH_TOKEN && !!TWILIO_PHONE_NUMBER;
}

