import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const productFilter = searchParams.get("product");

    const allOrders = await prisma.order.findMany();
    const allProductsSettings = await prisma.productSettings.findMany();
    const ads = await prisma.adExpense.findMany({ include: { product: true }});
    
    // Create a mapping for product costs:
    const productCostsMap: Record<string, number> = {};
    for (const p of allProductsSettings) {
      productCostsMap[p.name] = p.costPriceDzd;
    }
    
    // Group orders by product name
    const ordersByProduct = allOrders.reduce((acc, order) => {
      const p = order.product || "Unknown";
      if (!acc[p]) acc[p] = [];
      acc[p].push(order);
      return acc;
    }, {} as Record<string, any[]>);

    // Compute Product Profit Breakdown safely aggregating
    const profitBreakdowns: any[] = [];
    let globalRevenue = 0;
    let globalCOGS = 0;
    let globalShippingLoss = 0;
    let productSpecificAdSpend = 0;

    for (const [productName, pOrders] of Object.entries(ordersByProduct)) {
      const pending = pOrders.filter(o => o.status === "Pending");
      const shipped = pOrders.filter(o => o.status === "Shipped");
      const delivered = pOrders.filter(o => o.status === "Delivered");
      const returned = pOrders.filter(o => o.status === "Returned");
      
      const revenue = delivered.reduce((sum, o) => sum + o.totalPrice, 0);
      const qtyDelivered = delivered.reduce((sum, o) => sum + (o.qty || 1), 0);
      const costPrice = productCostsMap[productName] || 0;
      const cogs = costPrice * qtyDelivered;
      const shippingLoss = returned.length * 150;
      
      const productSetting = allProductsSettings.find(p => p.name === productName);
      const adSpendDzd = ads
        .filter(ad => ad.productId && productSetting && ad.productId === productSetting.id)
        .reduce((sum, ad) => sum + ad.spendDzd, 0);

      const netProfit = revenue - cogs - adSpendDzd - shippingLoss;

      profitBreakdowns.push({
        product: productName,
        totalOrdersCount: pOrders.length,
        pendingCount: pending.length,
        shippedCount: shipped.length,
        deliveredCount: delivered.length,
        qtyDelivered,
        returnedCount: returned.length,
        revenue,
        cogs,
        adSpendDzd,
        shippingLoss,
        netProfit
      });

      globalRevenue += revenue;
      globalCOGS += cogs;
      globalShippingLoss += shippingLoss;
      productSpecificAdSpend += adSpendDzd;
    }

    // General Ad Spend (unassigned)
    const generalAdSpendDzd = ads
      .filter(ad => !ad.productId)
      .reduce((sum, ad) => sum + ad.spendDzd, 0);

    const globalTotalAdSpend = ads.reduce((sum, ad) => sum + ad.spendDzd, 0);
    const globalNetProfit = globalRevenue - globalCOGS - globalTotalAdSpend - globalShippingLoss;

    // Analytics Chart UI Defaults
    const availableProducts = Array.from(new Set(allOrders.map(o => o.product))).filter(Boolean);

    const filteredOrders = productFilter && productFilter !== "All" 
      ? allOrders.filter(o => o.product === productFilter)
      : allOrders;

    const filteredDelivered = filteredOrders.filter(o => o.status === "Delivered");
    const filteredReturned = filteredOrders.filter(o => o.status === "Returned");
    
    // CRITICAL FIX: Only calculate percentages against RESOLVED orders
    const filteredResolved = filteredDelivered.length + filteredReturned.length;
    
    const deliveryRate = filteredResolved > 0 ? (filteredDelivered.length / filteredResolved) * 100 : 0;
    const returnRate = filteredResolved > 0 ? (filteredReturned.length / filteredResolved) * 100 : 0;

    const statusCounts = filteredOrders.reduce((acc, o) => {
      acc[o.status] = (acc[o.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Global counts
    const globalStatusCounts = allOrders.reduce((acc, o) => {
      acc[o.status] = (acc[o.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const chartData = Object.entries(statusCounts).map(([name, value]) => ({ name, value }));

    const selectedProductAds = productFilter && productFilter !== "All"
      ? profitBreakdowns.find(p => p.product === productFilter)?.adSpendDzd || 0
      : undefined;

    return NextResponse.json({
      summary: {
        totalSales: globalRevenue,
        totalAdSpendDzd: globalTotalAdSpend,
        shippingLosses: globalShippingLoss,
        estimatedNetProfit: globalNetProfit,
        globalStatusCounts,
        globalTotalOrders: allOrders.length
      },
      inventory: {
        soldQuantity: filteredDelivered.length,
        remainingStock: 0,
      },
      analytics: {
        totalOrders: filteredOrders.length,
        resolvedOrders: filteredResolved,
        pendingOrders: filteredOrders.filter(o => o.status === "Pending").length,
        shippedOrders: filteredOrders.filter(o => o.status === "Shipped").length,
        deliveryRate: deliveryRate.toFixed(1),
        returnRate: returnRate.toFixed(1),
        chartData,
        availableProducts,
        selectedProductAds
      },
      profitBreakdowns,
      generalAdSpendDzd
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to calculate stats" }, { status: 500 });
  }
}
