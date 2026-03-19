"use client";

import { useEffect, useState } from "react";
import { Loader2, Package, Save, CheckCircle2, Trash2 } from "lucide-react";

export default function InventoryPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [clearingAll, setClearingAll] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const fetchProducts = () => {
    Promise.all([
      fetch("/api/products").then(res => res.json()),
      fetch("/api/stats").then(res => res.json())
    ]).then(([prodData, statsData]) => {
      const soldMap: Record<string, number> = {};
      if (statsData.profitBreakdowns) {
        statsData.profitBreakdowns.forEach((b: any) => {
          soldMap[b.product] = b.qtyDelivered || b.deliveredCount; 
        });
      }
      
      const formatted = prodData.map((p: any) => ({
        ...p,
        soldQuantity: soldMap[p.name] || 0
      }));
      setProducts(formatted);
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleUpdate = async (product: any) => {
    setSavingId(product.id);
    const res = await fetch(`/api/products/${product.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        costPriceDzd: product.costPriceDzd,
        sellingPrice: product.sellingPrice,
        initialStock: product.initialStock
      })
    });
    
    if (res.ok) {
      setToast(`تم تحديث إعدادات المنتج ${product.name} بنجاح`);
      setTimeout(() => setToast(null), 3000);
      fetchProducts();
    }
    setSavingId(null);
  };

  const handleDelete = async (product: any) => {
    if (!confirm(`هل أنت متأكد من حذف المنتج "${product.name}" نهائياً من قاعدة البيانات؟ \nسنبقي على أي طلبات سابقة مرتبطة به، ولكن سيتم حذف إعدادات التسعير الخاصة به.`)) return;
    setDeletingId(product.id);
    const res = await fetch(`/api/products/${product.id}`, { method: "DELETE" });
    if (res.ok) {
      setToast(`تم حذف المنتج ${product.name} بنجاح`);
      setTimeout(() => setToast(null), 3000);
      fetchProducts();
    }
    setDeletingId(null);
  };

  const handleClearAll = async () => {
    if (!confirm("تحذير إداري: هل أنت متأكد من رغبتك في حذف كافة المنتجات من الإعدادات؟ \nستبقى الطلبات المحفوظة آمنة، لكن يتم إفراغ إعدادات الأسعار والمخزون بالكامل.")) return;
    setClearingAll(true);
    const res = await fetch("/api/products", { method: "DELETE" });
    if (res.ok) {
      setToast("تم حذف كافة المنتجات وتنظيف المخزون بنجاح");
      setTimeout(() => setToast(null), 3000);
      fetchProducts();
    }
    setClearingAll(false);
  };

  const handleFieldChange = (id: string, field: string, value: string) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, [field]: Number(value) } : p));
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100 gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/10 rounded-xl text-primary">
            <Package size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">إدارة المخزون والتسعير</h1>
            <p className="text-gray-500 text-sm mt-1">يُرجى تحديث أسعار الشراء والبيع لمزامنة الأرباح آلياً</p>
          </div>
        </div>
        <button 
          onClick={handleClearAll}
          disabled={clearingAll || products.length === 0}
          className="bg-red-50 hover:bg-red-100 text-red-600 px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
        >
          {clearingAll ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
          حذف كافة المنتجات
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
             <div className="flex h-64 items-center justify-center">
               <Loader2 className="animate-spin text-primary" size={32} />
             </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm">
              <thead className="bg-gray-50 border-b border-gray-100 text-gray-600">
                <tr>
                  <th className="px-6 py-4 font-medium">اسم المنتج</th>
                  <th className="px-6 py-4 font-medium text-center">تكلفة الشراء (دج)</th>
                  <th className="px-6 py-4 font-medium text-center">سعر البيع (دج)</th>
                  <th className="px-6 py-4 font-medium text-center">المخزون الأولي</th>
                  <th className="px-6 py-4 font-medium text-center">المباع</th>
                  <th className="px-6 py-4 font-medium text-center">المتبقي</th>
                  <th className="px-6 py-4 font-medium text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {products.map((p) => {
                  const remaining = p.initialStock - p.soldQuantity;
                  return (
                    <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 font-bold text-gray-800">{p.name}</td>
                      <td className="px-6 py-4">
                        <input 
                          type="number" 
                          value={p.costPriceDzd} 
                          onChange={(e) => handleFieldChange(p.id, 'costPriceDzd', e.target.value)}
                          className="w-full min-w-[100px] text-center bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <input 
                          type="number" 
                          value={p.sellingPrice} 
                          onChange={(e) => handleFieldChange(p.id, 'sellingPrice', e.target.value)}
                          className="w-full min-w-[100px] text-center bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <input 
                          type="number" 
                          value={p.initialStock} 
                          onChange={(e) => handleFieldChange(p.id, 'initialStock', e.target.value)}
                          className="w-full min-w-[100px] text-center bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                        />
                      </td>
                      <td className="px-6 py-4 text-center font-medium text-gray-500">{p.soldQuantity}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${remaining <= 0 && p.initialStock > 0 ? 'bg-red-100 text-red-600' : remaining < 10 && p.initialStock > 0 ? 'bg-yellow-100 text-yellow-600' : 'bg-gray-100 text-gray-600'}`}>
                          {remaining}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button 
                            onClick={() => handleUpdate(p)}
                            disabled={savingId === p.id || deletingId === p.id}
                            className="bg-primary hover:bg-primary/90 text-white p-2 rounded-lg transition-all cursor-pointer disabled:opacity-50"
                            title="حفظ التعديلات"
                          >
                            {savingId === p.id ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                          </button>
                          <button 
                            onClick={() => handleDelete(p)}
                            disabled={savingId === p.id || deletingId === p.id}
                            className="bg-red-50 hover:bg-red-100 text-red-500 p-2 rounded-lg transition-all cursor-pointer disabled:opacity-50"
                            title="حذف المنتج من السجل"
                          >
                            {deletingId === p.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {products.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">لا توجد منتجات حالياً. يرجى المزامنة مع Google Sheets لجلب المنتجات آلياً أو سيتم إضافتها تلقائياً.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {toast && (
        <div className="fixed bottom-6 right-6 bg-gray-900 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5 z-50">
          <CheckCircle2 size={20} className="text-green-400" />
          <span className="font-medium text-sm">{toast}</span>
        </div>
      )}
    </div>
  );
}
