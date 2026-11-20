const hasText = (value) => String(value || "").trim().length > 0;

// Drops rows the physician added but left empty.
export default function cleanPlan(draft) {
  const exam = draft.exam || {};
  const ap = draft.assessment_and_plan || {};
  return {
    ...draft,
    exam: {
      ...exam,
      in_office_preliminary_read: {
        ...exam.in_office_preliminary_read,
        findings: (exam.in_office_preliminary_read?.findings || []).filter(hasText),
      },
      labs_ordered_today: (exam.labs_ordered_today || []).filter((lab) => hasText(lab.test)),
    },
    assessment_and_plan: {
      ...ap,
      plan: (ap.plan || []).filter((item) => hasText(item.action)),
      interaction_and_safety: (ap.interaction_and_safety || []).filter((item) => hasText(item.text)),
    },
    prevention_checklist: (draft.prevention_checklist || []).filter((item) => hasText(item.action || item.item)),
    physician_actions: (draft.physician_actions || []).filter((item) => hasText(item.item) || hasText(item.action)),
  };
}
