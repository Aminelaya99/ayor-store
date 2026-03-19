"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ShoppingCart, Package, Megaphone, BarChart3 } from "lucide-react";

const navItems = [
  { name: "لوحة القيادة", href: "/", icon: LayoutDashboard },
  { name: "الطلبات", href: "/orders", icon: ShoppingCart },
  { name: "المخزون", href: "/inventory", icon: Package },
  { name: "الإعلانات", href: "/ads", icon: Megaphone },
  { name: "التحليلات", href: "/analytics", icon: BarChart3 },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white border-l border-gray-200 shadow-sm hidden md:flex flex-col shrink-0 overflow-y-auto">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-primary">Ayor Store</h1>
      </div>
      <nav className="flex-1 px-4 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                isActive
                  ? "bg-primary/10 text-primary font-bold"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 font-medium"
              }`}
            >
              <Icon size={20} className={isActive ? "text-primary" : "text-gray-400"} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
