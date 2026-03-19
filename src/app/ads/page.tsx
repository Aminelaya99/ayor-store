"use client";

import { useEffect, useState } from "react";
import { Loader2, Plus, Edit2, Trash2, CheckCircle2 } from "lucide-react";

export default function AdsPage() {
  const [ads, setAds] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [editingAd, setEditingAd] = useState<any | null>(null);

  const fetchAds = () => {
    fetch("/api/ads")
      .then(res => res.json())
      .then(data => {
        setAds(data);
        setLoading(false);
      });
  };

  const fetchProducts = () => {
    fetch("/api/products")
      .then(res => res.json())
      .then(data => setProducts(data));
  };

  useEffect(() => {
    fetchAds();
    fetchProducts();
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    const res = await fetch("/api/ads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        platform: formData.get("platform"),
        spendUsd: Number(formData.get("spendUsd")),
        date: formData.get("date") || new Date().toISOString(),
        productId: formData.get("productId") || null
      })
    });
    
    if (res.ok) {
      showToast("تمت إضافة الإنفاق بنجاح");
      form.reset();
      fetchAds();
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا السجل؟")) return;
    
    const res = await fetch(`/api/ads/${id}`, { method: "DELETE" });
    if (res.ok) {
      setAds(prev => prev.filter(ad => ad.id !== id));
      showToast("تم حذف السجل بنجاح");
    }
  };

  const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    const res = await fetch(`/api/ads/${editingAd.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        platform: formData.get("platform"),
        spendUsd: Number(formData.get("spendUsd")),
        date: formData.get("date"),
        productId: formData.get("productId") || null
      })
    });
    
    if (res.ok) {
      showToast("تم تحديث السجل بنجاح");
      setEditingAd(null);
      fetchAds();
    }
    setSaving(false);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto relative">
      <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
        <h1 className="text-2xl font-bold text-gray-800">إدارة الإعلانات</h1>
        <div className="bg-[#107c41]/10 text-[#107c41] px-4 py-1.5 rounded-full text-sm font-bold">1 USD = 250 DZD</div>
      </div>

      <div className="grid md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 md:col-span-1 h-fit">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Plus size={18} className="text-primary" />
            إضافة إنفاق 
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">نوع الحملة (المنتج)</label>
              <select name="productId" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all">
                <option value="">مصاريف عامة للمتجر</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">المنصة</label>
              <select required name="platform" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all">
                <option value="Facebook">فيسبوك (Facebook)</option>
                <option value="TikTok">تيك توك (TikTok)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">المبلغ (USD)</label>
              <input required name="spendUsd" type="number" step="0.01" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">التاريخ</label>
              <input name="date" type="date" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-right" />
            </div>
            <button type="submit" disabled={saving} className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-3 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer mt-2">
              {saving ? <Loader2 className="animate-spin" size={18} /> : <span>حفظ </span>}
            </button>
          </form>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden md:col-span-3">
          {loading ? (
             <div className="flex h-64 items-center justify-center">
               <Loader2 className="animate-spin text-primary" size={32} />
             </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-right">
                <thead className="bg-gray-50 border-b border-gray-100 text-gray-600 text-sm">
                  <tr>
                    <th className="px-6 py-4 font-medium">التاريخ</th>
                    <th className="px-6 py-4 font-medium">المنصة</th>
                    <th className="px-6 py-4 font-medium">الحملة</th>
                    <th className="px-6 py-4 font-medium">USD</th>
                    <th className="px-6 py-4 font-medium">DZD</th>
                    <th className="px-6 py-4 font-medium">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {ads.map((ad) => (
                    <tr key={ad.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 text-gray-500" dir="ltr">
                        {new Date(ad.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-700">
                        {ad.platform === 'Facebook' ? (
                          <span className="text-blue-600 bg-blue-50 px-2 py-1 rounded-md text-xs font-bold">Facebook</span>
                        ) : (
                          <span className="text-black bg-gray-100 px-2 py-1 rounded-md text-xs font-bold">TikTok</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-gray-600 font-medium">
                        {ad.product ? ad.product.name : <span className="text-gray-400">ميزانية عامة</span>}
                      </td>
                      <td className="px-6 py-4 font-bold text-gray-800" dir="ltr">${ad.spendUsd.toFixed(2)}</td>
                      <td className="px-6 py-4 font-bold text-gray-800" dir="ltr">{ad.spendDzd.toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button onClick={() => setEditingAd(ad)} className="text-blue-500 hover:text-blue-700 p-1.5 rounded-md hover:bg-blue-50 transition-colors">
                            <Edit2 size={16} />
                          </button>
                          <button onClick={() => handleDelete(ad.id)} className="text-red-500 hover:text-red-700 p-1.5 rounded-md hover:bg-red-50 transition-colors">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {ads.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-gray-500">لا يوجد انفاق مسجل</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {editingAd && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-xl relative animate-in fade-in zoom-in-95 duration-200">
            <h2 className="text-xl font-bold text-gray-900 mb-6">تعديل الإنفاق</h2>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">نوع الحملة (المنتج)</label>
                <select defaultValue={editingAd.productId || ""} name="productId" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all">
                  <option value="">مصاريف عامة للمتجر</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">المنصة</label>
                <select defaultValue={editingAd.platform} required name="platform" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all">
                  <option value="Facebook">فيسبوك (Facebook)</option>
                  <option value="TikTok">تيك توك (TikTok)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">المبلغ (USD)</label>
                <input defaultValue={editingAd.spendUsd} required name="spendUsd" type="number" step="0.01" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">التاريخ</label>
                <input defaultValue={new Date(editingAd.date).toISOString().split('T')[0]} name="date" type="date" required className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-right" />
              </div>
              <div className="pt-4 flex gap-3">
                <button type="submit" disabled={saving} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer">
                  {saving && <Loader2 className="animate-spin" size={18} />}
                  <span>تحديث</span>
                </button>
                <button type="button" onClick={() => setEditingAd(null)} className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-all cursor-pointer">
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-6 right-6 bg-gray-900 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5 z-50">
          <CheckCircle2 size={20} className="text-green-400" />
          <span className="font-medium text-sm">{toast}</span>
        </div>
      )}
    </div>
  );
}
