import type { Member } from "@/types/member";
import {
  buildDisplayName,
} from "@/utils/memberNames";

type SummaryMemberProps = {
  member: Member;
  status: string;
  present?: boolean;
};

export default function SummaryMember({
  member,
  status,
  present = false,
}: SummaryMemberProps) {
  return (
    <article className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 p-4">
      <div>
        <h3 className="font-bold">
          {buildDisplayName(member)}
        </h3>

        <p className="text-sm text-slate-500">
          {member.family_name || "Sin familia"} ·{" "}
          {member.organization}
        </p>
      </div>

      <span
        className={`rounded-full px-3 py-1 text-xs font-bold ${
          present
            ? "bg-emerald-100 text-emerald-800"
            : "bg-amber-100 text-amber-800"
        }`}
      >
        {status}
      </span>
    </article>
  );
}