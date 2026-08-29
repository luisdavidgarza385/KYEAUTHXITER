import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Send notification to user after license generation
 * This can be extended to send emails, Discord webhooks, etc.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { seller_key, username, email, discord_tag, licenses } = body;

    // TODO: Implement email sending logic here
    // Example: Use nodemailer, sendgrid, resend, etc.
    
    // TODO: Implement Discord webhook notification
    // Example: Send to Discord webhook with license info

    console.log("Notification sent:", {
      seller_key,
      username,
      email,
      discord_tag,
      licenses_count: licenses.length,
    });

    return NextResponse.json({
      success: true,
      message: "Notificación enviada",
    });
  } catch (error: any) {
    console.error("Error sending notification:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
