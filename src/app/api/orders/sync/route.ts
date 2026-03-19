import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST() {
  try {
    const response = await fetch("https://script.google.com/macros/s/AKfycbxY6rh-YvOWawFfrwAQNtTD4wI2urF9bb0ln5wXFpoVTpKoneLSrNaIIEjDGUZzHiPh5w/exec", {
      redirect: "follow"
    });
    
    const text = await response.text();

    if (!response.ok) {
      throw new Error(`Google Script returned status ${response.status}: ${text}`);
    }
    
    let json;
    try {
      json = JSON.parse(text);
    } catch (e) {
      throw new Error("Failed to parse JSON. The API returned HTML or an error page. Check terminal logs.");
    }
    
    if (json.status !== "success" || !Array.isArray(json.data)) {
      throw new Error(json.error || "The API successfully returned JSON, but the format does not match expected arrays.");
    }

    let updatedCount = 0;
    let createdCount = 0;

    // 1. Loop through all rows and extract all UNIQUE product names
    const uniqueProducts = new Set<string>();
    for (const item of json.data) {
      const pName = item.product ? String(item.product).trim() : "";
      if (pName) {
        uniqueProducts.add(pName);
      }
    }

    const productNames = Array.from(uniqueProducts);
    
    // 3. Add console.log so we can see it in terminal
    console.log("Extracted Products:", productNames);

    // 2. Dynamically upsert EVERY unique product BEFORE saving orders.
    // If it fails here, the outer catch block will trigger the red UI toast automatically.
    for (const pName of productNames) {
      await prisma.productSettings.upsert({
        where: { name: pName },
        update: {}, // keep existing values
        create: {
          name: pName,
          costPriceDzd: 0,
          sellingPrice: 0,
          initialStock: 0
        }
      });
    }

    // Now securely load the orders
    for (const item of json.data) {
      if (!item.id) continue;
      const orderId = String(item.id);
      
      const pName = item.product ? String(item.product).trim() : "Unknown";

      const dataPayload = {
        customerName: item.customer ? String(item.customer) : "Unknown",
        phone: item.phone ? String(item.phone) : "",
        wilaya: item.wilaya ? String(item.wilaya) : "",
        product: pName,
        qty: Number(item.qty) || 1,
        shippingFee: Number(item.shipping) || 0,
        totalPrice: Number(item.total) || 0,
        status: item.status ? String(item.status) : "Pending"
      };

      const existing = await prisma.order.findUnique({
        where: { id: orderId }
      });

      if (existing) {
        updatedCount++;
      } else {
        createdCount++;
      }

      await prisma.order.upsert({
        where: { id: orderId },
        update: dataPayload,
        create: {
          id: orderId,
          ...dataPayload
        }
      });
    }

    return NextResponse.json({
      success: true,
      imported: createdCount,
      updated: updatedCount,
      total: createdCount + updatedCount
    });

  } catch (error: any) {
    console.error("Sync Error Details:", error);
    return NextResponse.json({ error: error.message || String(error) }, { status: 500 });
  }
}
