import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/store";

export async function GET(req: NextRequest) {
  try {
    const subscriberSession = req.cookies.get("subscriber_session")?.value;

    if (!subscriberSession) {
      return NextResponse.json(
        { success: false, message: "No autorizado" },
        { status: 401 }
      );
    }

    const subscriber = await store.getSubscriberById(subscriberSession);

    if (!subscriber) {
      return NextResponse.json(
        { success: false, message: "Sesión inválida" },
        { status: 401 }
      );
    }

    // Obtener estadísticas del subscriber
    const apps = await store.listApps({ ownerId: subscriber.id });
    const appIds = apps.map((app: any) => app.id);

    let totalLicenses = 0;
    let totalUsers = 0;

    for (const appId of appIds) {
      const licenses = await store.listLicenses({ appId });
      const users = await store.listAppUsers({ appId });
      totalLicenses += licenses.length;
      totalUsers += users.length;
    }

    return NextResponse.json({
      success: true,
      data: {
        totalApps: apps.length,
        totalLicenses,
        totalUsers,
        credits: subscriber.credits || 0,
        subscriptionType: subscriber.subscription_type || "VIP",
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
