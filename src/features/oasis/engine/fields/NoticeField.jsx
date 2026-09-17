export default function NoticeField({ field }) {
  const warn = field.variant === "warn";
  return (
    <div
      className={
        "my-3 rounded-lg border px-4 py-3 text-xs leading-relaxed " +
        (warn ? "border-amber-300 bg-amber-50 text-amber-900" : "border-gray-200 bg-gray-50 text-gray-600")
      }
    >
      {field.title && <div className="mb-1 text-sm font-semibold text-gray-800">{field.title}</div>}
      {field.lines?.map((line, i) => (
        <p key={i} className={i > 0 ? "mt-1.5" : undefined}>
          {line}
        </p>
      ))}
    </div>
  );
}
