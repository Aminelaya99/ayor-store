export default function Header() {
  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm shrink-0">
      <h2 className="text-xl font-medium text-gray-800">إدارة المتجر</h2>
      <div className="flex items-center gap-4">
        <div className="bg-[#107c41]/10 text-[#107c41] px-4 py-1.5 rounded-full text-sm font-bold">
          سعر الصرف: 1 USD = 250 DZD
        </div>
      </div>
    </header>
  );
}
