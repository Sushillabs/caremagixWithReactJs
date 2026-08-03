import { useOutletContext } from "react-router-dom";
import { Construction } from "lucide-react";

// Placeholder for sections whose real screen ships in a later phase.
// Reads the active section from the shell so the title stays accurate.
export default function ComingSoon() {
  const { section } = useOutletContext() || {};
  return (
    <div className="flex h-full flex-col items-center justify-center text-center text-gray-500">
      <Construction size={40} className="mb-3 text-emerald-500" />
      <h2 className="text-lg font-medium text-gray-700">{section?.label || "Section"}</h2>
      <p className="mt-1 text-sm">This section is coming in a later phase.</p>
    </div>
  );
}
