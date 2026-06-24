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

    return NextResponse.json({
      success: true,
      data: {
        id: subscriber.id,
        username: subscriber.username,
        subscription_type: subscriber.subscription_type,
        credits: subscriber.credits,
        status: subscriber.status,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
