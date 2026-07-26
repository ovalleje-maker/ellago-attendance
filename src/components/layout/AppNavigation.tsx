import NavigationButton from "@/components/ui/NavigationButton";
import type { AppTab } from "@/types/navigation";

type AppNavigationProps = {
  activeTab: AppTab;
  onTabChange: (tab: AppTab) => void;
  canViewBishopDashboard: boolean;
  canManageMembers: boolean;
  canChangeMemberStatus: boolean;
};

export default function AppNavigation({
  activeTab,
  canViewBishopDashboard,
  canManageMembers,
  canChangeMemberStatus,
  onTabChange,
}: AppNavigationProps) {
  return (
    <nav className="sticky top-0 z-20 border-b border-slate-200 bg-white shadow-sm">
    <div className="mx-auto grid max-w-6xl grid-cols-3 sm:grid-cols-7">
      {canViewBishopDashboard && (
        <NavigationButton
          active={activeTab === "dashboard"}
          label="Dashboard"
          onClick={() =>
            onTabChange("dashboard")
        }
     />
)}

        <NavigationButton
          active={activeTab === "attendance"}
          label="Asistencia"
          onClick={() =>
            onTabChange("attendance")
          }
        />

        <NavigationButton
          active={activeTab === "summary"}
          label="Resumen"
          onClick={() =>
            onTabChange("summary")
          }
        />

        {canManageMembers && (
          <NavigationButton
            active={activeTab === "members"}
            label="Miembros"
            onClick={() =>
              onTabChange("members")
            }
          />
        )}

        {canManageMembers && (
          <NavigationButton
            active={activeTab === "visitors"}
            label="Visitantes"
            onClick={() =>
              onTabChange("visitors")
            }
          />
        )}

        {canChangeMemberStatus && (
          <NavigationButton
            active={
              activeTab ===
              "inactive-members"
            }
            label="Inactivos"
            onClick={() =>
              onTabChange(
                "inactive-members",
              )
            }
          />
        )}

        <NavigationButton
          active={activeTab === "account"}
          label="Mi cuenta"
          onClick={() =>
            onTabChange("account")
        }
      />
      </div>
    </nav>
  );
}