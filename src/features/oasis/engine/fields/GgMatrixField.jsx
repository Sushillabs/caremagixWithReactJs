import { useFormContext } from "react-hook-form";
import FieldShell from "./FieldShell";

// GG0130/GG0170 one-code-per-row table (§b). Each row is a free-text code box —
// never a radio group or dropdown per row; the valid code set is documented as prose
// above the table (field.label), not repeated per row. `columnLabel` is form-specific
// display text (e.g. SOC's "SOC Code" vs FU's "Follow-up Performance").
export default function GgMatrixField({ field }) {
  const { register } = useFormContext();
  return (
    <FieldShell field={field}>
      <div className="overflow-x-auto">
        <table className="w-full max-w-2xl text-sm border-collapse">
          <thead>
            <tr className="border-b">
              <th className="text-left py-1 font-medium text-gray-600">Activity</th>
              <th className="w-28 py-1 font-medium text-gray-600">{field.columnLabel ?? "Code"}</th>
            </tr>
          </thead>
          <tbody>
            {field.rows?.map((row) => (
              <tr key={row.fieldId} className="border-b border-gray-100">
                <td className="py-1.5">{row.label}</td>
                <td className="py-1.5 text-center">
                  <input
                    type="text"
                    maxLength={2}
                    placeholder="—"
                    {...register(row.fieldId)}
                    className="w-14 border rounded-lg px-2 py-1 text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </FieldShell>
  );
}
