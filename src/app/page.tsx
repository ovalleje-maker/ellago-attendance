"use client";

import AttendanceView from "@/components/attendance/AttendanceView";
import BishopDashboard from "@/components/dashboard/BishopDashboard";
import AppHeader from "@/components/layout/AppHeader";
import AppNavigation from "@/components/layout/AppNavigation";
import MembersView from "@/components/members/MembersView";
import InactiveMembersView from "@/components/members/InactiveMembersView";
import MemberProfileView from "@/components/members/MemberProfileView";
import AttendanceSummaryView from "@/components/summary/AttendanceSummaryView";
import ErrorAlert from "@/components/ui/ErrorAlert";

import {
  useAttendanceApp,
} from "@/hooks/useAttendanceApp";

export default function Home() {
  const app = useAttendanceApp();

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <AppHeader />

      <AppNavigation
        activeTab={app.activeTab}
        onTabChange={app.setActiveTab}
      />

      <div className="mx-auto max-w-5xl p-4 sm:p-6">
        <ErrorAlert
          message={app.profileError}
        />

        <ErrorAlert
          message={app.errorMessage}
        />

        <ErrorAlert
          message={app.historyError}
        />

        {app.loading && (
          <div className="mb-4 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm font-semibold text-blue-800">
            Cargando información desde Supabase...
          </div>
        )}

        {app.activeTab === "dashboard" && (
          <BishopDashboard
            members={app.members}
            presentMemberIds={
              app.presentMemberIds
            }
            meetingDate={
              app.meetingDate
            }
            historicalMeetings={
              app.historicalMeetings
            }
            memberHistories={
              app.memberHistories
            }
          />
        )}

        {app.activeTab === "attendance" && (
          <AttendanceView
            meetingDate={
              app.meetingDate
            }
            attendanceSearch={
              app.attendanceSearch
            }
            members={app.members}
            filteredMembers={
              app.filteredAttendanceMembers
            }
            presentMembers={
              app.presentMembers
            }
            absentMembers={
              app.absentMembers
            }
            families={app.families}
            presentMemberIds={
              app.presentMemberIds
            }
            changingAttendance={
              app.changingAttendance
            }
            attendancePercentage={
              app.attendancePercentage
            }
            loadingMembers={
              app.loadingMembers
            }
            loadingAttendance={
              app.loadingAttendance
            }
            canRecordAttendance={
              app.canRecordAttendance
            }
            onMeetingDateChange={
              app.setMeetingDate
            }
            onSearchChange={
              app.setAttendanceSearch
            }
            onClearAttendance={
              app.clearMeetingAttendance
            }
            onToggleAttendance={
              app.toggleAttendance
            }
            onToggleFamily={
              app.markWholeFamily
            }
          />
        )}

        {app.activeTab === "summary" && (
          <AttendanceSummaryView
            meetingDate={
              app.meetingDate
            }
            presentMembers={
              app.presentMembers
            }
            absentMembers={
              app.absentMembers
            }
            attendancePercentage={
              app.attendancePercentage
            }
          />
        )}

        {app.activeTab === "members" &&
        !app.selectedMember && (
          <MembersView
            members={app.members}
            filteredMembers={
              app.filteredDirectoryMembers
            }
            memberSearch={
              app.memberSearch
            }
            fullName={app.fullName}
            familyName={
              app.familyName
            }
            organization={
              app.organization
            }
            recentConvert={
              app.recentConvert
            }
            loadingMembers={
              app.loadingMembers
            }
            savingMember={
              app.savingMember
            }
            canManageMembers={
              app.canManageMembers
            }
            canChangeMemberStatus={app.canChangeMemberStatus}
            editingMember={app.editingMember}
            savingMemberEdit={app.savingMemberEdit}
            onViewMember={app.openMemberProfile}
            onStartEditMember={app.startEditMember}
            onCancelEditMember={app.cancelEditMember}
            onSaveMemberEdit={app.saveMemberEdit}
            onSearchChange={
              app.setMemberSearch
            }
            onFullNameChange={
              app.setFullName
            }
            onFamilyNameChange={
              app.setFamilyName
            }
            onOrganizationChange={
              app.setOrganization
            }
            onRecentConvertChange={
              app.setRecentConvert
            }
            onAddMember={
              app.addMember
            }
            onDeactivateMember={
              app.deactivateMember
            }
          />
        )}

        {app.activeTab === "members" &&
  app.selectedMember && (
<MemberProfileView
  member={
    app.selectedMember
  }
totalMeetings={
  app.memberAttendanceSummary
    .totalMeetings
}
attendanceCount={
  app.memberAttendanceSummary
    .attendanceCount
}
absenceCount={
  app.memberAttendanceSummary
    .absenceCount
}
attendancePercentage={
  app.memberAttendanceSummary
    .attendancePercentage
}
loadingAttendanceSummary={
  app.loadingMemberAttendanceSummary
}
attendanceHistory={
  app.memberAttendanceHistory
}
loadingAttendanceHistory={
  app.loadingMemberAttendanceHistory
}
  onBack={
    app.closeMemberProfile
  }
/>
)}

{app.activeTab ===
  "inactive-members" && (
  <InactiveMembersView
    members={
      app.inactiveMembers
    }
    filteredMembers={
      app.filteredInactiveMembers
    }
    search={
      app.inactiveMemberSearch
    }
    loading={
      app.loadingInactiveMembers
    }
    canChangeMemberStatus={app.canChangeMemberStatus}
    reactivatingMemberId={
      app.reactivatingMemberId
    }
    onSearchChange={
      app.setInactiveMemberSearch
    }
    onReactivateMember={
      app.reactivateMember
    }
  />
)}

      </div>
    </main>
  );
}