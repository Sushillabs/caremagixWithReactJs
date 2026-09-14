export default function StatCard({ icon: Icon, value, label, accent = "text-emerald-600", iconBg = "bg-emerald-50", onClick }) {
  const Tag = onClick ? "button" : "div";
  return (
    <Tag
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={`flex w-full items-center justify-between rounded-xl border border-gray-100 bg-white p-4 text-left shadow-sm ${
        onClick ? "cursor-pointer transition-shadow hover:shadow-md" : ""
      }`}
    >
      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${iconBg}`}>{Icon && <Icon size={20} className={accent} />}</div>
      <div className="text-right">
        <div className={`text-2xl font-semibold ${accent}`}>{value}</div>
        <div className="text-xs text-gray-500">{label}</div>
      </div>
    </Tag>
  );
}
