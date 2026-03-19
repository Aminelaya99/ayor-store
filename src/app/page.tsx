"use client";

import { useEffect, useState } from "react";
import { Loader2, DollarSign, TrendingUp, TrendingDown, Package, Activity, Inbox, Truck, CheckCircle, XCircle } from "lucide-react";

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/stats")
      .then(res => res.json())
      .then(data => {
        setStats(data);
        setLoading(false);
      });
  }, []);

  if (loading || !stats) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  const { summary, profitBreakdowns } = stats;
  const statusCounts = summary.globalStatusCounts || {};

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-3 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="p-3 bg-primary/10 rounded-xl text-primary">
          <Activity size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">الرئيسية (لوحة القيادة)</h1>
          <p className="text-gray-500 text-sm mt-1">نظرة عامة على الأداء المالي وحالة الطلبات</p>
        </div>
      </div>

      <div className="grid md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 transition-all hover:shadow-md">
          <div className="bg-blue-50 text-blue-600 p-4 rounded-xl"><DollarSign size={28} /></div>
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">إجمالي المبيعات (المستلمة)</p>
            <p className="text-2xl font-bold text-gray-800" dir="ltr">{summary.totalSales.toLocaleString()} DZD</p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 transition-all hover:shadow-md">
          <div className="bg-orange-50 text-orange-500 p-4 rounded-xl"><TrendingDown size={28} /></div>
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">الإنفاق الإعلاني الشامل</p>
            <p className="text-2xl font-bold text-gray-800" dir="ltr">{summary.totalAdSpendDzd.toLocaleString()} DZD</p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 transition-all hover:shadow-md">
          <div className="bg-red-50 text-red-500 p-4 rounded-xl"><Package size={28} /></div>
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">خسائر الشحن (مرتجعات)</p>
            <p className="text-2xl font-bold text-gray-800" dir="ltr">{summary.shippingLosses.toLocaleString()} DZD</p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 transition-all hover:shadow-md relative overflow-hidden">
          <div className="absolute top-0 right-0 w-2 h-full bg-primary" />
          <div className="bg-green-50 text-green-600 p-4 rounded-xl"><TrendingUp size={28} /></div>
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">صافي الربح التقديري للمتجر</p>
            <p className={`text-2xl font-bold ${summary.estimatedNetProfit >= 0 ? "text-green-600" : "text-red-600"}`} dir="ltr">
              {summary.estimatedNetProfit.toLocaleString()} DZD
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center gap-3">
          <div className="p-2.5 bg-gray-100 text-gray-600 rounded-lg"><Activity size={20} /></div>
          <div>
            <p className="text-xs text-gray-500 font-bold">إجمالي الطلبات</p>
            <p className="text-xl font-bold text-gray-800" dir="ltr">{summary.globalTotalOrders || 0}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center gap-3">
          <div className="p-2.5 bg-yellow-50 text-yellow-500 rounded-lg"><Inbox size={20} /></div>
          <div>
            <p className="text-xs text-yellow-600 font-bold">قيد الانتظار</p>
            <p className="text-xl font-bold text-gray-800" dir="ltr">{statusCounts['Pending'] || 0}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center gap-3">
          <div className="p-2.5 bg-blue-50 text-blue-500 rounded-lg"><Truck size={20} /></div>
          <div>
            <p className="text-xs text-blue-600 font-bold">مشحونة</p>
            <p className="text-xl font-bold text-gray-800" dir="ltr">{statusCounts['Shipped'] || 0}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center gap-3">
          <div className="p-2.5 bg-green-50 text-green-500 rounded-lg"><CheckCircle size={20} /></div>
          <div>
            <p className="text-xs text-green-600 font-bold">مستلمة</p>
            <p className="text-xl font-bold text-gray-800" dir="ltr">{statusCounts['Delivered'] || 0}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center gap-3">
          <div className="p-2.5 bg-red-50 text-red-500 rounded-lg"><XCircle size={20} /></div>
          <div>
            <p className="text-xs text-red-600 font-bold">مرتجعة</p>
            <p className="text-xl font-bold text-gray-800" dir="ltr">{statusCounts['Returned'] || 0}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-800">نظرة عامة على المنتجات والمخزون</h2>
          <p className="text-sm text-gray-500 mt-1">توزيع أعداد الطلبات وحالاتها لكل منتج على حدى</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead className="bg-gray-50 text-gray-600 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 font-medium">المنتج</th>
                <th className="px-4 py-4 font-medium">إجمالي الطلبات</th>
                <th className="px-4 py-4 font-medium text-yellow-600">قيد الانتظار</th>
                <th className="px-4 py-4 font-medium text-blue-600">مشحونة</th>
                <th className="px-4 py-4 font-medium text-green-600">مستلمة</th>
                <th className="px-4 py-4 font-medium text-red-600">مرتجعة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {profitBreakdowns.map((b: any, index: number) => (
                <tr key={index} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 font-bold text-gray-800">{b.product}</td>
                  <td className="px-4 py-4 font-bold text-gray-600">{b.totalOrdersCount}</td>
                  <td className="px-4 py-4 font-medium text-yellow-600">{b.pendingCount}</td>
                  <td className="px-4 py-4 font-medium text-blue-600">{b.shippedCount}</td>
                  <td className="px-4 py-4 font-medium text-green-600">{b.deliveredCount}</td>
                  <td className="px-4 py-4 font-medium text-red-500">{b.returnedCount}</td>
                </tr>
              ))}
              {profitBreakdowns.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-400">لا يوجد بيانات للمنتجات حتى الآن</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
