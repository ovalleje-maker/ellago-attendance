import { useMemo } from "react";
import type { Member } from "@/types/member";
import type {
  FamilyStatistic,
  OrganizationStatistic,
} from "@/types/dashboard";
import DashboardMetric from "@/components/dashboard/DashboardMetric";
import OrganizationStatistics from "@/components/dashboard/OrganizationStatistics";
import AbsentFamilies from "@/components/dashboard/AbsentFamilies";
import RecentConverts from "@/components/dashboard/RecentConverts";
import SummaryMember from "@/components/attendance/SummaryMember";
import EmptyMessage from "@/components/ui/EmptyMessage";
import {
  formatMeetingDate,
} from "@/utils/dates";
import type {
  HistoricalMeeting,
  MemberAttendanceHistory,
} from "@/types/attendance";

import AttendanceFollowUp from "@/components/dashboard/AttendanceFollowUp";
import AttendanceHistoryTable from "@/components/dashboard/AttendanceHistoryTable";
import {
  buildDisplayName,
} from "@/utils/memberNames";

type BishopDashboardProps = {
  members: Member[];
  presentMemberIds: Set<string>;
  meetingDate: string;
  historicalMeetings: HistoricalMeeting[];
  memberHistories: MemberAttendanceHistory[];
};

export default function BishopDashboard({
  members,
  presentMemberIds,
  meetingDate,
  historicalMeetings,
  memberHistories,
}: BishopDashboardProps) {
  const presentMembers = useMemo(
    () =>
      members.filter((member) =>
        presentMemberIds.has(member.id),
      ),
    [members, presentMemberIds],
  );

  const absentMembers = useMemo(
    () =>
      members.filter(
        (member) =>
          !presentMemberIds.has(member.id),
      ),
    [members, presentMemberIds],
  );

  const attendancePercentage =
    members.length === 0
      ? 0
      : Math.round(
          (presentMembers.length / members.length) *
            100,
        );

  const organizationStatistics =
    useMemo<OrganizationStatistic[]>(() => {
      const statisticsMap =
        new Map<string, OrganizationStatistic>();

      members.forEach((member) => {
        const current =
          statisticsMap.get(member.organization) ?? {
            organization: member.organization,
            total: 0,
            present: 0,
            absent: 0,
            percentage: 0,
          };

        current.total += 1;

        if (presentMemberIds.has(member.id)) {
          current.present += 1;
        } else {
          current.absent += 1;
        }

        statisticsMap.set(
          member.organization,
          current,
        );
      });

      return Array.from(
        statisticsMap.values(),
      )
        .map((statistic) => ({
          ...statistic,
          percentage:
            statistic.total === 0
              ? 0
              : Math.round(
                  (statistic.present /
                    statistic.total) *
                    100,
                ),
        }))
        .sort((statisticA, statisticB) =>
          statisticA.organization.localeCompare(
            statisticB.organization,
            "es",
          ),
        );
    }, [members, presentMemberIds]);

  const familyStatistics =
    useMemo<FamilyStatistic[]>(() => {
      const familyMap = new Map<
        string,
        {
          total: number;
          present: number;
        }
      >();

      members.forEach((member) => {
        const familyName =
          member.family_name?.trim() ||
          "Sin familia";

        const current =
          familyMap.get(familyName) ?? {
            total: 0,
            present: 0,
          };

        current.total += 1;

        if (presentMemberIds.has(member.id)) {
          current.present += 1;
        }

        familyMap.set(familyName, current);
      });

      return Array.from(familyMap.entries()).map(
        ([familyName, values]) => {
          const absent =
            values.total - values.present;

          return {
            familyName,
            total: values.total,
            present: values.present,
            absent,
            allPresent:
              values.present === values.total,
            allAbsent: values.present === 0,
          };
        },
      );
    }, [members, presentMemberIds]);

  const presentFamilies =
    familyStatistics.filter(
      (family) => family.present > 0,
    ).length;

  const absentFamilies =
    familyStatistics.filter(
      (family) => family.allAbsent,
    ).length;

  const recentConverts = members.filter(
    (member) => member.recent_convert,
  );

  const presentRecentConverts =
    recentConverts.filter((member) =>
      presentMemberIds.has(member.id),
    ).length;

  return (
    <section>
      <div className="rounded-2xl bg-emerald-800 p-6 text-white shadow-sm">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-100">
          Dashboard
        </p>

        <h1 className="mt-2 text-2xl font-bold sm:text-3xl">
          Resumen del Obispado
        </h1>

        <p className="mt-2 capitalize text-emerald-100">
          {formatMeetingDate(meetingDate)}
        </p>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <DashboardMetric
          label="Miembros registrados"
          value={members.length}
          description="Miembros visibles para tu cuenta"
        />

        <DashboardMetric
          label="Presentes"
          value={presentMembers.length}
          description="Marcados en esta reunión"
        />

        <DashboardMetric
          label="Ausentes"
          value={absentMembers.length}
          description="Sin registro de asistencia"
        />

        <DashboardMetric
          label="Asistencia general"
          value={`${attendancePercentage}%`}
          description="Porcentaje de miembros presentes"
        />
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <DashboardMetric
          label="Familias presentes"
          value={presentFamilies}
          description="Al menos un integrante presente"
        />

        <DashboardMetric
          label="Familias ausentes"
          value={absentFamilies}
          description="Ningún integrante presente"
        />

        <DashboardMetric
          label="Conversos recientes"
          value={recentConverts.length}
          description="Registrados en el directorio"
        />

        <DashboardMetric
          label="Conversos presentes"
          value={presentRecentConverts}
          description="Presentes en esta reunión"
        />
      </div>

      <div className="mt-4">
        <OrganizationStatistics
          statistics={organizationStatistics}
        />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <AbsentFamilies
          families={familyStatistics}
        />

        <RecentConverts
          members={members}
          presentMemberIds={presentMemberIds}
        />
      </div>

      <section className="mt-4 rounded-2xl bg-white p-5 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-widest text-red-700">
          Seguimiento
        </p>

        <h2 className="mt-1 text-xl font-bold">
          Miembros ausentes
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Esta lista corresponde únicamente a la
          fecha seleccionada.
        </p>

        <div className="mt-4 space-y-3">
          {absentMembers
            .sort((memberA, memberB) =>
            buildDisplayName(
              memberA,
            ).localeCompare(
              buildDisplayName(
                memberB,
              ),
              "es",
            )  ,
            )
            .map((member) => (
              <SummaryMember
                key={member.id}
                member={member}
                status="Ausente"
              />
            ))}

          {absentMembers.length === 0 && (
            <EmptyMessage message="No hay miembros ausentes en esta reunión." />
          )}
        </div>
      </section>

    <div className="mt-4">
  <AttendanceFollowUp
    members={members}
    histories={memberHistories}
  />
</div>

<div className="mt-4">
  <AttendanceHistoryTable
    members={members}
    histories={memberHistories}
    dates={historicalMeetings.map(
      (meeting) => meeting.meeting_date,
    )}
  />
</div>
    </section>
  );
}