const TABS = [
  "AI Agents",
  "Interactive Contact Scheduler",
  "Non Face 2 Face service",
  "Face 2 Face Service",
  "Billing",
  "Follow up and coordination",
  "Physician Fee Schedule FAQ",
];

// Static tab row per Figma — no behavior wired yet.
export default function TransitionCareServicesPage() {
  return (
    <div className="flex flex-col gap-1.5">
      {TABS.map((tab) => (
        <button
          key={tab}
          type="button"
          className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-left text-xs text-gray-700 hover:bg-gray-50"
        >
          {tab}
        </button>
      ))}
    </div>
  );
}
