export default function NoticeField({ field }) {
  const warn = field.variant === "warn";
  return (
    <div
      className={
        "rounded-lg border px-4 py-3 " +
        (warn ? "border-amber-200 bg-amber-50" : "border-gray-200 bg-white")
      }
    >
      {field.title && (
        <p className={"mb-1.5 text-sm font-medium " + (warn ? "text-amber-900" : "text-gray-800")}>{field.title}</p>
      )}
      {field.lines?.map((line, i) => (
        <p
          key={i}
          className={
            "text-xs leading-relaxed " + (warn ? "text-amber-800" : "text-gray-500") + (i > 0 ? " mt-1.5" : "")
          }
        >
          {line}
        </p>
      ))}
    </div>
  );
}
