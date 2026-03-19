import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const products = await prisma.productSettings.findMany();
    return NextResponse.json(products);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const result = await prisma.productSettings.deleteMany({});
    return NextResponse.json({ success: true, count: result.count });
  } catch (error) {
    return NextResponse.json({ error: "Failed to clear products" }, { status: 500 });
  }
}
