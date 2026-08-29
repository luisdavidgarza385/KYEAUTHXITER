import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-helpers";
import { store } from "@/lib/store";

export const dynamic = "force-dynamic";

// GET - Obtener todos los planes de suscripción de una app
export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
    
    const url = new URL(req.url);
    const appId = url.searchParams.get("app_id");

    if (!appId) {
      return NextResponse.json(
        { success: false, message: "app_id is required" },
        { status: 400 }
      );
    }

    const plans = await store.getSubscriptionPlansByAppId(appId);

    return NextResponse.json({
      success: true,
      data: plans || [],
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// POST - Crear un nuevo plan de suscripción
export async function POST(req: NextRequest) {
  try {
    await requireAdmin();

    const body = await req.json();
    const {
      app_id,
      name,
      description,
      price,
      duration_days,
      level,
      features,
      status,
    } = body;

    if (!app_id || !name || price === undefined || !duration_days) {
      return NextResponse.json(
        {
          success: false,
          message: "app_id, name, price, and duration_days are required",
        },
        { status: 400 }
      );
    }

    const plan = await store.createSubscriptionPlan({
      app_id,
      name,
      description: description || "",
      price: parseFloat(price),
      duration_days: parseInt(duration_days),
      level: parseInt(level) || 1,
      features: Array.isArray(features) ? features : [],
      status: status || "active",
    });

    return NextResponse.json({
      success: true,
      message: "Subscription plan created successfully",
      data: plan,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
