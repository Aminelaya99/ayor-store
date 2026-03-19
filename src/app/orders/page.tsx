"use client";

import { useEffect, useState } from "react";
import { Loader2, Plus, Edit2, RefreshCw, CheckCircle2, Trash2, Filter } from "lucide-react";

type Order = {
  id: string;
  customerName: string;
  phone: string;
  wilaya: string;
  product: string;
  qty: number;
  totalPrice: number;
  status: string;
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [showModal, setShowModal] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  
  const [updating, setUpdating] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [toast, setToast] = useState<{msg: string, type: 'success' | 'error'} | null>(null);
  const [productsList, setProductsList] = useState<any[]>([]);

  // Filters
  const [filterProduct, setFilterProduct] = useState("All");
  const [filterWilaya, setFilterWilaya] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");

  const fetchOrders = () => {
    fetch("/api/orders")
      .then(res => res.json())
      .then(data => {
        setOrders(data);
        setLoading(false);
        setShowModal(false);
        setEditingOrder(null);
      });
  };

  useEffect(() => {
    fetchOrders();
    fetch("/api/products").then(res => res.json()).then(data => setProductsList(data));
  }, []);

  const handleSync = async () => {
    setSyncing(true);
    setToast(null);
    try {
      const res = await fetch("/api/orders/sync", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setToast({ msg: `تمت المزامنة بنجاح: تم إضافة ${data.imported} وتحديث ${data.updated} طلب`, type: 'success' });
        fetchOrders();
      } else {
        setToast({ msg: `خطأ المزامنة: ${data.error || "خطأ غير معروف"}`, type: 'error' });
      }
    } catch (err: any) {
      setToast({ msg: `حدث خطأ أثناء الاتصال بالخادم: ${err.message}`, type: 'error' });
    }
    setTimeout(() => setToast(null), 6000);
    setSyncing(false);
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    setUpdating(id);
    await fetch(`/api/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus })
    });
    setUpdating(null);
    fetchOrders();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا الطلب نهائياً؟")) return;
    const res = await fetch(`/api/orders/${id}`, { method: "DELETE" });
    if (res.ok) {
      setToast({ msg: "تم حذف الطلب بنجاح", type: "success" });
      setTimeout(() => setToast(null), 4000);
      fetchOrders();
    }
  };

  const uniqueProducts = productsList.map(p => p.name).filter(Boolean);
  const uniqueWilayas = Array.from(new Set(orders.map(o => o.wilaya))).filter(Boolean);

  const filteredOrders = orders.filter(o => {
    if (filterProduct !== "All" && o.product !== filterProduct) return false;
    if (filterWilaya !== "All" && o.wilaya !== filterWilaya) return false;
    if (filterStatus !== "All" && o.status !== filterStatus) return false;
    return true;
  });

  const StatusBadge = ({ status }: { status: string }) => {
    const colors: Record<string, string> = {
      Pending: "bg-yellow-100 text-yellow-800",
      Shipped: "bg-blue-100 text-blue-800",
      Delivered: "bg-green-100 text-green-800",
      Returned: "bg-red-100 text-red-800"
    };
    const labels: Record<string, string> = {
      Pending: "قيد الانتظار",
      Shipped: "مشحون",
      Delivered: "مستلم",
      Returned: "مرتجع"
    };
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${colors[status] || "bg-gray-100 text-gray-800"}`}>
        {labels[status] || status}
      </span>
    );
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col md:flex-row justify-between md:items-center bg-white p-4 rounded-2xl shadow-sm border border-gray-100 gap-4">
        <h1 className="text-2xl font-bold text-gray-800">إدارة الطلبات</h1>
        <div className="flex flex-wrap gap-3">
          <button 
            onClick={handleSync} 
            disabled={syncing}
            className="bg-green-100 hover:bg-green-200 text-green-700 px-4 py-2 flex items-center gap-2 rounded-xl text-sm font-medium transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw size={18} className={syncing ? "animate-spin" : ""} />
            <span>{syncing ? "جاري المزامنة..." : "مزامنة Google Sheets"}</span>
          </button>
          <button onClick={() => setShowModal(true)} className="bg-primary hover:bg-primary/90 text-white px-4 py-2 flex items-center gap-2 rounded-xl text-sm font-medium transition-colors cursor-pointer">
            <Plus size={18} />
            <span>إضافة طلب جديد</span>
          </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2 text-gray-500">
          <Filter size={18} />
          <span className="text-sm font-medium">تصفية حسب:</span>
        </div>
        <select value={filterProduct} onChange={e => setFilterProduct(e.target.value)} className="bg-gray-50 border border-gray-200 text-sm rounded-lg px-3 py-2 outline-none">
          <option value="All">جميع المنتجات</option>
          {uniqueProducts.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        <select value={filterWilaya} onChange={e => setFilterWilaya(e.target.value)} className="bg-gray-50 border border-gray-200 text-sm rounded-lg px-3 py-2 outline-none">
          <option value="All">جميع الولايات</option>
          {uniqueWilayas.map(w => <option key={w} value={w}>{w}</option>)}
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="bg-gray-50 border border-gray-200 text-sm rounded-lg px-3 py-2 outline-none">
          <option value="All">جميع الحالات</option>
          <option value="Pending">قيد الانتظار</option>
          <option value="Shipped">مشحون</option>
          <option value="Delivered">مستلم</option>
          <option value="Returned">مرتجع</option>
        </select>
        <div className="mr-auto text-sm text-gray-500 font-medium">
          العدد: {filteredOrders.length}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="animate-spin text-primary" size={32} />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead className="bg-gray-50 border-b border-gray-100 text-gray-600 text-sm">
                <tr>
                  <th className="px-6 py-4 font-medium">العميل</th>
                  <th className="px-6 py-4 font-medium">الهاتف</th>
                  <th className="px-6 py-4 font-medium">الولاية</th>
                  <th className="px-6 py-4 font-medium">المنتج (الكمية)</th>
                  <th className="px-6 py-4 font-medium">الإجمالي (دج)</th>
                  <th className="px-6 py-4 font-medium">الحالة</th>
                  <th className="px-6 py-4 font-medium text-center">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">{order.customerName}</td>
                    <td className="px-6 py-4 text-gray-500" dir="ltr">{order.phone}</td>
                    <td className="px-6 py-4 text-gray-600">{order.wilaya}</td>
                    <td className="px-6 py-4 text-gray-600 truncate max-w-[200px]">{order.product} <span className="text-gray-400">x{order.qty}</span></td>
                    <td className="px-6 py-4 font-bold text-gray-800" dir="ltr">{order.totalPrice.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <select 
                        disabled={updating === order.id}
                        className="bg-transparent border-0 text-sm font-medium focus:ring-0 cursor-pointer w-full"
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      >
                        <option value="Pending">قيد الانتظار</option>
                        <option value="Shipped">مشحون</option>
                        <option value="Delivered">مستلم</option>
                        <option value="Returned">مرتجع</option>
                      </select>
                      <div className="mt-1"><StatusBadge status={order.status} /></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => setEditingOrder(order)} className="text-blue-500 hover:text-blue-700 p-1.5 rounded-md hover:bg-blue-50 transition-colors">
                          <Edit2 size={18} />
                        </button>
                        <button onClick={() => handleDelete(order.id)} className="text-red-500 hover:text-red-700 p-1.5 rounded-md hover:bg-red-50 transition-colors">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredOrders.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">لا توجد طلبات تطابق معايير البحث</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {(showModal || editingOrder) && (
        <OrderFormModal 
          order={editingOrder} 
          productsList={productsList}
          onClose={() => { setShowModal(false); setEditingOrder(null); }} 
          onRefresh={fetchOrders} 
        />
      )}

      {toast && (
        <div className={`fixed bottom-6 right-6 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5 z-50 ${toast.type === 'error' ? 'bg-red-600' : 'bg-gray-900'}`}>
          <CheckCircle2 size={20} className={toast.type === 'error' ? 'text-red-200' : 'text-green-400'} />
          <span className="font-medium text-sm">{toast.msg}</span>
        </div>
      )}
    </div>
  );
}

