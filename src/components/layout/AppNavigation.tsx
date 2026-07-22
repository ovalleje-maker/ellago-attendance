import NavigationButton from "@/components/ui/NavigationButton";
import type { AppTab } from "@/types/navigation";

type AppNavigationProps = {
  activeTab: AppTab;
  onTabChange: (tab: AppTab) => void;
  canViewBishopDashboard: boolean;
};

export default function AppNavigation({
  activeTab,
  canViewBishopDashboard,
  onTabChange,
}: AppNavigationProps) {
  return (
    <nav className="sticky top-0 z-20 border-b border-slate-200 bg-white shadow-sm">
    <div className="mx-auto grid max-w-5xl grid-cols-3 sm:grid-cols-6">
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

        <NavigationButton
          active={activeTab === "members"}
          label="Miembros"
          onClick={() =>
            onTabChange("members")
          }
        />

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