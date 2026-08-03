export default function StatCard({ icon: Icon, value, label, accent = "text-emerald-600", iconBg = "bg-emerald-50" }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${iconBg}`}>
        {Icon && <Icon size={20} className={accent} />}
      </div>
      <div className="text-right">
        <div className={`text-2xl font-semibold ${accent}`}>{value}</div>
        <div className="text-xs text-gray-500">{label}</div>
      </div>
    </div>
  );
}