function OrderFormModal({ order, productsList, onClose, onRefresh }: { order: Order | null, productsList: any[], onClose: () => void, onRefresh: () => void }) {
  const [saving, setSaving] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(order?.product || (productsList.length > 0 ? productsList[0].name : ""));
  
  // Find default selling price based on selected product natively parsed 
  const matchingProduct = productsList.find(p => p.name === selectedProduct);
  const matchedPrice = matchingProduct ? matchingProduct.sellingPrice : 0;
  
  const [totalPriceProxy, setTotalPriceProxy] = useState<number>(order ? order.totalPrice : matchedPrice);

  // If selected product changes dynamically for new orders without explicit types
  useEffect(() => {
    if (!order && matchingProduct) {
      setTotalPriceProxy(matchingProduct.sellingPrice);
    }
  }, [selectedProduct, matchingProduct, order]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    const formData = new FormData(e.currentTarget);
    const data = {
      customerName: formData.get("customerName"),
      phone: formData.get("phone"),
      wilaya: formData.get("wilaya"),
      product: formData.get("product"),
      qty: Number(formData.get("qty")),
      totalPrice: Number(formData.get("totalPrice")),
      status: order ? formData.get("status") : "Pending"
    };

    if (order) {
      await fetch(`/api/orders/${order.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
    } else {
      await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
    }
    
    onRefresh();
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-lg p-6 shadow-xl relative animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">{order ? "تعديل الطلب" : "إضافة طلب جديد"}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer">✕</button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">اسم العميل</label>
              <input required defaultValue={order?.customerName} name="customerName" type="text" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">الهاتف</label>
              <input required defaultValue={order?.phone} name="phone" type="text" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">الولاية</label>
              <input required defaultValue={order?.wilaya} name="wilaya" type="text" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">الكمية (Qty)</label>
              <input required defaultValue={order?.qty || 1} name="qty" type="number" min="1" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">المنتج</label>
            <input required value={selectedProduct} onChange={e => setSelectedProduct(e.target.value)} name="product" type="text" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">السعر الإجمالي (دج)</label>
              <input required value={totalPriceProxy} onChange={(e) => setTotalPriceProxy(Number(e.target.value))} name="totalPrice" type="number" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
              <p className="text-xs text-gray-400 mt-1">سعر البيع الافتراضي للمنتج: ({matchedPrice} دج)</p>
            </div>
            {order && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">حالة الطلب</label>
                <select required defaultValue={order.status} name="status" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all">
                  <option value="Pending">قيد الانتظار</option>
                  <option value="Shipped">مشحون</option>
                  <option value="Delivered">مستلم</option>
                  <option value="Returned">مرتجع</option>
                </select>
              </div>
            )}
          </div>
          
          <div className="pt-4 flex gap-3">
            <button type="submit" disabled={saving} className="flex-1 bg-primary hover:bg-primary/90 text-white font-medium py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer">
              {saving && <Loader2 className="animate-spin" size={18} />}
              <span>{order ? "حفظ التعديلات" : "تأكيد الطلب"}</span>
            </button>
            <button type="button" onClick={onClose} className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-all cursor-pointer">
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
