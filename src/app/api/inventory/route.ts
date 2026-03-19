import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    let settings = await prisma.productSettings.findFirst();
    if (!settings) {
      settings = await prisma.productSettings.create({
        data: {
          name: "LED Spoiler Tail Light",
          costPriceDzd: 0,
          initialStock: 0,
        },
      });
    }
    return NextResponse.json(settings);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch inventory settings" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const settings = await prisma.productSettings.findFirst();
    
    if (settings) {
      const updated = await prisma.productSettings.update({
        where: { id: settings.id },
        data: {
          costPriceDzd: Number(body.costPriceDzd) || 0,
          initialStock: Number(body.initialStock) || 0,
        },
      });
      return NextResponse.json(updated);
    } else {
      const created = await prisma.productSettings.create({
        data: {
          name: "LED Spoiler Tail Light",
          costPriceDzd: Number(body.costPriceDzd) || 0,
          initialStock: Number(body.initialStock) || 0,
        },
      });
      return NextResponse.json(created);
    }
  } catch (error) {
    return NextResponse.json({ error: "Failed to update inventory settings" }, { status: 500 });
  }
}
