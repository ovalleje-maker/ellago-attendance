import type { Member } from "@/types/member";
import type {
  MemberAttendanceHistoryItem,
} from "@/services/memberProfileService";

type MemberProfileViewProps = {
  member: Member;
  totalMeetings: number;
  attendanceCount: number;
  absenceCount: number;
  attendancePercentage: number;
  loadingAttendanceSummary: boolean;
  attendanceHistory: MemberAttendanceHistoryItem[];
  loadingAttendanceHistory: boolean;
  onBack: () => void;
};

export default function MemberProfileView({
  member,
  totalMeetings,
  attendanceCount,
  absenceCount,
  attendancePercentage,
  loadingAttendanceSummary,
  attendanceHistory,
  loadingAttendanceHistory,
  onBack,
}: MemberProfileViewProps) {
  return (
    <section className="mx-auto w-full max-w-3xl space-y-6 p-4">
      <button
        type="button"
        onClick={onBack}
        className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
      >
        ← Regresar a miembros
      </button>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 bg-slate-50 px-6 py-5">
          <p className="text-sm font-medium text-slate-500">
            Perfil del miembro
          </p>

          <h1 className="mt-1 text-2xl font-bold text-slate-900">
            {member.full_name}
          </h1>
        </div>

        <div className="grid gap-6 p-6 sm:grid-cols-2">
          <ProfileField
            label="Nombre completo"
            value={member.full_name}
          />

          <ProfileField
            label="Familia"
            value={
              member.family_name ||
              "Sin familia asignada"
            }
          />

          <ProfileField
            label="Organización"
            value={
              member.organization ||
              "Sin organización asignada"
            }
          />

          <ProfileField
            label="Converso reciente"
            value={
              member.recent_convert
                ? "Sí"
                : "No"
            }
          />

          <ProfileField
            label="Estado"
            value={
              member.active
                ? "Activo"
                : "Inactivo"
            }
          />
        </div>
      </div>
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
  <div className="border-b border-slate-200 bg-slate-50 px-6 py-4">
    <h2 className="text-lg font-bold text-slate-900">
      Resumen de asistencia
    </h2>

    <p className="mt-1 text-sm text-slate-500">
      Participación en reuniones sacramentales
    </p>
  </div>

 {loadingAttendanceSummary ? (
  <div className="p-6">
    <p className="text-sm font-medium text-slate-500">
      Cargando resumen de asistencia...
    </p>
  </div>
) : (
  <div className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-4">
    <AttendanceCard
      label="Reuniones registradas"
      value={totalMeetings.toString()}
    />

    <AttendanceCard
      label="Asistencias"
      value={attendanceCount.toString()}
    />

    <AttendanceCard
     label="Ausencias"
     value={absenceCount.toString()}
    />

    <AttendanceCard
      label="Porcentaje"
      value={`${attendancePercentage}%`}
    />
  </div>
)}

<section className="rounded-xl border border-slate-200 bg-white shadow-sm">
  <div className="border-b border-slate-200 px-6 py-4">
    <h2 className="text-lg font-semibold text-slate-900">
      Historial de asistencia
    </h2>

    <p className="mt-1 text-sm text-slate-500">
  Registro completo de asistencia a las reuniones sacramentales.
</p>
  </div>

  {loadingAttendanceHistory ? (
    <div className="px-6 py-8">
      <p className="text-sm font-medium text-slate-500">
        Cargando historial de asistencia...
      </p>
    </div>
  ) : attendanceHistory.length === 0 ? (
    <div className="px-6 py-8">
      <p className="text-sm text-slate-500">
  Todavía no existen reuniones registradas.
</p>
    </div>
  ) : (
    <div className="divide-y divide-slate-200">
      {attendanceHistory.map(
        (historyItem) => (
          <div
            key={historyItem.meetingId}
            className="flex items-center justify-between px-6 py-4"
          >
            <div>
              <p className="font-medium text-slate-900">
                {formatAttendanceDate(
                  historyItem.meetingDate,
                )}
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Reunión sacramental
              </p>
            </div>

{historyItem.status ===
"present" ? (
  <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
    Presente
  </span>
) : (
  <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
    Ausente
  </span>
)}
          </div>
        ),
      )}
    </div>
  )}
</section>

</div>
    </section>
  );
}

type ProfileFieldProps = {
  label: string;
  value: string;
};

function ProfileField({
  label,
  value,
}: ProfileFieldProps) {
  return (
    <div>
      <p className="text-sm font-medium text-slate-500">
        {label}
      </p>

      <p className="mt-1 text-base font-semibold text-slate-900">
        {value}
      </p>
    </div>
  );
}

type AttendanceCardProps = {
  label: string;
  value: string;
};

function AttendanceCard({
  label,
  value,
}: AttendanceCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-sm font-medium text-slate-500">
        {label}
      </p>

      <p className="mt-2 text-2xl font-bold text-slate-900">
        {value}
      </p>
    </div>
  );
}

function formatAttendanceDate(
  meetingDate: string,
) {
  const [year, month, day] =
    meetingDate
      .split("-")
      .map(Number);

  const date = new Date(
    year,
    month - 1,
    day,
  );

  return new Intl.DateTimeFormat(
    "es-GT",
    {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    },
  ).format(date);
}