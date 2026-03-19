import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const USD_TO_DZD_RATE = 250;

export async function GET() {
  try {
    const ads = await prisma.adExpense.findMany({
      orderBy: { date: 'desc' },
      include: { product: true }
    });
    return NextResponse.json(ads);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch ad expenses" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const spendUsd = Number(body.spendUsd);

    const expense = await prisma.adExpense.create({
      data: {
        platform: body.platform,
        spendUsd,
        spendDzd: spendUsd * USD_TO_DZD_RATE,
        date: body.date ? new Date(body.date) : new Date(),
        productId: body.productId || null
      }
    });

    return NextResponse.json(expense);
  } catch (error) {
    return NextResponse.json({ error: "Failed to add ad expense" }, { status: 500 });
  }
}
