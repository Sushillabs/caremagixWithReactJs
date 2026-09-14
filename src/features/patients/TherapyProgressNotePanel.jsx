import { useEffect } from "react";
import { useOutletContext } from "react-router-dom";

function InfoGrid({ items, className = "" }) {
  return (
    <div className={`grid grid-cols-1 gap-x-6 gap-y-1.5 sm:grid-cols-3 ${className}`}>
      {items.map(([label, value]) => (
        <div key={label} className="flex gap-1 text-xs">
          <span className="font-medium text-black">{label}:</span>
          <span className="text-gray-700">{value}</span>
        </div>
      ))}
    </div>
  );
}

function LabeledText({ label, text }) {
  return (
    <div>
      <h4 className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-900">{label}</h4>
      <p className="text-sm text-gray-700">{text}</p>
    </div>
  );
}

function NoteSection({ title, children }) {
  return (
    <section className="mb-5">
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-900">{title}</h3>
      {children}
    </section>
  );
}

export default function TherapyProgressNotePanel({ patientName }) {
  // Static content, no chat — hide the docked "Ask anything..." bar while
  // this panel is mounted (same pattern as the other activePanel views).
  const { setAssistantHidden } = useOutletContext() || {};
  useEffect(() => {
    setAssistantHidden?.(true);
    return () => setAssistantHidden?.(false);
  }, [setAssistantHidden]);

  return (
    <div className="flex h-full flex-col overflow-y-auto rounded-lg border border-gray-200 bg-white p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-3">
        <h2 className="text-base font-semibold text-gray-800">Therapy Progress Note</h2>
        {/* <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-600">Static preview</span> */}
      </div>

      <section className="mb-5">
        <InfoGrid
          items={[
            ["Date of Session", "8/9/2023"],
            ["Location of Session", "Virtual"],
            ["Duration of Session", "45 minutes"],
          ]}
        />
      </section>

      <NoteSection title="Patient Demographic Information">
        <InfoGrid
          items={[
            ["Current Name", patientName || "John Doe"],
            ["Date of Birth", "12/12/2000"],
            ["Current Psychiatrist", "John Johns MD"],
          ]}
        />
      </NoteSection>

      <section className="mb-5 space-y-4">
        <LabeledText
          label="Presenting Problem"
          text="Client reports feeling overwhelmed at work and has experienced episodes of panic over the past two weeks."
        />
        <LabeledText
          label="Session Content"
          text="Client discussed recent challenges at work, including increased workload and interpersonal conflicts with a colleague. Expressed feelings of inadequacy and fear of making mistakes. Described a recent panic episode at work that resulted in taking a sick day. Briefly touched on childhood memories of high expectations and related feelings of anxiety."
        />
        <LabeledText
          label="Interventions"
          text="Utilized cognitive restructuring to address maladaptive thought patterns leading to feelings of inadequacy. Taught deep breathing and grounding exercises to manage acute anxiety. Explored past experiences that might contribute to current feelings of anxiety and fear of judgment."
        />
        <LabeledText
          label="Client Response"
          text="The client was receptive to interventions and actively participated in cognitive restructuring exercises. Demonstrated understanding of deep breathing and grounding techniques. Became tearful when discussing childhood memories but expressed appreciation for the opportunity to explore these feelings."
        />
        <LabeledText
          label="Therapist's Observations"
          text="The client is motivated and engaged in therapy. Demonstrates good insight into patterns of behavior and thought. With continued work, I am hopeful that the patient will develop effective coping strategies for managing work-related stress and anxiety."
        />
      </section>

      <NoteSection title="Mental Status Examination">
        <p className="text-sm text-gray-700">
          Client presents in casual attire, appearing untidy. Maintains appropriate eye contact throughout the interview and is cooperative, though
          somewhat reserved. Speech at a normal rate and volume with clear articulation. Client describes mood as "okay" and affect is congruent,
          reflected but euthymic. Thought processes are linear and goal-directed. Thought content is without any overt delusions. No suicidal or
          homicidal ideation. Cognition appears intact, alert, and oriented to person, place, and time. Client demonstrates good immediate recall.
          Insight into current situation seems partially limited and judgment appears adequate.
        </p>
      </NoteSection>

      <NoteSection title="Risk Assessment">
        <p className="text-sm text-gray-700">No indications of suicidal or homicidal ideation. No concerns about harm to self or others currently.</p>
      </NoteSection>

      <NoteSection title="Diagnostic Impressions">
        <p className="text-sm text-gray-700">
          Major Depressive Disorder, Recurrent, Moderate
          <br />
          Generalized Anxiety Disorder
        </p>
      </NoteSection>

      <NoteSection title="Plan for Next Session">
        <p className="text-sm text-gray-700">
          Continue to delve into past experiences and unveil connections to current feelings of anxiety. Begin discussing strategies for effective
          communication and assertiveness at work. Review homework assignments and progress in cognitive restructuring.
        </p>
        <InfoGrid items={[["Return to Clinic", "Every week"]]} className="mt-3" />
        <p className="mt-3 text-xs text-gray-500">
          Note: If client exhibits any of the following symptoms, please instruct the client to call 911 or go to the nearest emergency room:
          experiencing acute distress, homicidal thoughts, or suicidal ideation with no enjoyment or relief from therapeutic interventions.
        </p>
      </NoteSection>
    </div>
  );
}
