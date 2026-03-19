"use client";

import { useEffect, useState } from "react";
import { Loader2, Activity, Filter, DollarSign, PieChart as PieChartIcon, TrendingUp, TrendingDown, Percent, Box } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

export default function AnalyticsPage() {
  const [completeData, setCompleteData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<string>("All");

  const fetchStats = (product: string) => {
    setLoading(true);
    fetch(`/api/stats?product=${encodeURIComponent(product)}`)
      .then(res => res.json())
      .then(data => {
        setCompleteData(data);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchStats(selectedProduct);
  }, [selectedProduct]);

  if (loading && !completeData) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  const stats = completeData?.analytics;
  const breakdowns = completeData?.profitBreakdowns || [];

  // Identify Aggregates explicitly mapped
  const selectedBreakdown = selectedProduct === "All" ? null : breakdowns.find((b: any) => b.product === selectedProduct);
  
  const revenue = selectedProduct === "All" ? completeData?.summary?.totalSales : (selectedBreakdown?.revenue || 0);
  const cogs = selectedProduct === "All" ? breakdowns.reduce((sum: number, b: any) => sum + b.cogs, 0) : (selectedBreakdown?.cogs || 0);
  const adSpend = selectedProduct === "All" ? completeData?.summary?.totalAdSpendDzd : (selectedBreakdown?.adSpendDzd || 0);
  const shippingLoss = selectedProduct === "All" ? completeData?.summary?.shippingLosses : (selectedBreakdown?.shippingLoss || 0);
  const netProfit = selectedProduct === "All" ? completeData?.summary?.estimatedNetProfit : (selectedBreakdown?.netProfit || 0);
  const netProfitMargin = revenue > 0 ? (netProfit / revenue) * 100 : 0;

  const financialChartData = [
    { name: 'المداخيل', value: revenue },
    { name: 'تكلفة المنتج', value: cogs },
    { name: 'الإعلانات', value: adSpend },
    { name: 'المرتجعات', value: shippingLoss },
    { name: 'الربح', value: netProfit }
  ];

  const COLORS = {
    "Delivered": "#10b981", // green
    "Pending": "#fbbf24",   // yellow
    "Shipped": "#3b82f6",   // blue
    "Returned": "#ef4444",  // red
    "Confirmed": "#8b5cf6"  // purple if used
  };

  const statusMap: Record<string, string> = {
    "Delivered": "تم التوصيل",
    "Pending": "قيد الانتظار",
    "Shipped": "مشحونة",
    "Returned": "مرتجعة"
  };

  const doughnutData = stats?.chartData?.map((item: any) => ({
    name: statusMap[item.name] || item.name,
    value: item.value,
    originalName: item.name
  })) || [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100 gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/10 rounded-xl text-primary">
            <PieChartIcon size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">تحليلات المنتجات المتقدمة</h1>
            <p className="text-gray-500 text-sm mt-1">تتبع صافي الأرباح وهوامش خسائر التحويل التفصيلية</p>
          </div>
        </div>
        <div className="flex bg-gray-50 items-center justify-between border border-gray-200 px-4 py-2.5 rounded-xl min-w-[300px]">
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-gray-500" />
            <span className="text-sm font-bold text-gray-700">تصفية حسب:</span>
          </div>
          <select 
            className="bg-transparent text-sm font-bold text-primary outline-none focus:ring-0 cursor-pointer"
            value={selectedProduct}
            onChange={(e) => setSelectedProduct(e.target.value)}
          >
            <option value="All">جميع المنتجات (المتجر ككل)</option>
            {stats?.availableProducts?.map((p: string) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
      </div>

      {loading && completeData ? (
        <div className="flex justify-center py-10"><Loader2 className="animate-spin text-primary" size={32} /></div>
      ) : (
        <>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-center relative overflow-hidden">
               <div className="absolute top-0 right-0 w-1.5 h-full bg-blue-500" />
               <p className="text-sm text-gray-500 font-bold mb-1">الطلبات (غير المعالجة)</p>
               <h3 className="text-2xl font-bold text-gray-800" dir="ltr">{stats?.pendingOrders + stats?.shippedOrders}</h3>
               <p className="text-xs text-gray-400 mt-2">انتظار / شحن</p>
            </div>
            
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-center relative overflow-hidden">
               <div className="absolute top-0 right-0 w-1.5 h-full bg-purple-500" />
               <p className="text-sm text-gray-500 font-bold mb-1">الطلبات المحسومة</p>
               <h3 className="text-2xl font-bold text-gray-800" dir="ltr">{stats?.resolvedOrders}</h3>
               <p className="text-xs text-gray-400 mt-2">تسليم / إرجاع</p>
            </div>
            
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-center relative overflow-hidden">
               <div className="absolute top-0 right-0 w-1.5 h-full bg-green-500" />
               <p className="text-sm text-gray-500 font-bold mb-1">معدل التسليم الحقيقي</p>
               <h3 className="text-2xl font-bold text-green-600" dir="ltr">{stats?.deliveryRate}%</h3>
               <p className="text-xs text-green-600/70 mt-2">يحسب من الطلبات المحسومة فقط</p>
            </div>
            
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-center relative overflow-hidden">
               <div className="absolute top-0 right-0 w-1.5 h-full bg-red-500" />
               <p className="text-sm text-gray-500 font-bold mb-1">نسبة الإسترجاع الحقيقية</p>
               <h3 className="text-2xl font-bold text-red-600" dir="ltr">{stats?.returnRate}%</h3>
               <p className="text-xs text-red-600/70 mt-2">يحسب من الطلبات المحسومة فقط</p>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden lg:col-span-1">
              <div className="p-5 border-b border-gray-50 bg-gray-50/50">
                <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <Box size={18} className="text-primary" />
                  الملخص المالي
                </h2>
              </div>
              <div className="p-5 space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-dashed border-gray-100">
                  <span className="text-gray-500 font-medium">المداخيل (مستلم)</span>
                  <span className="font-bold text-gray-800" dir="ltr">{revenue.toLocaleString()} DZD</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-dashed border-gray-100">
                  <span className="text-gray-500 font-medium">تكلفة البضاعة المباعة</span>
                  <span className="font-bold text-blue-600" dir="ltr">- {cogs.toLocaleString()} DZD</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-dashed border-gray-100">
                  <span className="text-gray-500 font-medium">الإنفاق الإعلاني</span>
                  <span className="font-bold text-orange-500" dir="ltr">- {adSpend.toLocaleString()} DZD</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-dashed border-gray-100">
                  <span className="text-gray-500 font-medium">خسائر التوصيل المرتجع</span>
                  <span className="font-bold text-red-500" dir="ltr">- {shippingLoss.toLocaleString()} DZD</span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-lg font-bold text-gray-800">الربح الصافي</span>
                  <span className={`text-xl font-bold ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`} dir="ltr">
                    {netProfit.toLocaleString()} DZD
                  </span>
                </div>
                <div className="mt-4 p-4 rounded-xl flex justify-between items-center border border-gray-100 bg-gray-50">
                   <div className="flex items-center gap-2 text-gray-700">
                     <Percent size={18} />
                     <span className="font-bold text-sm">هامش الربح (Margin)</span>
                   </div>
                   <span className={`text-lg font-bold ${netProfitMargin >= 20 ? 'text-green-600' : netProfitMargin > 0 ? 'text-yellow-600' : 'text-red-600'}`} dir="ltr">
                     {netProfitMargin.toFixed(1)} %
                   </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 lg:col-span-2 flex flex-col items-center">
              <h2 className="text-lg font-bold text-gray-800 mb-6 self-start">مخطط السيولة المالية</h2>
              <div className="w-full h-72 pr-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={financialChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 13, fontWeight: 'bold' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                    <Tooltip 
                      cursor={{ fill: '#F3F4F6' }}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      formatter={(value: any) => [`${Number(value || 0).toLocaleString()} DZD`, 'المبلغ']}
                    />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                      {financialChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={
                          entry.name === 'المداخيل' ? '#10b981' :
                          entry.name === 'تكلفة المنتج' ? '#3b82f6' :
                          entry.name === 'الإعلانات' ? '#f59e0b' :
                          entry.name === 'خسارة الشحن' ? '#ef4444' :
                          (entry.value >= 0 ? '#10b981' : '#ef4444')
                        } />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 lg:col-span-3">
              <h2 className="text-lg font-bold text-gray-800 mb-6 text-center">توزيع حالات الطلبات</h2>
              {doughnutData.length > 0 ? (
                <div className="h-64 w-full" dir="ltr">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={doughnutData}
                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {doughnutData.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[entry.originalName as keyof typeof COLORS] || "#9ca3af"} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value) => [`${value} طلب`, "الكمية"]}
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      />
                      <Legend layout="horizontal" verticalAlign="bottom" align="center" wrapperStyle={{ paddingTop: '20px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex h-48 items-center justify-center text-gray-400">
                  لا توجد بيانات مخطط
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
