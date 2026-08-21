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
    <div className="flex flex-wrap gap-2">
      {TABS.map((tab) => (
        <button
          key={tab}
          type="button"
          className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700"
        >
          {tab}
        </button>
      ))}
    </div>
  );
}
