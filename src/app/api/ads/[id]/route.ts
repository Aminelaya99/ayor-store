import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const USD_TO_DZD_RATE = 250;

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> | { id: string } }) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;
    const body = await request.json();
    const spendUsd = Number(body.spendUsd);

    const updated = await prisma.adExpense.update({
      where: { id },
      data: {
        platform: body.platform,
        spendUsd,
        spendDzd: spendUsd * USD_TO_DZD_RATE,
        date: body.date ? new Date(body.date) : undefined,
        productId: body.productId || null
      }
    });

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update ad expense" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> | { id: string } }) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;
    
    await prisma.adExpense.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete ad expense" }, { status: 500 });
  }
}
